// src/pages/CategoryPage.tsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, SlidersHorizontal, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { ProductCard } from "../components/ProductCard";
import type { IProduct } from "../types/product"; // 👈 Import your official interface contract

export const CategoryPage = () => {
  const { department, category, subCategory } = useParams<{
    department: string;
    category: string;
    subCategory?: string;
  }>();

  // 1. Fixed: Explicitly typed state array to prevent "never[]" errors
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get<IProduct[]>(
          `/api/products/category/${category}`,
        );

        const data = res.data || [];

        // 2. Fixed: Added optional chaining (?.) on department string matching to guard against database null fields
        if (!subCategory) {
          const generalFiltered = data.filter((product) => {
            return (
              product.department?.toLowerCase() === department?.toLowerCase() &&
              product.isActive !== false
            );
          });
          setProducts(generalFiltered);
          return;
        }

        const formattedSub = subCategory.replace(/-/g, " ").toLowerCase();

        const filtered = data.filter((product) => {
          return (
            product.department?.toLowerCase() === department?.toLowerCase() &&
            product.subCategory?.toLowerCase() === formattedSub &&
            product.isActive !== false
          );
        });

        setProducts(filtered);
      } catch (err) {
        console.error("Error loading products catalog grid:", err);
        toast.error("Failed to load collection items");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchFilteredProducts();
    }
  }, [department, category, subCategory]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-3">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium tracking-wider animate-pulse">
          SOURCING CATALOG...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pt-28">
      {/* Breadcrumbs & Dynamic Headers */}
      <div className="border-b border-gray-800/80 pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20 capitalize">
            {department} / {category}
          </span>
          <h1 className="text-3xl font-black text-white capitalize mt-3 tracking-tight">
            {subCategory ? subCategory.replace(/-/g, " ") : category} Matrix
          </h1>
        </div>
        <button className="flex items-center self-start sm:self-auto gap-2 px-4 py-2 bg-gray-800/40 border border-gray-800 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800/80 transition">
          <SlidersHorizontal className="h-4 w-4" /> Filter Catalog
        </button>
      </div>

      {/* Grid State Layout Switch */}
      {products.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl max-w-xl mx-auto">
          <ShoppingBag className="h-8 w-8 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">
            No items found matching this specific matrix setup.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Check back later for updated seasonal inventory drops.
          </p>
        </div>
      ) : (
        // 3. Fixed: Swapped custom duplicate HTML layout blocks out for our new modular, actionable card component!
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
