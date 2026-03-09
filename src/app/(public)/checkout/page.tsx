"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";

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

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const [form, setForm] = useState<ShippingForm>(initialForm);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
      {/* ─── Header ────────────────────────────────────────── */}
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
              className="flex items-center gap-6 text-[11px] tracking-[0.12em] uppercase"
            >
              <Link
                href="/cart"
                className="text-charcoal-light hover:text-gold transition-colors font-medium"
              >
                &larr; Back to Cart
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Checkout Content ──────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Main Form Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
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
                    required
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
                        required
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
                        required
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
                      required
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
                        required
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
                        required
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
                        required
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
                        required
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
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="mb-10">
                <h2 className="font-serif text-xl text-black mb-6">
                  Payment
                </h2>
                <div className="border border-warm-gray bg-cream-dark p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg text-black mb-2">
                    Secure Payment
                  </h3>
                  <p className="text-sm text-charcoal-light max-w-sm mx-auto leading-relaxed">
                    Stripe integration coming soon. All transactions will be
                    processed securely through Stripe&apos;s PCI-compliant payment
                    infrastructure.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-6 text-charcoal-light/40">
                    <span className="text-[10px] tracking-widest uppercase">Visa</span>
                    <span className="text-[10px] tracking-widest uppercase">Mastercard</span>
                    <span className="text-[10px] tracking-widest uppercase">Amex</span>
                    <span className="text-[10px] tracking-widest uppercase">Apple Pay</span>
                  </div>
                </div>
              </div>

              {/* Place Order */}
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                disabled
              >
                Place Order &mdash; {formatPrice(total())}
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

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-cream-dark p-8 sticky top-[calc(var(--header-height)+2rem)]">
                {/* Toggle for mobile */}
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="lg:hidden flex items-center justify-between w-full mb-4"
                >
                  <span className="font-serif text-xl text-black">
                    Order Summary
                  </span>
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
                          <h3 className="text-sm text-black truncate">
                            {item.title}
                          </h3>
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

                  {/* Totals */}
                  <div className="space-y-3 pt-6 pb-6 border-b border-warm-gray">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Subtotal</span>
                      <span className="text-charcoal">{formatPrice(total())}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Shipping</span>
                      <span className="text-[12px] text-charcoal-light">
                        Calculated next step
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Tax</span>
                      <span className="text-[12px] text-charcoal-light">
                        Calculated next step
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <span className="font-medium text-black">Total</span>
                    <span className="font-serif text-2xl text-black">
                      {formatPrice(total())}
                    </span>
                  </div>
                </div>

                {/* Assurances */}
                <div className="mt-8 pt-6 border-t border-warm-gray space-y-4">
                  {[
                    { label: "Secure checkout", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
                    { label: "Free shipping on orders over $500", icon: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
                    { label: "Certificate of authenticity included", icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold flex-shrink-0">
                        <path d={item.icon} />
                      </svg>
                      <span className="text-[12px] text-charcoal-light">
                        {item.label}
                      </span>
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
