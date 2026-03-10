"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  const status = searchParams.get("redirect_status");
  const paymentIntentId = searchParams.get("payment_intent");

  // Clear the cart once on successful payment
  useEffect(() => {
    if (status === "succeeded") {
      clearCart();
    }
  }, [status, clearCart]);

  if (status !== "succeeded") {
    return (
      <div className="pt-[var(--header-height)] min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-black mb-4">
            Payment Not Completed
          </h1>
          <p className="text-charcoal-light text-sm mb-8 leading-relaxed">
            Your payment was not processed successfully. No charge has been made.
            Please try again or contact us if the issue persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/checkout">
              <Button variant="gold">Try Again</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-[var(--header-height)] min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-lg w-full"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
          className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-8"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold font-medium mb-3">
            Order Confirmed
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-black font-medium mb-4">
            Thank You
          </h1>
          <p className="text-charcoal-light text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Your order has been received and we&apos;re preparing it with care.
            A confirmation email with your order details is on its way.
          </p>
        </motion.div>

        {/* Reference */}
        {paymentIntentId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white border border-warm-gray p-5 mb-8 text-left"
          >
            <p className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-1">
              Payment Reference
            </p>
            <p className="font-mono text-sm text-charcoal break-all">
              {paymentIntentId}
            </p>
            <p className="text-[11px] text-charcoal-light mt-2">
              Keep this reference for your records. Your order number will appear in your confirmation email.
            </p>
          </motion.div>
        )}

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="space-y-4 mb-10"
        >
          {[
            { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "Confirmation email sent to your inbox" },
            { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", text: "We'll send tracking info when your order ships" },
            { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Certificate of authenticity included with your artwork" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
                  <path d={item.icon} />
                </svg>
              </div>
              <span className="text-sm text-charcoal">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/gallery">
            <Button variant="gold" size="lg">
              Continue Exploring
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Visit the Shop
            </Button>
          </Link>
        </motion.div>

        {/* Gallery wordmark */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-12 text-[11px] tracking-[0.2em] uppercase text-charcoal-light/60"
        >
          Mona Niko Gallery · Mission Viejo, CA
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-[var(--header-height)] min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
