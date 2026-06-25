import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { CategoryExplorer } from "../components/CategoryExplorer";
import type { IProduct } from "../types/product";
import { useProductStore } from "../store/useProductStore";
import { ProductCard } from "../components/ProductCard";

export function HomePage() {
  const navigate = useNavigate();

  const { featuredProducts, isLoadingFeatured, fetchFeaturedProducts } =
    useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white selection:bg-purple-500/30 selection:text-purple-200">
      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 md:pt-40 md:pb-36 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Background Ambient Diffusion Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Dynamic Micro Glow Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-950 border border-gray-800/80 rounded-full text-purple-400 mb-6 tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
          Drop 01 // Live Fashion Matrix
        </span>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Upgrade your catalog layout with{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Next-Gen Fits.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-light leading-relaxed">
          Don't settle for average. Discover premium tech, aesthetics, and
          minimalist essentials curated for contemporary creators.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10">
          <button
            onClick={() => navigate("/products")} // 👈 UPDATED: Moves users straight to the product matrix
            className="px-8 py-4 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-100 transition duration-300 shadow-lg shadow-white/5 active:scale-95"
          >
            Shop the Collection
          </button>
          <button
            onClick={() => {
              document
                .getElementById("explore-matrix")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-gray-800/40 text-gray-200 font-semibold rounded-xl border border-gray-700/60 hover:bg-gray-800/80 transition duration-300 active:scale-95"
          >
            Explore Categories
          </button>
        </div>
      </section>

      {/* 2. LIVE AGGREGATED CATEGORIES GRID EXPLORER */}
      <section
        id="explore-matrix"
        className="bg-gray-950/20 border-t border-b border-gray-800/40 py-4"
      >
        <CategoryExplorer />
      </section>

      {/* 3. LIVE FEATURED PRODUCTS (POWERED BY REDIS MEMORY STORAGE) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">
              Selected Items
            </h2>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">
              Trending Right Now
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition flex items-center gap-1 group"
          >
            See all products
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Display Manager State Router */}
        {isLoadingFeatured ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
            <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase animate-pulse">
              Syncing Cache Core...
            </p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl max-w-xl mx-auto">
            <p className="text-gray-500 text-sm">
              No items currently flag-featured in store administration config.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
