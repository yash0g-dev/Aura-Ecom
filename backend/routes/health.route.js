import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await mongoose.connection.db?.admin().ping();
    const porductCount = await Product.estimatedDocumentCount();
    res.status(200).json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
      porductCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
