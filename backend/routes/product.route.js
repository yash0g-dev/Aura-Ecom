import express from "express";
import {
  getAllProducts,
  getStoreHierarchy, // Added for your department/category/subcategory tree
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct, // Fixed plural typo to match controller
  getProductBySlug,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/test-ping", (req, res) => {
  return res.json({ message: "Backend is fully awake and responding!" });
});
// Public Routes (Anyone can browse products)
router.get("/", getAllProducts);
router.get("/hierarchy", getStoreHierarchy); // Route for your fashion tree navigation
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.get("/single/:slug", getProductBySlug);

// Protected Admin-Only Routes (Requires authentication and admin privileges)
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
