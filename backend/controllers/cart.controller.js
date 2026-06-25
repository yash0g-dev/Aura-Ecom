import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";

export const getCartProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ _id: { $in: req.user.cartItems } });
  const cartItems = products.map((product) => {
    const item = req.user.cartItems.find(
      (cartItem) => cartItem.id === product.id,
    );
    return { ...product.toObject(), quantity: item.quantity };
  });
  res.status(200).json(cartItems);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;
  try {
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.cartItems += 1;
    } else {
      user.cartItems.push(productId);
    }
  } catch (error) {
    res.status(500);
    console.error("something went wrong while add item to cart ");
    throw new Error(`failed operation adding to cart ${error.message}`);
  }

  await user.save();
});

export const removeAllFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;
  if (!productId) {
    user.cartItems = [];
  } else {
    user.cartItems = user.cartItems.filter((item) => item.id !== productId);
  }
  await user.save();
  res.json(user.cartItems);
});

export const updateQuantity = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { quantity } = req.body;
  const user = req.user;
  const existingItem = user.cartItems.find((item) => item.id === productId);
  if (existingItem) {
    if (quantity === 0) {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
      await user.save();
      return res.json(user.cartItems);
    }
    existingItem.quantity = quantity;
    await user.save();
    res.json(user.cartItems);
  } else {
    res.status(404);
    throw new Error("product not found");
  }
});

