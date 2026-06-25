import asyncHandler from "express-async-handler";
import { razorpay } from "../lib/razorpay.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import crypto from "crypto";

// @desc    Initiate dynamic checkout session, validate coupons, and register pending orders
// @route   POST /api/payments/create-order
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { products, couponCode, shippingAddress } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error("Invalid or empty products array");
  }

  let totalAmount = 0;
  const structuredOrderProducts = [];

  // 🛡️ Safe Server-Side Price Verification Loop
  for (const item of products) {
    const product = await Product.findById(item._id);

    if (!product) {
      res.status(404);
      throw new Error(`Product mapping broken for ID: ${item._id}`);
    }

    if (
      !item.quantity ||
      item.quantity < 1 ||
      !Number.isInteger(item.quantity)
    ) {
      res.status(400);
      throw new Error(
        `Invalid quantity signature provided for product: ${product.name}`,
      );
    }

    totalAmount += product.price * item.quantity;

    // Build the sub-document to perfectly match your Order schema specifications
    structuredOrderProducts.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price, // Lock historical price down securely
    });
  }

  // 🎫 Server-Side Coupon Verification
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode,
      userId: req.user._id,
      isActive: true,
    });

    if (coupon) {
      discountAmount = Math.round(
        (totalAmount * coupon.discountPercentage) / 100,
      );
      totalAmount -= discountAmount;
    }
  }

  if (totalAmount < 0) totalAmount = 0;

  // 🪙 CRITICAL FIX: Direct 1:1 mapping of lowest sub-units.
  // No multiplying by 100 if database already stores values as base cents integers.
  const amountInPaise = totalAmount;

  // Create official payment mapping order via Razorpay core instances
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
    },
  });

  // 📝 Save your pending placeholder order to MongoDB using camelCase keys matching your model
  await Order.create({
    user: req.user._id,
    products: structuredOrderProducts,
    totalAmount,
    shippingAddress, // 🚀 Saved safely to Mongoose
    razorpayOrderId: order.id,
    paymentStatus: "pending",
    status: "processing", // 🚀 Automatically defaults to processing
    couponCode: couponCode || null,
    discountAmount: discountAmount,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Verify signature hashes from Razorpay gateway and fulfill order releases
// @route   POST /api/payments/verify
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // 🔍 CRITICAL FIX: Look up order using the correct camelCase schema key
  const existingOrder = await Order.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (!existingOrder) {
    res.status(400);
    throw new Error("Order trace reference not found matching transaction ID");
  }

  if (existingOrder.paymentStatus === "paid") {
    res.status(409);
    throw new Error(
      "Conflict: This order session has already been processed and paid",
    );
  }

  const alreadyUsedPayment = await Order.findOne({
    razorpayPaymentId: razorpay_payment_id,
  });

  if (alreadyUsedPayment) {
    res.status(409);
    throw new Error(
      "Conflict: This specific payment transaction identifier has already been claimed",
    );
  }

  // 🛡️ Cryptographic Handshake Signature Verification
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    res.status(400);
    throw new Error(
      "Security Violation: Cryptographic signature verification failed. Potential tampering caught.",
    );
  }

  // 🔓 Payment Fulfillments
  existingOrder.paymentStatus = "paid";
  existingOrder.razorpayPaymentId = razorpay_payment_id;
  await existingOrder.save();

  res.status(200).json({
    success: true,
    message:
      "Payment captured, signature verified, and order fulfilled successfully.",
  });
});
