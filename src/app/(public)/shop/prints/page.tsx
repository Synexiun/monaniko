"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import { products } from "@/data/artworks";

const printProducts = products.filter((p) => p.type === "print");

export default function PrintsShopPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-[var(--header-height)] bg-black">
        <div className="py-20 md:py-28">
          <div className="container-gallery text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4"
            >
              <Link
                href="/shop"
                className="text-[11px] tracking-[0.2em] uppercase text-white/40 hover:text-gold transition-colors font-medium"
              >
                Shop
              </Link>
              <span className="text-white/20 mx-3">/</span>
              <span className="text-[11px] tracking-[0.2em] uppercase text-gold font-medium">
                Prints
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-medium tracking-[-0.02em]"
            >
              Limited Edition Prints
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-5 text-base text-white/60 max-w-lg mx-auto leading-relaxed"
            >
              Museum-quality giclée prints on archival paper. Hand-signed and
              numbered by Mona Niko — a beautiful way to live with art.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="divider-gold mx-auto mt-8"
            />
          </div>
        </div>
      </section>

      {/* ─── Products Grid ─────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          {/* Info Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-between mb-12 pb-6 border-b border-warm-gray"
          >
            <p className="text-sm text-charcoal-light">
              Showing {printProducts.length} print{printProducts.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] tracking-[0.12em] uppercase text-charcoal-light">
              All prices include artist signature
            </p>
          </motion.div>

          {printProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {printProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} priority={i < 2} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-charcoal-light mb-4">
                New prints coming soon
              </p>
              <p className="text-sm text-charcoal-light max-w-md mx-auto">
                Join our collector&apos;s circle to be notified when new limited
                edition prints become available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Print Details ─────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <SectionHeading
            title="About Our Prints"
            subtitle="Every print is produced to the highest archival standards."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Giclée Printing",
                description:
                  "Printed using state-of-the-art giclée technology with archival pigment inks that resist fading for over 100 years.",
              },
              {
                title: "Archival Paper",
                description:
                  "Produced on 310gsm Hahnemühle Photo Rag — a 100% cotton, acid-free fine art paper with a subtle texture.",
              },
              {
                title: "Signed & Numbered",
                description:
                  "Each limited edition print is hand-signed, numbered, and accompanied by a certificate of authenticity.",
              },
            ].map((detail, i) => (
              <motion.div
                key={detail.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 md:p-10"
              >
                <h3 className="font-serif text-lg text-black mb-3">{detail.title}</h3>
                <p className="text-sm text-charcoal-light leading-relaxed">
                  {detail.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
