import React from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CartPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartSubtotal } =
    useCartStore();

  const subtotalCents = getCartSubtotal();
  const shippingThresholdCents = 7500; // Free shipping over $75.00
  const shippingCostCents =
    subtotalCents >= shippingThresholdCents || subtotalCents === 0 ? 0 : 700; // $7.00 shipping standard
  const estimatedTaxCents = Math.round(subtotalCents * 0.08); // 8% estimated tax wrapper
  const totalCents = subtotalCents + shippingCostCents + estimatedTaxCents;

  const formatPrice = (cents: number) => (cents / 100).toFixed(2);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-500">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">
            Your Bag is Empty
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            There are no items currently assigned to your active session
            profile. Fill it with premium conditioning gear to break your
            personal goals.
          </p>
          <Link
            to="/"
            className="inline-block w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-gray-200 transition-all text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">
        Your Bag{" "}
        <span className="text-gray-500 font-medium">
          ({cart.reduce((a, b) => a + b.quantity, 0)} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COMPONENT COLUMN: ACTIVE ITEMS LISTING */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.product._id}-${item.selectedSize}`}
              className="flex gap-4 p-4 rounded-xl bg-gray-950/40 border border-gray-800/60 backdrop-blur-md"
            >
              {/* Product Thumbnail Frame */}
              <div className="w-24 h-32 md:w-28 md:h-36 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Meta Descriptions Frame Layout */}
              <div className="flex flex-col flex-1 justify-between py-1">
                <div className="flex justify-between gap-2 items-start">
                  <div>
                    <h3 className="font-extrabold uppercase text-sm md:text-base tracking-wide line-clamp-1 text-gray-100">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
                      Brand: {item.product.brand}
                    </p>
                    <span className="inline-block px-2.5 py-0.5 mt-2 text-xs font-black rounded bg-gray-800 text-gray-300 uppercase">
                      Size: {item.selectedSize}
                    </span>
                  </div>
                  <span className="font-black text-sm md:text-base whitespace-nowrap">
                    ${formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>

                {/* Adjustments Operations Control Matrix Row */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border border-gray-700 bg-black/20 rounded-full px-1">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.selectedSize,
                          item.quantity - 1,
                        )
                      }
                      className="p-2 text-gray-400 hover:text-white transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.selectedSize,
                          item.quantity + 1,
                        )
                      }
                      className="p-2 text-gray-400 hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.product._id, item.selectedSize)
                    }
                    className="p-2 text-gray-500 hover:text-red-400 transition"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COMPONENT COLUMN: STICKY ORDER BREAKDOWN CONSOLE */}
        <div className="lg:col-span-4 bg-gray-950/40 border border-gray-800/60 rounded-xl p-6 sticky top-24 space-y-6 backdrop-blur-md">
          <h2 className="text-xl font-black uppercase tracking-wide border-b border-gray-800 pb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm font-medium text-gray-400">
            <div className="flex justify-between text-white">
              <span>Subtotal</span>
              <span className="font-bold">${formatPrice(subtotalCents)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Estimated Delivery Shipping</span>
              <span
                className={
                  shippingCostCents === 0
                    ? "text-emerald-400 font-bold uppercase text-xs"
                    : "text-white font-bold"
                }
              >
                {shippingCostCents === 0
                  ? "Free"
                  : `$${formatPrice(shippingCostCents)}`}
              </span>
            </div>

            {subtotalCents < shippingThresholdCents && (
              <p className="text-[11px] text-purple-400 italic bg-purple-950/20 border border-purple-900/30 p-2 rounded-md">
                Spend another{" "}
                <strong>
                  ${formatPrice(shippingThresholdCents - subtotalCents)}
                </strong>{" "}
                to qualify for free express delivery coverage.
              </p>
            )}

            <div className="flex justify-between">
              <span>Estimated Sales Tax (8%)</span>
              <span className="text-white font-bold">
                ${formatPrice(estimatedTaxCents)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 flex justify-between text-white font-black text-lg uppercase tracking-wide">
            <span>Total</span>
            <span>${formatPrice(totalCents)}</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-white font-black uppercase tracking-widest text-sm rounded-full transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
