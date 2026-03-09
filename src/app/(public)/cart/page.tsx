"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

  return (
    <>
      {/* ─── Header ────────────────────────────────────────── */}
      <section className="pt-[var(--header-height)] bg-cream">
        <div className="container-gallery py-12 md:py-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl md:text-4xl text-black font-medium"
          >
            Your Cart
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="divider-gold mt-5"
          />
        </div>
      </section>

      {/* ─── Cart Content ──────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container-gallery">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream-dark mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-charcoal-light">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-black mb-3">
                Your cart is empty
              </h2>
              <p className="text-sm text-charcoal-light max-w-sm mx-auto mb-8">
                Discover original paintings and limited edition prints from our collection.
              </p>
              <Link href="/shop">
                <Button variant="primary">Continue Shopping</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-warm-gray text-[11px] tracking-[0.15em] uppercase text-charcoal-light font-medium">
                  <span className="col-span-6">Product</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                {/* Items */}
                <div className="divide-y divide-warm-gray/50">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="py-6 md:grid md:grid-cols-12 md:gap-4 md:items-center"
                    >
                      {/* Product Info */}
                      <div className="col-span-6 flex gap-4">
                        <Link
                          href={`/shop/${item.productId}`}
                          className="relative w-24 h-24 md:w-20 md:h-20 bg-cream-dark flex-shrink-0 overflow-hidden"
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            sizes="96px"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-black truncate">
                            {item.title}
                          </h3>
                          <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mt-1 capitalize">
                            {item.type}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="mt-2 text-[11px] tracking-wider uppercase text-charcoal-light hover:text-error transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex items-center justify-center mt-4 md:mt-0">
                        <div className="inline-flex items-center border border-warm-gray">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-sm text-charcoal-light hover:text-black transition-colors"
                            aria-label="Decrease quantity"
                          >
                            &minus;
                          </button>
                          <span className="px-3 py-2 text-sm min-w-[40px] text-center border-x border-warm-gray">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-2 text-sm text-charcoal-light hover:text-black transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-right mt-4 md:mt-0">
                        <p className="text-sm text-charcoal">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Line Total */}
                      <div className="col-span-2 text-right mt-2 md:mt-0">
                        <p className="text-sm font-medium text-black">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-6 mt-2">
                  <Link
                    href="/shop"
                    className="text-[12px] tracking-[0.12em] uppercase text-charcoal-light hover:text-gold transition-colors font-medium"
                  >
                    &larr; Continue Shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-[12px] tracking-[0.12em] uppercase text-charcoal-light hover:text-error transition-colors font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="bg-cream-dark p-8 sticky top-[calc(var(--header-height)+2rem)]">
                  <h2 className="font-serif text-xl text-black mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-3 pb-6 border-b border-warm-gray">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Subtotal</span>
                      <span className="text-charcoal">{formatPrice(total())}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Shipping</span>
                      <span className="text-charcoal-light text-[12px]">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Tax</span>
                      <span className="text-charcoal-light text-[12px]">
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 mb-8">
                    <span className="text-sm font-medium text-black">Estimated Total</span>
                    <span className="font-serif text-xl text-black">
                      {formatPrice(total())}
                    </span>
                  </div>

                  <Link href="/checkout" className="block">
                    <Button variant="primary" size="lg" className="w-full">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <p className="text-[11px] text-charcoal-light text-center mt-4 leading-relaxed">
                    Shipping and taxes calculated at checkout.
                    <br />
                    Secure payment processing.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
