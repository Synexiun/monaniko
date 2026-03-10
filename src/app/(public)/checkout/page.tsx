"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const stripeAppearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#C4A265",
    colorBackground: "#ffffff",
    colorText: "#1A1A1A",
    colorDanger: "#dc2626",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderRadius: "0px",
  },
  rules: {
    ".Input": {
      border: "1px solid #D4CFC8",
      boxShadow: "none",
      padding: "14px 16px",
      fontSize: "14px",
    },
    ".Input:focus": {
      border: "1px solid #1A1A1A",
      boxShadow: "none",
    },
    ".Label": {
      fontSize: "11px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#6B6560",
      fontWeight: "500",
      marginBottom: "8px",
    },
    ".Tab": {
      border: "1px solid #D4CFC8",
      boxShadow: "none",
      borderRadius: "0px",
    },
    ".Tab--selected": {
      border: "1px solid #C4A265",
      boxShadow: "none",
    },
  },
};

interface ShippingForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface Breakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

interface PromoInfo {
  code: string;
  discountType: string;
  discountValue: number;
  description: string | null;
}

const initialForm: ShippingForm = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  phone: "",
};

// ─── Payment Form (must live inside <Elements>) ──────────────────────────────
function PaymentForm({
  breakdown,
  onBack,
}: {
  breakdown: Breakdown;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // Only reached on error — success triggers a redirect
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing
            ? "Processing Payment…"
            : `Place Order — ${formatPrice(breakdown.total)}`}
        </Button>
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="w-full text-[11px] tracking-[0.12em] uppercase text-charcoal-light hover:text-charcoal transition-colors py-2 disabled:opacity-50"
        >
          ← Back to Shipping
        </button>
      </div>
    </form>
  );
}

