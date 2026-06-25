import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js"; // Kept consistent with your import path
import { redis } from "../lib/redis.js"; // Corrected spelling typo
import cloudinary from "../lib/cloudinary.js";
import { uploadToCloudinary } from "../middlewares/upload.middleware.js";

// @desc    Get all active products
// @route   GET /api/products
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true });
  res.status(200).json(products);
});

// @desc    Get dynamic store category/department structural tree
// @route   GET /api/products/hierarchy
// controllers/product.controller.js

export const getStoreHierarchy = asyncHandler(async (req, res) => {
  try {
    const hierarchy = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { department: "$department", category: "$category" },
          subCategories: { $addToSet: "$subCategory" },
        },
      },
      {
        $group: {
          _id: "$_id.department",
          categories: {
            $push: { name: "$_id.category", subCategories: "$subCategories" },
          },
        },
      },
      {
        $project: { _id: 0, department: "$_id", categories: 1 },
      },
    ]);

    // CRITICAL FIX: Ensure a response is ALWAYS sent back, even if it's an empty array
    if (!hierarchy || hierarchy.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(hierarchy);
  } catch (error) {
    // Prevent quiet thread hangs by sending a proper status code
    return res.status(500).json({
      message: "Aggregation pipeline break",
      error: error.message,
    });
  }
});

// @desc    Get featured products (Redis Cached)
// @route   GET /api/products/featured

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  let featuredProducts = null;

  // Wrap Redis in an isolated try/catch block so it never blocks the execution flow
  try {
    featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }
  } catch (redisError) {
    console.error(
      "Redis connection timed out or is offline. Falling back to MongoDB:",
      redisError.message,
    );
  }

  // Safe Fallback: Direct query to MongoDB database
  featuredProducts = await Product.find({
    isFeatured: true,
    isActive: true,
  }).lean();

  if (!featuredProducts || featuredProducts.length === 0) {
    return res.status(200).json([]); // Always return an empty array instead of throwing a 404 block
  }

  // Try to populate cache, bypass if connection is broken
  try {
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (e) {}

  return res.status(200).json(featuredProducts);
});

// @route   POST /api/products
// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400);
    throw new Error("No id attached with request");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Clean up image asset inside Cloudinary bucket
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    const publicId = firstImage.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);
    console.log("Deleted image from Cloudinary storage bucket");
  }

  const wasFeatured = product.isFeatured;
  await product.deleteOne();

  // If the deleted product was featured, refresh the cache
  if (wasFeatured) {
    await updateFeaturedProductsCache();
  }

  res.status(200).json({ message: "Product deleted successfully" });
});

// @desc    Get 3 random products for Frontpage dynamics
// @route   GET /api/products/recommendations
export const getRecommendedProducts = asyncHandler(async (req, res) => {
  const products = await Product.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: 3 } },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        images: 1, // Corrected to use images array matching your model
        price: 1,
        slug: 1,
      },
    },
  ]);
  res.status(200).json(products);
});

// @desc    Get products by category path parameters
// @route   GET /api/products/category/:category
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params; // Extract parameter from URL query params

  const products = await Product.find({ category, isActive: true });
  if (!products || products.length === 0) {
    res.status(404);
    throw new Error(`No products found in category: ${category}`);
  }

  res.status(200).json(products);
});

// @desc    Toggle product featured status flag & sync cache
// @route   PATCH /api/products/:id/toggle-featured
export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Flip status flag toggles safely
  product.isFeatured = !product.isFeatured;
  const updatedProduct = await product.save();

  // Re-sync redis state immediately to prevent stale frontend render blocks
  await updateFeaturedProductsCache();

  res.status(200).json(updatedProduct);
});

// Helper utility: Re-usable cache invalidation method
export const updateFeaturedProductsCache = async () => {
  try {
    const featuredProducts = await Product.find({
      isFeatured: true,
      isActive: true,
    }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    console.log("Redis featured products cache updated successfully");
  } catch (err) {
    console.error("Failed to sync Redis cache:", err.message);
  }
};

// @desc    Get a single product by its unique URL slug
// @route   GET /api/products/single/:slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Use .lean() for faster, read-only hydration performance
  const product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    res.status(404);
    throw new Error(`Product not found with slug: ${slug}`);
  }

  // Returning an object wrapped in a clear, consistent structure
  // matching what your Frontend Zustand store expects to destructure
  res.status(200).json({ product });
});

export const createProduct = async (req, res) => {
  try {
    let imageUrl = "";

    // 1. Intercept the binary stream from the frontend file picker
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    } else {
      return res
        .status(400)
        .json({ message: "A physical image file upload is required." });
    }

    const {
      name,
      description,
      price,
      department,
      category,
      subCategory,
      brand,
      stock,
    } = req.body;

    // 2. Commit the parsed parameters securely to your Mongoose model
    const product = await Product.create({
      name,
      description,
      price: Number(price), // Explicit type conversion handles string payloads from FormData
      stock: Number(stock),
      department,
      category,
      subCategory,
      brand,
      images: [imageUrl], // Stores the optimized secure Cloudinary CDN asset path
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Product controller generation exception:", error);
    res
      .status(500)
      .json({
        message: "Failed to initialize and deploy product specifications.",
      });
  }
};
