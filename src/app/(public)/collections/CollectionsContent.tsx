"use client";

import { motion } from "framer-motion";
import CollectionCard from "@/components/gallery/CollectionCard";
import { collections } from "@/data/artworks";
import PageHero from "@/components/ui/PageHero";

export default function CollectionsPage() {
  return (
    <>
      <PageHero image="/images/hero/collection/2.jpg" alt="Mona Niko Collections" />

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
