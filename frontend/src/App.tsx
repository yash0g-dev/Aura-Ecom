import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { HomePage } from "./pages/HomePage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { CartPage } from "./pages/CartPage";
import { CategoryPage } from "./pages/CategoryPage";
import { ProductPage } from "./pages/ProductPage";
import { CheckoutPage } from "./pages/CheckoutPage.tsx";
// import { ProductListingPage } from "./pages/ProductListingPage";

import { Navbar } from "./components/Navbar";
import { PageLoader } from "./components/PageLoader";
import { ProtectedRoute } from "./wrappers/ProtectedRoute";

import { useUserStore } from "./store/useUserStore";
import "./App.css";

function App() {
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth);
  const checkAuth = useUserStore((state) => state.checkAuth);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    checkAuth();
  }, []);

  // COMPLETE AUTH GATEKEEPER
  // If the system is initializing your token handshake, stop everything
  // and render the loader. Do not allow your sub-pages to pre-fetch out of order.
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  // Once authentication is verified (isCheckingAuth === false), mount the workspace layout
  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-900 text-white relative">
        <Navbar />

        <Routes>
          {/* Public Landing Showcase */}
          <Route path="/" element={<HomePage />} />
          {/* Dynamic Catalog Grid */}
          <Route
            path="/shop/:department/:category/:subCategory"
            element={<CategoryPage />}
          />
          <Route path="/product/:slug" element={<ProductPage />} />
          {/* <Route path="/shop/:department/:category" element={<ProductListingPage />} /> */}

          {/* Authentication Paths */}

          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <SignupPage />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage />}
          />
          {/* Protected Space */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
