import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getMyOrders, cancelOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/my-orders", protectRoute, getMyOrders);
router.get("/orders/:id/cancel", protectRoute, cancelOrder);

export default router;
