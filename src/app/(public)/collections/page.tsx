"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import CollectionCard from "@/components/gallery/CollectionCard";
import { collections } from "@/data/artworks";

export default function CollectionsPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-cream">
        <div className="container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5"
          >
            Curated Bodies of Work
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-black tracking-[-0.01em]"
          >
            Collections
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-5 text-[15px] text-charcoal-light max-w-xl mx-auto leading-relaxed"
          >
            Each collection is a journey through a unified vision, exploring
            themes that resonate across individual works.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="divider-gold mx-auto mt-6"
          />
        </div>
      </section>

      {/* ─── Collections Grid ──────────────────────────────── */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-gallery">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {collections.map((collection, i) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Commission CTA ────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5">
              Something Unique
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-medium mb-4">
              Commission a Custom Collection
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
              Work directly with Mona to create a bespoke series of artworks
              tailored to your space and vision.
            </p>
            <a
              href="/commissions"
              className="inline-flex items-center justify-center px-8 py-3.5 text-[12px] tracking-[0.12em] uppercase font-medium bg-gold text-white hover:bg-gold-light transition-all duration-300"
            >
              Explore Commissions
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
