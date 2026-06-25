// src/components/ProductCard.tsx
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { IProduct } from "../types/product";

interface ProductCardProps {
  product: IProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl bg-gray-950/40 border border-gray-800/60 overflow-hidden hover:border-gray-700/80 transition duration-300 shadow-xl cursor-pointer"
    >
      {/* Product Media Display Frame */}
      <div className="relative aspect-square w-full bg-gray-900 overflow-hidden">
        <img
          src={
            product.images?.[0] ||
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
          <p className="text-lg font-black text-white mt-1">${product.price}</p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-gray-800/60 hover:bg-purple-600 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 border border-gray-700/60 hover:border-transparent active:scale-[0.98]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
