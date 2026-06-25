// 📁 src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useUserStore } from "../store/useUserStore"; 
import { useOrderStore } from "../store/useOrderStore";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios";
import axios from "axios";
import {
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Plus,
  Check,
  Ticket,
  Loader2
} from "lucide-react";
import type { IShippingAddress } from "../types/checkout";

// Asynchronously load the native Razorpay Checkout overlay script securely
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.hasOwnProperty("Razorpay")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function CheckoutPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { cart, getCartSubtotal, clearCart } = useCartStore();
  const { initiateCheckoutSession, verifyPaymentSignature } = useOrderStore();
  const { user } = useUserStore(); 

  // Step Management Matrix
  const [checkoutStep, setCheckoutStep] = useState<"shipping" | "payment" | "success">("shipping");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Coupon Engine States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Local Form Shipping State Tracker
  const [address, setAddress] = useState<IShippingAddress>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });

  // Hydrate user's profile addresses
  useEffect(() => {
    const savedAddresses = user?.profile?.savedAddresses;
    if (savedAddresses && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];
      setAddress({
        firstName: defaultAddr.firstName,
        lastName: defaultAddr.lastName,
        email: user?.email || "",
        addressLine1: defaultAddr.addressLine1,
        addressLine2: defaultAddr.addressLine2 || "",
        city: defaultAddr.city,
        state: defaultAddr.state,
        postalCode: defaultAddr.postalCode,
        phone: user?.profile?.phone || "",
      });
      setIsAddingNewAddress(false);
    } else {
      setIsAddingNewAddress(true);
    }
  }, [user]);

  // Pricing Engine Calculations
  const subtotalCents = getCartSubtotal();
  
  // Calculate discount deductions
  const discountCents = appliedCoupon 
    ? Math.round((subtotalCents * appliedCoupon.discountPercentage) / 100) 
    : 0;

  const dynamicSubtotal = subtotalCents - discountCents;
  const shippingCostCents = dynamicSubtotal >= 7500 || subtotalCents === 0 ? 0 : 700;
  const taxCents = Math.round(dynamicSubtotal * 0.08);
  const orderTotalCents = Math.max(0, dynamicSubtotal + shippingCostCents + taxCents);

  const formatPrice = (cents: number) => (cents / 100).toFixed(2);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSelectSavedAddress = (savedAddr: any) => {
    setAddress({
      firstName: savedAddr.firstName,
      lastName: savedAddr.lastName,
      email: user?.email || "",
      addressLine1: savedAddr.addressLine1,
      addressLine2: savedAddr.addressLine2 || "",
      city: savedAddr.city,
      state: savedAddr.state,
      postalCode: savedAddr.postalCode,
      phone: user?.profile?.phone || "",
    });
    setIsAddingNewAddress(false);
  };

  // Coupon Submission Handler
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setIsApplyingCoupon(true);
      // Calls your existing coupon validation system
      const { data } = await axiosInstance.post("/api/coupons/validate", { code: couponInput.trim() });
      
      setAppliedCoupon({
        code: data.code,
        discountPercentage: data.discountPercentage
      });
      toast.success(`Coupon "${data.code}" (${data.discountPercentage}% OFF) applied!`);
    } catch (error) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.message : "Invalid promo coupon";
      toast.error(msg ?? "Failed to validate coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.dismiss();
  };

  const submitShippingStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !address.firstName ||
      !address.lastName ||
      !address.email ||
      !address.addressLine1 ||
      !address.city ||
      !address.state ||
      !address.postalCode ||
      !address.phone
    ) {
      toast.error("Please fill in all required shipping fields!");
      return;
    }
    setCheckoutStep("payment");
  };

  // Live Gateway Order Generation & Razorpay Launch System
  const handleFinalRazorpayPayment = async () => {
    setIsProcessingPayment(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Razorpay payment window engine failed to mount.");
      setIsProcessingPayment(false);
      return;
    }

    // Map your frontend cart data array elements into the raw payload expected by backend
    const productPayload = cart.map((item) => ({
      _id: item.product._id,
      quantity: item.quantity,
    }));

    // Trigger the backend API call to create a pending tracking order record block
    const gatewayOrderData = await initiateCheckoutSession(productPayload, appliedCoupon?.code || null,address);
    
    if (!gatewayOrderData) {
      setIsProcessingPayment(false);
      return;
    }

    // Configure the options configuration payload for Razorpay UI interface overlay framework
    console.log(import.meta.env.VITE_RAZORPAY_KEY_ID);
    const paymentOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder", 
      amount: gatewayOrderData.amount,
      currency: gatewayOrderData.currency,
      name: "Conditioning Apparel Hub",
      description: `Secure Order Payment for ${user?.name || "Customer"}`,
      order_id: gatewayOrderData.id,
      prefill: {
        name: `${address.firstName} ${address.lastName}`,
        email: address.email,
        contact: address.phone,
      },
      theme: {
        color: "#a855f7", // Premium Purple structural accent theme matching your design system
      },
      handler: async function (response: any) {
        // Callback handshakes after payment success authorization inside user's client overlay view
        const isVerified = await verifyPaymentSignature({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (isVerified) {
          setCheckoutStep("success");
          clearCart();
        }
        setIsProcessingPayment(false);
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          toast.error("Payment session checkout frame dismissed by user");
        }
      }
    };

    const razorpayUiWindowInstance = new (window as any).Razorpay(paymentOptions);
    razorpayUiWindowInstance.open();
  };

  // 🏁 SUCCESS VIEW SCREEN
  if (checkoutStep === "success") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md space-y-6">
          <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto animate-bounce" />
          <h1 className="text-3xl font-black uppercase tracking-tight">Order Confirmed!</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your conditioning gear is secured. A confirmation summary receipt along with delivery tracking updates has been routed to your registered inbox.
          </p>
          <button
            onClick={() => navigate("/orders")} // Send them to order history screen
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-gray-200 transition-all"
          >
            Track Order Progress
          </button>
        </div>
      </div>
    );
  }

  // 🛍️ EMPTY CHECKOUT REDIRECT GUARD
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">No Active Session Cargo Detected</h2>
        <Link to="/" className="text-purple-400 underline text-sm">
          Return to shop feed catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/cart"
          className="text-gray-400 hover:text-white transition flex items-center gap-1 text-sm uppercase tracking-wider font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Edit Bag
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INTERACTIVE INPUT SUBMISSION FLOW MATRIX */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: SHIPPING ADDRESS FRAMEWORK */}
          <div
            className={`p-5 rounded-xl border transition-all ${checkoutStep === "shipping" ? "bg-gray-950 border-purple-500/40" : "bg-gray-950/40 border-gray-800/60 opacity-60"}`}
          >
            <div className="flex items-center gap-3 font-black text-lg uppercase tracking-wide mb-4">
              <Truck className={`w-5 h-5 ${checkoutStep === "shipping" ? "text-purple-400" : "text-gray-500"}`} />
              <h2>1. Delivery Address Information</h2>
            </div>

            {checkoutStep === "shipping" ? (
              <div className="space-y-6">
                {user?.profile?.savedAddresses && user.profile.savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {user.profile.savedAddresses.map((addr, index) => {
                      const isSelected = address.addressLine1 === addr.addressLine1;
                      return (
                        <div
                          key={addr._id || index}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${isSelected ? "bg-purple-950/20 border-purple-500 text-white" : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"}`}
                        >
                          <div>
                            <div className="flex items-center justify-between font-bold text-sm text-gray-200 mb-1">
                              <span>{addr.firstName} {addr.lastName}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed truncate">{addr.addressLine1}</p>
                            {addr.addressLine2 && <p className="text-xs leading-relaxed truncate">{addr.addressLine2}</p>}
                            <p className="text-xs mt-1 font-semibold">{addr.city}, {addr.state} {addr.postalCode}</p>
                          </div>
                          {isSelected && !isAddingNewAddress && (
                            <div className="absolute bottom-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-black">
                              <Check className="w-3 h-3 stroke-[4]" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(true);
                        setAddress({
                          firstName: "", lastName: "", email: user?.email || "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", phone: ""
                        });
                      }}
                      className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition min-h-[100px] ${isAddingNewAddress ? "bg-purple-950/10 border-purple-500 text-purple-400" : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400"}`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add new delivery destination</span>
                    </button>
                  </div>
                )}

                {(isAddingNewAddress || !user?.profile?.savedAddresses?.length) && (
                  <form onSubmit={submitShippingStep} className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      required
                      value={address.firstName}
                      onChange={handleAddressChange}
                      className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      required
                      value={address.lastName}
                      onChange={handleAddressChange}
                      className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                    />
                    <div className="col-span-2">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address *"
                        required
                        value={address.email}
                        onChange={handleAddressChange}
                        className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        name="addressLine1"
                        placeholder="Address Line 1 *"
                        required
                        value={address.addressLine1}
                        onChange={handleAddressChange}
                        className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        name="addressLine2"
                        placeholder="Apartment, Suite, Unit (Optional)"
                        value={address.addressLine2}
                        onChange={handleAddressChange}
                        className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                      />
                    </div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      required
                      value={address.city}
                      onChange={handleAddressChange}
                      className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State/Region *"
                      required
                      value={address.state}
                      onChange={handleAddressChange}
                      className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code *"
                      required
                      value={address.postalCode}
                      onChange={handleAddressChange}
                      className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Link *"
                      required
                      value={address.phone}
                      onChange={handleAddressChange}
                      className="w-full bg-gray-900 border border-gray-800 p-3 rounded-lg text-sm focus:border-purple-500 outline-none text-white"
                    />

                    <div className="col-span-2 pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-gray-200 transition-all"
                      >
                        Continue to Secure Payment
                      </button>
                    </div>
                  </form>
                )}

                {!isAddingNewAddress && user?.profile?.savedAddresses && user.profile.savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCheckoutStep("payment")}
                    className="w-full py-3.5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-gray-200 transition-all"
                  >
                    Use Selected Delivery Destination Card
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-400 italic bg-gray-900/30 p-3 rounded-lg border border-gray-900">
                <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Validated Fulfilling Address Route: {address.firstName} {address.lastName}, {address.addressLine1}, {address.city}</span>
              </div>
            )}
          </div>

          {/* STEP 2: GATEWAY INTERFACE TERMINAL (Replaced Form Fields with Live Razorpay Toggle) */}
          <div
            className={`p-5 rounded-xl border transition-all ${checkoutStep === "payment" ? "bg-gray-950 border-purple-500/40" : "bg-gray-950/40 border-gray-800/60 opacity-60"}`}
          >
            <div className="flex items-center gap-3 font-black text-lg uppercase tracking-wide mb-4">
              <CreditCard className={`w-5 h-5 ${checkoutStep === "payment" ? "text-purple-400" : "text-gray-500"}`} />
              <h2>2. Payment & Billing Framework Options</h2>
            </div>

            {checkoutStep === "payment" && (
              <div className="space-y-6">
                <div className="bg-gray-900/60 border border-gray-800 p-4 rounded-xl flex items-start gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-100">Razorpay Unified Gateway</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Supports instant confirmation via UPI, NetBanking, Credit/Debit cards, and popular Indian billing options.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => setCheckoutStep("shipping")}
                    className="w-1/3 py-3.5 bg-gray-800 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-gray-700 transition-all disabled:opacity-50"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleFinalRazorpayPayment}
                    className="w-2/3 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Awaiting Authorization...
                      </>
                    ) : (
                      `Launch Razorpay Wallet ($${formatPrice(orderTotalCents)})`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY BASKET OVERVIEW & COUPON ENGINE */}
        <div className="lg:col-span-5 bg-gray-950/40 border border-gray-800/60 rounded-xl p-6 sticky top-24 space-y-6 backdrop-blur-md">
          <h2 className="text-lg font-black uppercase tracking-wide border-b border-gray-800/60 pb-3">
            In Your Bag
          </h2>

          {/* Cart Item Loop */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 border-b border-gray-800/60 pb-4">
            {cart.map((item) => (
              <div key={`${item.product._id}-${item.selectedSize}`} className="flex gap-3 items-center">
                <img
                  src={item.product.images?.[0]}
                  alt=""
                  className="w-12 h-16 object-cover bg-gray-900 rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-100 truncate uppercase">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                    SIZE: {item.selectedSize} • QTY: {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-black">
                  ${formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* 🎫 NEW: INTEGRATED COUPON MANAGEMENT PANEL */}
          <div className="border-b border-gray-800/60 pb-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-purple-400" /> Have a Promo Code?
            </h3>
            
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER CODE (e.g. FIT20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-900 border border-gray-800 p-2.5 rounded-lg text-xs font-bold tracking-wider outline-none focus:border-purple-500 uppercase text-white placeholder-gray-600"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="px-5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="bg-purple-950/20 border border-purple-500/30 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-purple-400 tracking-widest uppercase">
                    CODE: {appliedCoupon.code}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    Deducting {appliedCoupon.discountPercentage}% off base values
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-rose-400 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Financial Matrices */}
          <div className="space-y-2 text-xs font-medium text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white font-bold">${formatPrice(subtotalCents)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-purple-400">
                <span>Coupon Reward Savings</span>
                <span className="font-bold">-${formatPrice(discountCents)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Shipping Logistics</span>
              <span className="text-white font-bold">
                {shippingCostCents === 0 ? "FREE" : `$${formatPrice(shippingCostCents)}`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>VAT / Estimated Sales Tax (8%)</span>
              <span className="text-white font-bold">${formatPrice(taxCents)}</span>
            </div>
            
            <div className="border-t border-gray-800 pt-3 flex justify-between text-white font-black text-base uppercase tracking-wide">
              <span>Order Total</span>
              <span className="text-emerald-400">${formatPrice(orderTotalCents)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/60 text-[10px] text-gray-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted SSL Secure Checkout Protection Layer Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
