import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createCheckoutSession,
  verifyPayment,
} from "../controllers/payment.controller.js";
const router = express.Router();

router.post("/create-order", protectRoute, createCheckoutSession);
router.post("/verify-payment", protectRoute, verifyPayment);

export default router;
