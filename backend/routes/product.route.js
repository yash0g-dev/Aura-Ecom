import express from "express";
import {
  getAllProducts,
  getStoreHierarchy,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
  getProductBySlug,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/test-ping", (req, res) => {
  return res.json({ message: "Backend is fully awake and responding!" });
});

// Public Routes
router.get("/", getAllProducts);
router.get("/hierarchy", getStoreHierarchy);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.get("/single/:slug", getProductBySlug);

// Protected Admin-Only Routes
router.post(
  "/",
  protectRoute,
  adminRoute,
  upload.single("image"),
  createProduct,
);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
