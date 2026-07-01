import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";

export const getCartProducts = asyncHandler(async (req, res) => {
  await req.user.populate("cartItems.product");

  const formattedCart = req.user.cartItems
    .filter((item) => item.product != null) // Safety check in case a product was deleted from the DB
    .map((item) => ({
      ...item.product.toObject(),
      quantity: item.quantity,
    }));

  res.status(200).json(formattedCart);
});

// 2. ADD TO CART
export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  try {
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
    }

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    res.status(500);
    console.error("Something went wrong while adding item to cart", error);
    throw new Error(`Failed operation adding to cart: ${error.message}`);
  }
});

// 3. REMOVE FROM CART: Updated to check 'item.product'
export const removeAllFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!productId) {
    user.cartItems = []; // Clear entire cart
  } else {
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId.toString(),
    );
  }

  await user.save();
  res.status(200).json(user.cartItems);
});

// 4. UPDATE QUANTITY: Updated to check 'item.product'
export const updateQuantity = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { quantity } = req.body;
  const user = req.user;

  const existingItem = user.cartItems.find(
    (item) => item.product.toString() === productId.toString(),
  );

  if (existingItem) {
    if (quantity === 0) {
      // Remove item if quantity hits 0
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId.toString(),
      );
      await user.save();
      return res.status(200).json(user.cartItems);
    }

    existingItem.quantity = quantity;
    await user.save();
    res.status(200).json(user.cartItems);
  } else {
    res.status(404);
    throw new Error("Product not found in cart");
  }
});
