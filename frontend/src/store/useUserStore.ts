import { create } from "zustand";
import axiosInstance from "../lib/axios";
import axios from "axios";
import { toast } from "react-hot-toast";

// 1. Declare the concrete inner Address Shape matching the backend
export interface ISavedAddress {
  _id?: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// 2. Extend User Profile metadata configurations
export interface IUserProfile {
  phone: string;
  avatar: string;
  savedAddresses: ISavedAddress[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  profile: IUserProfile;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  // 🚀 New Profile Management Mutations
  addAddress: (addressData: Omit<ISavedAddress, "_id">) => Promise<void>;
  updateProfileDetails: (profileData: {
    phone?: string;
    avatar?: string;
  }) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isCheckingAuth: false,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });
      set({ user: data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errMsg = error.response?.data?.message ?? "Login failed";
        set({ error: errMsg });
        toast.error(errMsg);
        throw error;
      }
      toast.error("Something went wrong");
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.post("/api/auth/signup", {
        name,
        email,
        password,
      });
      set({ user: data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errMsg = error.response?.data?.message ?? "Signup failed";
        set({ error: errMsg });
        toast.error(errMsg);
        throw error;
      }
      toast.error("Something went wrong");
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.post("/api/auth/logout");
      set({ user: null });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errMsg = error.response?.data?.message ?? "Logout failed";
        set({ error: errMsg });
        toast.error(errMsg);
        throw error;
      }
      toast.error("Something went wrong");
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true, error: null });
      const { data } = await axiosInstance.get("/api/auth/profile");
      set({ user: data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          set({ user: null, error: null });
          return;
        }
        const message =
          error.response?.data?.message ?? "Authentication handshake failed";
        set({ user: null, error: message });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // 🚀 ACTION: Add a New Shipping Address to the current profile
  addAddress: async (addressData) => {
    try {
      set({ isLoading: true });
      const { data } = await axiosInstance.post(
        "/api/auth/profile/addresses",
        addressData,
      );

      const currentUser = get().user;
      if (currentUser && data.success) {
        // Hydrate the store's profile array with updated values returned from backend
        set({
          user: {
            ...currentUser,
            profile: {
              ...currentUser.profile,
              savedAddresses: data.addresses,
            },
          },
        });
        toast.success("Address added to your shipping profile!");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to add address";
      toast.error(message ?? "Failed to register address");
    } finally {
      set({ isLoading: false });
    }
  },

  // 🚀 ACTION: Update Profile Core Configurations (Phone, Avatar)
  updateProfileDetails: async (profileData) => {
    try {
      set({ isLoading: true });
      const { data } = await axiosInstance.put(
        "/api/auth/profile",
        profileData,
      );

      const currentUser = get().user;
      if (currentUser && data.success) {
        set({
          user: {
            ...currentUser,
            profile: {
              ...currentUser.profile,
              phone: data.profile.phone,
              avatar: data.profile.avatar,
            },
          },
        });
        toast.success("Profile saved successfully.");
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to update profile";
      toast.error(message ?? "Profile shift error");
    } finally {
      set({ isLoading: false });
    }
  },
}));
