import express from "express";
import asyncHandler from "express-async-handler";
import {
  getAnalyticData,
  dailySalesData,
} from "../controllers/analytics.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Past 7 days

    const analyticsData = await getAnalyticData();
    const salesData = await dailySalesData(startDate, endDate);

    res.status(200).json({ analyticsData, dailySalesData: salesData });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error compiling analytics" });
  }
});
export default router;
