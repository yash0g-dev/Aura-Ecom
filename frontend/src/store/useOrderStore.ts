import { create } from "zustand";
import axiosInstance from "../lib/axios";
import axios from "axios";
import { toast } from "react-hot-toast";

export interface IOrder {
  _id: string;
  totalAmount: number;
  razorpayOrderId: string;
  paymentStatus: "pending" | "paid" | "failed";
  status: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

interface OrderState {
  orders: IOrder[];
  currentOrder: IOrder | null;
  isLoading: boolean;
  error: string | null;

  // Razorpay Gateway Pipeline Actions
  initiateCheckoutSession: (
    products: Array<{ _id: string; quantity: number; selectedSize: string }>,
    couponCode?: string | null,
    shippingAddress?: IShippingAddress,
  ) => Promise<any | null>;

  verifyPaymentSignature: (verificationData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<boolean>;

  // Order Logistics Actions
  fetchUserOrders: () => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  // 🪙 STEP 1: Request a live Razorpay transaction order initialization from your backend
  initiateCheckoutSession: async (
    products,
    couponCode = null,
    shippingAddress,
  ) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await axiosInstance.post("/api/payments/create-order", {
        products,
        couponCode,
        shippingAddress,
      });

      if (data.success) {
        return data.order; // This contains the unique ID, raw amount in paise, currency, etc.
      }
      return null;
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to initialize payment gateway";
      toast.error(msg ?? "Razorpay handshake error");
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // 🛡️ STEP 2: Submit the cryptographic hashes back to the backend verify route
  verifyPaymentSignature: async (verificationData) => {
    try {
      set({ isLoading: true });
      const { data } = await axiosInstance.post(
        "/api/payments/verify-payment",
        verificationData,
      );

      if (data.success) {
        toast.success("Payment authorized and verified successfully!");
        return true;
      }
      return false;
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Signature validation failed";
      toast.error(msg ?? "Tampering block triggered");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // 📦 FETCH HISTORY: Query tracking profiles
  fetchUserOrders: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.get("/api/orders/my-orders");
      set({ orders: data });
    } catch (error) {
      set({
        error: axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Failed to load history",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // 🛑 CANCEL ORDER: Update status gracefully if it hasn't shipped yet
  cancelOrder: async (orderId) => {
    try {
      set({ isLoading: true });
      await axiosInstance.put(`/api/orders/${orderId}/cancel`);

      set((state) => ({
        orders: state.orders.map((o) =>
          o._id === orderId ? { ...o, status: "cancelled" as const } : o,
        ),
      }));
      toast.success("Order cancelled and refund processing initiated.");
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Cancellation failed";
      toast.error(msg ?? "Unable to cancel shipment");
    } finally {
      set({ isLoading: false });
    }
  },
}));
