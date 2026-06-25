import express from "express";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import orderRoutes from "./routes/order.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
// import { razorpay } from "./lib/razorpay.js";
import cors from "cors";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
      "http://localhost:5179",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use(cookieParser());
app.use((req, res, next) => {
  console.log(
    `📡 [TRAFFIC LOG] Outbound request intercepted: ${req.method} ${req.url}`,
  );
  next();
});
app.use("/api/auth", authRoutes);
app.use((req, res, next) => {
  console.log(
    `🎯 [TRAFFIC LOG] Request safely cleared auth routes. Moving to products...`,
  );
  next();
});
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use((req, res, next) => {
  console.log(
    `⚠️ [TRAFFIC LOG] Request missed all routes! Hitting fallback / errorHandler.`,
  );
  next();
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is running at https://localhost:${PORT} `);
  connectDB();
});
