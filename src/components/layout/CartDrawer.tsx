"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-gray/50">
              <h2 className="font-serif text-xl text-black">Your Selection</h2>
              <button
                onClick={closeCart}
                className="p-1 text-charcoal-light hover:text-black transition-colors"
                aria-label="Close cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-charcoal-light text-sm mb-4">Your selection is empty</p>
                  <button
                    onClick={closeCart}
                    className="text-[12px] tracking-[0.12em] uppercase text-gold hover:text-gold-dark transition-colors font-medium"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 bg-cream flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-black truncate">{item.title}</h3>
                        <p className="text-[13px] text-charcoal-light mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-warm-gray/50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-xs text-charcoal-light hover:text-black transition-colors"
                            >
                              -
                            </button>
                            <span className="px-2 py-1 text-xs min-w-[24px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-xs text-charcoal-light hover:text-black transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[11px] tracking-wider uppercase text-charcoal-light hover:text-error transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-warm-gray/50 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-light">Subtotal</span>
                  <span className="text-lg font-serif text-black">{formatPrice(total())}</span>
                </div>
                <p className="text-[11px] text-charcoal-light">
                  Shipping and taxes calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-black text-white text-center py-4 text-[12px] tracking-[0.15em] uppercase font-medium hover:bg-charcoal transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block text-center text-[12px] tracking-[0.1em] uppercase text-charcoal-light hover:text-gold transition-colors"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
