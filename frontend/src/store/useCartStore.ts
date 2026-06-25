import { create } from "zustand";
import { toast } from "react-hot-toast";
import type { ICartItem } from "../types/cart";
import type { IProduct } from "../types/product";

interface CartState {
  cart: ICartItem[];
  addToCart: (product: IProduct, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (product, size) => {
    if (!size) {
      toast.error("Please select a size first!");
      return;
    }

    const currentCart = get().cart;
    const existingItemIdx = currentCart.findIndex(
      (item) => item.product._id === product._id && item.selectedSize === size,
    );

    if (existingItemIdx > -1) {
      const updatedCart = [...currentCart];
      updatedCart[existingItemIdx].quantity += 1;
      set({ cart: updatedCart });
    } else {
      set({
        cart: [...currentCart, { product, quantity: 1, selectedSize: size }],
      });
    }
    toast.success(`${product.name} (${size}) added to bag!`);
  },

  removeFromCart: (productId, size) => {
    const filteredCart = get().cart.filter(
      (item) => !(item.product._id === productId && item.selectedSize === size),
    );
    set({ cart: filteredCart });
    toast.success("Item removed from bag");
  },

  updateQuantity: (productId, size, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, size);
      return;
    }

    const updatedCart = get().cart.map((item) =>
      item.product._id === productId && item.selectedSize === size
        ? { ...item, quantity }
        : item,
    );
    set({ cart: updatedCart });
  },

  clearCart: () => set({ cart: [] }),

  getCartSubtotal: () => {
    return get().cart.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  },
}));