// ─── Checkout Page ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const [form, setForm] = useState<ShippingForm>(initialForm);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [clientSecret, setClientSecret] = useState("");
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoInfo, setPromoInfo] = useState<PromoInfo | null>(null);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formError) setFormError("");
  };

  const handleApplyPromo = useCallback(async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setPromoError("");
    setPromoInfo(null);
    try {
      const res = await fetch(`/api/promo-codes/validate?code=${encodeURIComponent(promoInput.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid promo code");
      setPromoInfo(data);
    } catch (e) {
      setPromoError(e instanceof Error ? e.message : "Invalid promo code");
    } finally {
      setApplyingPromo(false);
    }
  }, [promoInput]);

  const handleContinueToPayment = useCallback(async () => {
    const required: (keyof ShippingForm)[] = [
      "email", "firstName", "lastName", "address", "city", "state", "zip",
    ];
    for (const field of required) {
      if (!form[field].trim()) {
        setFormError("Please fill in all required fields.");
        return;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            type: item.type,
          })),
          customerEmail: form.email,
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          customerPhone: form.phone || undefined,
          shippingAddress: {
            line1: form.address,
            line2: form.apartment || undefined,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
          promoCode: promoInfo?.code || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to initialize payment");
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setBreakdown(data.breakdown);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [form, items]);

  const inputClass = cn(
    "w-full border border-warm-gray bg-white px-4 py-3.5 text-sm text-charcoal",
    "placeholder:text-warm-gray-dark",
    "focus:outline-none focus:border-charcoal transition-colors duration-200"
  );
  const labelClass =
    "block text-[11px] tracking-[0.12em] uppercase text-charcoal-light font-medium mb-2";

  if (items.length === 0) {
    return (
      <div className="pt-[var(--header-height)] min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-serif text-3xl text-black mb-4">
            Your cart is empty
          </h1>
          <p className="text-charcoal-light text-sm mb-8">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link href="/shop">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* ─── Header ─────────────────────────────────────────── */}
      <section className="pt-[var(--header-height)] bg-cream border-b border-warm-gray">
        <div className="container-gallery py-8 md:py-10">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-serif text-2xl md:text-3xl text-black font-medium"
            >
              Checkout
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {step === "payment" ? (
                <button
                  onClick={() => setStep("shipping")}
                  className="text-[11px] tracking-[0.12em] uppercase text-charcoal-light hover:text-gold transition-colors font-medium"
                >
                  ← Back to Shipping
                </button>
              ) : (
                <Link
                  href="/cart"
                  className="text-[11px] tracking-[0.12em] uppercase text-charcoal-light hover:text-gold transition-colors font-medium"
                >
                  ← Back to Cart
                </Link>
              )}
            </motion.div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                  step === "payment" ? "bg-charcoal text-white" : "bg-gold text-white"
                )}
              >
                {step === "payment" ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : "1"}
              </div>
              <span className={cn(
                "text-[11px] tracking-[0.08em] uppercase font-medium",
                step === "shipping" ? "text-black" : "text-charcoal-light"
              )}>
                Shipping
              </span>
            </div>
            <div className="w-12 h-px bg-warm-gray" />
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                  step === "payment" ? "bg-gold text-white" : "bg-warm-gray text-charcoal-light"
                )}
              >
                2
              </div>
              <span className={cn(
                "text-[11px] tracking-[0.08em] uppercase font-medium",
                step === "payment" ? "text-black" : "text-charcoal-light"
              )}>
                Payment
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Checkout Content ────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <AnimatePresence mode="wait">
                {step === "shipping" ? (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Contact Information */}
                    <div className="mb-10">
                      <h2 className="font-serif text-xl text-black mb-6">
                        Contact Information
                      </h2>
                      <div>
                        <label htmlFor="email" className={labelClass}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className={inputClass}
                          autoComplete="email"
                        />
                        <p className="text-[11px] text-charcoal-light mt-2">
                          Order confirmation and shipping updates will be sent here.
                        </p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-10">
                      <h2 className="font-serif text-xl text-black mb-6">
                        Shipping Address
                      </h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="firstName" className={labelClass}>
                              First Name
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={form.firstName}
                              onChange={handleChange}
                              placeholder="First name"
                              className={inputClass}
                              autoComplete="given-name"
                            />
                          </div>
                          <div>
                            <label htmlFor="lastName" className={labelClass}>
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={form.lastName}
                              onChange={handleChange}
                              placeholder="Last name"
                              className={inputClass}
                              autoComplete="family-name"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="address" className={labelClass}>
                            Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Street address"
                            className={inputClass}
                            autoComplete="address-line1"
                          />
                        </div>

                        <div>
                          <label htmlFor="apartment" className={labelClass}>
                            Apartment, Suite, etc. (optional)
                          </label>
                          <input
                            type="text"
                            id="apartment"
                            name="apartment"
                            value={form.apartment}
                            onChange={handleChange}
                            placeholder="Apt, suite, unit, etc."
                            className={inputClass}
                            autoComplete="address-line2"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="city" className={labelClass}>
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={form.city}
                              onChange={handleChange}
                              placeholder="City"
                              className={inputClass}
                              autoComplete="address-level2"
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className={labelClass}>
                              State / Province
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={form.state}
                              onChange={handleChange}
                              placeholder="State"
                              className={inputClass}
                              autoComplete="address-level1"
                            />
                          </div>
                          <div>
                            <label htmlFor="zip" className={labelClass}>
                              ZIP / Postal Code
                            </label>
                            <input
                              type="text"
                              id="zip"
                              name="zip"
                              value={form.zip}
                              onChange={handleChange}
                              placeholder="ZIP code"
                              className={inputClass}
                              autoComplete="postal-code"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="country" className={labelClass}>
                              Country
                            </label>
                            <select
                              id="country"
                              name="country"
                              value={form.country}
                              onChange={handleChange}
                              className={inputClass}
                              autoComplete="country"
                            >
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="GB">United Kingdom</option>
                              <option value="AU">Australia</option>
                              <option value="DE">Germany</option>
                              <option value="FR">France</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="phone" className={labelClass}>
                              Phone (optional)
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              placeholder="Phone number"
                              className={inputClass}
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                        {formError}
                      </div>
                    )}

                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full"
                      onClick={handleContinueToPayment}
                      disabled={isLoading}
                    >
                      {isLoading ? "Setting up payment…" : "Continue to Payment"}
                    </Button>
                    <p className="text-[11px] text-charcoal-light text-center mt-4">
                      By placing your order, you agree to our{" "}
                      <Link href="/policies" className="underline hover:text-gold transition-colors">
                        terms and conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/policies" className="underline hover:text-gold transition-colors">
                        privacy policy
                      </Link>
                      .
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Shipping summary */}
                    <div className="mb-8 p-4 bg-cream-dark border border-warm-gray flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] tracking-[0.12em] uppercase text-charcoal-light font-medium mb-1">
                          Shipping to
                        </p>
                        <p className="text-sm text-charcoal">
                          {form.firstName} {form.lastName} &middot; {form.address}
                          {form.apartment ? `, ${form.apartment}` : ""},{" "}
                          {form.city}, {form.state} {form.zip}
                        </p>
                        <p className="text-sm text-charcoal-light">{form.email}</p>
                      </div>
                      <button
                        onClick={() => setStep("shipping")}
                        className="text-[11px] tracking-[0.08em] uppercase text-gold hover:text-gold/70 transition-colors font-medium flex-shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    <h2 className="font-serif text-xl text-black mb-6">
                      Payment
                    </h2>

                    {clientSecret && breakdown && (
                      <Elements
                        stripe={stripePromise}
                        options={{ clientSecret, appearance: stripeAppearance }}
                      >
                        <PaymentForm
                          breakdown={breakdown}
                          onBack={() => setStep("shipping")}
                        />
                      </Elements>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-cream-dark p-8 sticky top-[calc(var(--header-height)+2rem)]">
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="lg:hidden flex items-center justify-between w-full mb-4"
                >
                  <span className="font-serif text-xl text-black">Order Summary</span>
                  <span className="text-sm text-gold">
                    {showOrderSummary ? "Hide" : "Show"}
                  </span>
                </button>
                <h2 className="hidden lg:block font-serif text-xl text-black mb-6">
                  Order Summary
                </h2>

                <div className={cn("lg:block", showOrderSummary ? "block" : "hidden")}>
                  {/* Items */}
                  <div className="space-y-4 pb-6 border-b border-warm-gray">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 bg-white flex-shrink-0 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                          {item.quantity > 1 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-charcoal text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-black truncate">{item.title}</h3>
                          <p className="text-[12px] text-charcoal-light mt-0.5 capitalize">
                            {item.type}
                          </p>
                        </div>
                        <p className="text-sm text-charcoal flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Promo code — only on shipping step */}
                  {step === "shipping" && (
                    <div className="pt-5 pb-5 border-b border-warm-gray">
                      {promoInfo ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] tracking-[0.1em] uppercase text-emerald-600 font-medium">
                              {promoInfo.code} applied
                            </p>
                            <p className="text-xs text-charcoal-light mt-0.5">
                              {promoInfo.discountType === "PERCENTAGE"
                                ? `${promoInfo.discountValue}% off`
                                : `$${promoInfo.discountValue} off`}
                            </p>
                          </div>
                          <button
                            onClick={() => { setPromoInfo(null); setPromoInput(""); }}
                            className="text-[11px] text-charcoal-light underline hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[11px] tracking-[0.12em] uppercase text-charcoal-light font-medium mb-2">
                            Promo Code
                          </p>
                          <div className="flex gap-2">
                            <input
                              value={promoInput}
                              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                              placeholder="Enter code"
                              className="flex-1 border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors"
                            />
                            <button
                              onClick={handleApplyPromo}
                              disabled={applyingPromo || !promoInput.trim()}
                              className="px-4 py-2 bg-charcoal text-white text-[11px] tracking-[0.1em] uppercase hover:bg-gold disabled:opacity-40 transition-colors"
                            >
                              {applyingPromo ? "…" : "Apply"}
                            </button>
                          </div>
                          {promoError && (
                            <p className="text-[11px] text-red-500 mt-1.5">{promoError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-3 pt-6 pb-6 border-b border-warm-gray">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Subtotal</span>
                      <span className="text-charcoal">
                        {formatPrice(breakdown ? breakdown.subtotal : total())}
                      </span>
                    </div>
                    {(breakdown?.discount ?? 0) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-600">Discount</span>
                        <span className="text-emerald-600">−{formatPrice(breakdown!.discount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Shipping</span>
                      <span className="text-charcoal">
                        {breakdown
                          ? breakdown.shipping === 0
                            ? "Free"
                            : formatPrice(breakdown.shipping)
                          : (
                            <span className="text-[12px] text-charcoal-light">
                              Calculated next step
                            </span>
                          )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Tax</span>
                      <span className="text-charcoal">
                        {breakdown
                          ? formatPrice(breakdown.tax)
                          : (
                            <span className="text-[12px] text-charcoal-light">
                              Calculated next step
                            </span>
                          )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <span className="font-medium text-black">Total</span>
                    <span className="font-serif text-2xl text-black">
                      {formatPrice(breakdown ? breakdown.total : total())}
                    </span>
                  </div>
                </div>

                {/* Assurances */}
                <div className="mt-8 pt-6 border-t border-warm-gray space-y-4">
                  {[
                    { label: "Secure checkout", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
                    { label: "Free shipping on orders over $500", d: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
                    { label: "Certificate of authenticity included", d: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" },
                  ].map((a) => (
                    <div key={a.label} className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold flex-shrink-0">
                        <path d={a.d} />
                      </svg>
                      <span className="text-[12px] text-charcoal-light">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
