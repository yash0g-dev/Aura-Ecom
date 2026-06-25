import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { CategoryExplorer } from "../components/CategoryExplorer";

interface FeaturedProduct {
  _id: string;
  name: string;
  price: number;
  brand: string;
  images: string[];
}

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(
    [],
  );
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(true);

  // Sync Featured items with your updated high-speed Redis backend layer
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        console.log("fetching featured via Axios instance...");
        setIsLoadingFeatured(true);

        // CLEAN REFACTOR: Axios handles the JSON parsing and error status internally
        const res = await axiosInstance.get<FeaturedProduct[]>(
          "/api/products/featured",
        );

        // With Axios, the actual backend payload data array lives right on res.data
        setFeaturedProducts(res.data);
      } catch (err: any) {
        // Axios errors store their server response message deep inside err.response?.data
        const errorMsg = err.response?.data?.message || err.message;
        console.error("Redis featured fetch fallback:", errorMsg);
        toast.error("Could not sync streaming showcase catalog");
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white selection:bg-purple-500/30 selection:text-purple-200">
      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 md:pt-40 md:pb-36 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Background Ambient Diffusion Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Dynamic Micro Glow Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-950 border border-gray-800/80 rounded-full text-purple-400 mb-6 tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />✨
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
            onClick={() => {
              document
                .getElementById("explore-matrix")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-100 transition duration-300 shadow-lg shadow-white/5 active:scale-95"
          >
            Shop the Collection
          </button>
          <button className="px-8 py-4 bg-gray-800/40 text-gray-200 font-semibold rounded-xl border border-gray-700/60 hover:bg-gray-800/80 transition duration-300 active:scale-95">
            View Lookbook
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
            to="/"
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
              <div
                key={product._id}
                className="group relative flex flex-col rounded-2xl bg-gray-950/40 border border-gray-800/60 overflow-hidden hover:border-gray-700/80 transition duration-300 shadow-xl"
              >
                {/* Product Media Display Frame */}
                <div className="relative aspect-square w-full bg-gray-900 overflow-hidden">
                  <img
                    src={
                      product.images[0] ||
                      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-gray-950/80 border border-gray-700/50 backdrop-blur-md rounded-md text-purple-400">
                    Hot Drop
                  </span>
                </div>

                {/* Product Content Details Body */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {product.brand}
                    </span>
                    <h3 className="font-bold text-gray-200 group-hover:text-white transition mt-0.5 text-base line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-black text-white mt-1">
                      ${product.price}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      toast.success(`Added ${product.name} to cart!`)
                    }
                    className="w-full py-2.5 bg-gray-800/60 hover:bg-purple-600 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 border border-gray-700/60 hover:border-transparent active:scale-[0.98]"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
