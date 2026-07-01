import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await mongooose.connection.db?.admin().ping();
    const porductCount = await Product.estimatedDocumentCount();
    res.status(200).json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
      porductCount,
      timestamp: Date.now().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      message: error.message,
      timestamp: Date.now().toISOString(),
    });
  }
});

export default router;
