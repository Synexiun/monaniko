"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import PageHero from "@/components/ui/PageHero";
import { products } from "@/data/artworks";
import { cn } from "@/lib/utils";
import type { ShopCategory } from "@/types";

const subCategories: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Phone Cases", value: "merch_phone_case" },
  { label: "Cushions", value: "merch_cushion" },
  { label: "T-Shirts", value: "merch_tshirt" },
  { label: "Sweatshirts", value: "merch_sweatshirt" },
  { label: "Leggings", value: "merch_leggings" },
  { label: "Laptop Cases", value: "merch_laptop_case" },
  { label: "Suitcases", value: "merch_suitcase" },
  { label: "Ties", value: "merch_tie" },
];

const allMerchProducts = products.filter((p) =>
  p.shopCategory.startsWith("merch_")
);

export default function MerchShopPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return allMerchProducts;
    return allMerchProducts.filter(
      (p) => p.shopCategory === (activeFilter as ShopCategory)
    );
  }, [activeFilter]);

  return (
    <>
      <PageHero
        image="/images/hero/shop/2.jpg"
        alt="Merch & Objects"
        title="Merch & Objects"
        subtitle="Wearable art and curated objects"
      />

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-7.jpg" alt="" fill className="object-cover" />
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
                Merch &amp; Objects
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
            >
              Merch &amp; Objects
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-5 text-base text-white/60 max-w-lg mx-auto leading-relaxed"
            >
              Everyday objects transformed into art. Phone cases, cushions,
              t-shirts, laptop cases, suitcases, and more — all featuring Mona
              Niko&apos;s iconic artwork.
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

      {/* ─── Filter Tabs + Products Grid ─────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          {/* Sub-category Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 md:gap-3 mb-12 pb-6 border-b border-warm-gray"
          >
            {subCategories.map((cat) => {
              const count =
                cat.value === "all"
                  ? allMerchProducts.length
                  : allMerchProducts.filter(
                      (p) => p.shopCategory === cat.value
                    ).length;

              if (cat.value !== "all" && count === 0) return null;

              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveFilter(cat.value)}
                  className={cn(
                    "px-4 py-2 text-[12px] tracking-[0.1em] uppercase font-medium transition-all duration-200 border",
                    activeFilter === cat.value
                      ? "border-black bg-black text-white"
                      : "border-warm-gray text-charcoal-light hover:border-charcoal hover:text-charcoal"
                  )}
                >
                  {cat.label}
                  <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </motion.div>

          {/* Product Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm text-charcoal-light mb-8"
          >
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </motion.p>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map((product, i) => (
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
                No products in this category
              </p>
              <p className="text-sm text-charcoal-light max-w-md mx-auto">
                Check back soon — new merch is added regularly.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
