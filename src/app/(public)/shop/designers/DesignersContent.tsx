"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { products } from "@/data/artworks";

const designerProducts = products.filter(
  (p) => p.shopCategory === "designers_collection"
);

export default function DesignersShopPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-6.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10">
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
                Designers Collection
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
            >
              Designers Collection
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-5 text-base text-white/60 max-w-lg mx-auto leading-relaxed"
            >
              Where art meets fashion. Hand-embellished jackets, blouses,
              dresses, and vests — each piece designed by Mona Niko as a
              wearable work of art. Limited quantities, extraordinary
              craftsmanship.
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
              Showing {designerProducts.length} piece{designerProducts.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] tracking-[0.12em] uppercase text-charcoal-light">
              Limited quantities available
            </p>
          </motion.div>

          {designerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {designerProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  priority={i < 4}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-charcoal-light mb-4">
                New designs coming soon
              </p>
              <p className="text-sm text-charcoal-light max-w-md mx-auto">
                Mona Niko is currently working on the next collection. Subscribe
                to be the first to know when new pieces drop.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── About the Collection ────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-4 justify-center mb-5">
                <div className="w-8 h-[1px] bg-gold" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
                <div className="w-8 h-[1px] bg-gold" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-black">
                Art You Can Wear
              </h2>
              <p className="mt-6 text-[15px] text-charcoal-light leading-relaxed max-w-xl mx-auto">
                The Designers Collection brings Mona Niko&apos;s artistic vision
                beyond the canvas and into your wardrobe. Each garment is
                crafted with premium fabrics and features hand-embellished
                details that make every piece unique. From gallery openings to
                everyday elegance, these wearable artworks make a statement
                wherever you go.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            {[
              {
                title: "Artisan Craftsmanship",
                description:
                  "Each piece is hand-finished with artistic details that ensure no two garments are exactly alike.",
              },
              {
                title: "Premium Fabrics",
                description:
                  "Carefully sourced materials chosen for drape, comfort, and the ability to showcase every artistic detail.",
              },
              {
                title: "Limited Production",
                description:
                  "Small-batch production ensures exclusivity. Once a style is sold out, it is not restocked.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 md:p-10"
              >
                <h3 className="font-serif text-lg text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-charcoal-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
