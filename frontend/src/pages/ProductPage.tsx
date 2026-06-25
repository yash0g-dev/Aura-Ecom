import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { PageLoader } from "../components/PageLoader";
import { Star, ShoppingBag, ShieldCheck, RefreshCw } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

export function ProductPage(): React.JSX.Element {
  // useParams treats keys as optional strings, so we destructure with fallback or casting safely
  const { addToCart } = useCartStore();
  const { slug } = useParams<{ slug: string }>();
  const { currentProduct, fetchProductBySlug, isLoadingProduct } =
    useProductStore();

  const [activeImage, setActiveImage] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug);
    }
    setActiveImage(0);
    setSelectedSize("");
  }, [slug, fetchProductBySlug]);

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-400">
          The product you are looking for does not exist or has changed
          locations.
        </p>
      </div>
    );
  }

  const sizes: string[] = ["S", "M", "L", "XL", "XXL"];
  const formattedPrice: string = (currentProduct.price / 100).toFixed(2);

  // Fallback handler if a curated image link encounters a loading or network crash
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: MULTI-IMAGE MEDIA GALLERY */}
        <div className="lg:col-span-7 grid grid-cols-12 gap-4 sticky top-24">
          {/* Thumbnails Sidebar */}
          <div className="col-span-2 space-y-3">
            {currentProduct.images?.map((img: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={`w-full aspect-square bg-gray-800 rounded-md overflow-hidden border-2 transition-all ${
                  activeImage === idx
                    ? "border-white scale-95"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Hero Viewport Window */}
          <div className="col-span-10 aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden relative group">
            <img
              src={currentProduct.images?.[activeImage]}
              alt={currentProduct.name}
              onError={handleImageError}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {currentProduct.discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider">
                {currentProduct.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BRAND INFORMATION & CONVERSION GRID */}
        <div className="lg:col-span-5 space-y-6 lg:pl-4">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-widest mb-1">
              {currentProduct.brand} • {currentProduct.department}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase mb-2">
              {currentProduct.name}
            </h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold ml-1 text-white">
                  {currentProduct.rating}
                </span>
              </div>
              <span className="text-gray-500 text-sm">|</span>
              <span className="text-gray-400 text-sm underline cursor-pointer">
                {currentProduct.numReviews} Reviews
              </span>
            </div>
          </div>

          {/* Pricing Deck */}
          <div className="border-y border-gray-800 py-4 flex items-baseline gap-3">
            <span className="text-3xl font-black">${formattedPrice}</span>
            {currentProduct.discount > 0 && (
              <span className="text-gray-500 line-through text-lg font-medium">
                $
                {(
                  (currentProduct.price * (1 + currentProduct.discount / 100)) /
                  100
                ).toFixed(2)}
              </span>
            )}
          </div>

          {/* Sizing Deck Grid Layout */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold uppercase tracking-wider">
                Select Size
              </span>
              <button
                type="button"
                className="text-gray-400 underline hover:text-white transition-colors"
              >
                Size Guide
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-center rounded font-bold text-sm tracking-wide transition-all border ${
                    selectedSize === size
                      ? "bg-white text-black border-white"
                      : "bg-gray-800 text-white border-transparent hover:border-gray-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Bag CTA Trigger */}
          <button
            type="button"
            onClick={() => addToCart(currentProduct, selectedSize)}
            disabled={!selectedSize || currentProduct.stock === 0}
            className={`w-full py-4 rounded-full flex items-center justify-center gap-2 font-extrabold uppercase tracking-widest transition-all ${
              currentProduct.stock === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : !selectedSize
                  ? "bg-emerald-600 text-white opacity-70 hover:opacity-100 cursor-pointer"
                  : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/20 active:scale-[0.99]"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {currentProduct.stock === 0
              ? "Out of Stock"
              : !selectedSize
                ? "Select a Size"
                : "Add to Bag"}
          </button>

          {/* Technical Specs & Description */}
          <div className="space-y-2 pt-4 border-t border-gray-800">
            <h3 className="font-bold uppercase text-sm tracking-wider">
              Product Description
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {currentProduct.description ||
                "Engineered for maximum endurance and movement. Crafted from premium breathable yarns to offer ultra-light ventilation during structural athletic training matrices."}
            </p>
          </div>

          {/* Secure Trust Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-xs text-gray-400 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Full 2-Year Premium Warranty Protection Cover</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Free 30-Day Hassle-Free Returns & Size Swaps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
