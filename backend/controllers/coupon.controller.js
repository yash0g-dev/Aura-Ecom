import Coupon from "../models/coupon.model.js";
import asyncHandler from "express-async-handler";

// @desc    Get the currently active coupon assigned to the logged-in user
// @route   GET /api/coupons
export const getCoupon = asyncHandler(async (req, res) => {
  // 🚀 Fixed: Replaced req.user_id with req.user._id matching standard auth middlewares
  const coupon = await Coupon.findOne({
    userId: req.user._id,
    isActive: true,
  });

  res.status(200).json(coupon || null);
});

// @desc    Validate a manual text string coupon code input
// @route   POST /api/coupons/validate
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("Coupon code input string is required");
  }

  // 🚀 Fixed: Case sensitivity fix using the correct Capitalized 'Coupon' model identifier
  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    userId: req.user._id,
    isActive: true,
  });

  if (!coupon) {
    res.status(404);
    return res.json({
      message: "Invalid promo code or coupon not assigned to this account",
    });
  }

  // 🚀 Verification Guard: Handle expirations cleanly based on current datetime
  if (coupon.expirationDate < new Date()) {
    coupon.isActive = false;
    await coupon.save();
    res.status(410); // 410 Gone means resource existed but is officially dead
    throw new Error("This coupon code has expired");
  }

  res.status(200).json({
    message: "Coupon is valid",
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
  });
});
