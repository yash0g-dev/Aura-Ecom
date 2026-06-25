import React from "react";
import { useUserStore } from "../store/useUserStore";
import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CartPage } from "../pages/CartPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { useCartStore } from "../store/useCartStore";

export const Navbar = () => {
  // Simple check for auth (replace with your real state management later)
  const cartItems = useCartStore((state) => state.cart);
  const isLoggedIn = useUserStore((state) => state.user);
  const isAdmin = isLoggedIn && isLoggedIn.role === "admin";
  const logout = useUserStore((state) => state.logout);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/60 bg-gray-950/40 backdrop-blur-md supports-[backdrop-filter]:bg-gray-950/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            {/* Minimalist text/vector logo placeholder instead of a distracting image */}
            <span className="text-purple-400 text-xl font-black tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-90 transition duration-300">
              NEXUS//GEAR
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <a
              href="#"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Shop
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Drops
            </a>
          </nav>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Trigger */}
          <Link
            to="/cart"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 transition rounded-xl bg-gray-800/40 border border-gray-700/40 hover:bg-gray-800/80 hover:text-white active:scale-95"
          >
            <ShoppingCart className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">Cart</span>
            <span className="ml-0.5 px-1.5 py-0.5 text-xs font-bold bg-purple-500 text-white rounded-md">
              {cartItems.length}
            </span>
          </Link>

          <div className="h-5 w-[1px] bg-gray-600/40" />

          {/* Authentication Links */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition rounded-xl"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>

              <Link
                to="/signup"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition rounded-xl shadow-lg shadow-purple-600/20 active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 transition rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition rounded-xl"
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
