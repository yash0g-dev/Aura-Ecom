import express from "express";
import asyncHandler from "express-async-handler";
import {
  getAnalyticData,
  dailySalesData,
} from "../controllers/analytics.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
const Router = express.Router();

Router.post(
  "/",
  protectRoute,
  asyncHandler(async (req, res) => {
    try {
      const analyticsData = await getAnalyticData();
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dailySalesData = await dailySalesData(startDate, endDate);

      res.status(200).json({
        analyticsData,
        dailySalesData,
      });
    } catch (error) {
      console.log("Error in analytics route");
      res.status(400);
      throw new Error("Error producing analytics", error);
    }
  }),
);

export default Router;
