import asyncHandler from "express-async-handler";
import Order from "../models/order.model.js";

// @desc    Fetch historical delivery logs for the logged-in user account
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  // Find all orders tied to this user, sorted by newest first
  // We use .populate() to dynamically pull product metadata (like image strings and names)
  const orders = await Order.find({ user: req.user._id })
    .populate({
      path: "products.product",
      select: "name images price description",
    })
    .sort({ createdAt: -1 });

  res.status(200).json(orders);
});

// @desc    Cancel a processing order securely
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Locate the targeted order record entry
  const order = await Order.findById(id);

  if (!order) {
    res.status(404);
    throw new Error("Target order reference tracking data not found");
  }

  // 2. Security Guard: Prevent malicious horizontal privilege escalation attacks
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error(
      "Access Denied: You are not authorized to modify this order configuration",
    );
  }

  // 3. Business Logic Guard: Ensure items haven't already left the fulfillment hub
  if (order.status === "shipped" || order.status === "delivered") {
    res.status(400);
    throw new Error(
      "This shipment has already left our fulfillment hub and cannot be cancelled",
    );
  }

  if (order.status === "cancelled") {
    res.status(400);
    throw new Error(
      "This order session state has already been marked as cancelled",
    );
  }

  // 4. Update order state targets along with payment statuses if applicable
  order.status = "cancelled";

  if (order.paymentStatus === "paid") {
    // If they already paid via Razorpay, flip status to initiate a credit reversal queue tracking point
    order.paymentStatus = "refund_initiated";
  }

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: "Order successfully cancelled. Refund sequence initialized.",
    order: updatedOrder,
  });
});
