"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import { artworks } from "@/data/artworks";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";
import { cn } from "@/lib/utils";
import type { ArtworkCategory, ArtworkStatus } from "@/types";

type CategoryFilter = "all" | ArtworkCategory;
type StatusFilter = "all" | ArtworkStatus;

const categoryTabs: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "painting", label: "Paintings" },
  { value: "sculpture_3d", label: "Sculpture & 3D" },
  { value: "mixed_media", label: "Mixed Media" },
  { value: "limited_edition", label: "Limited Editions" },
];

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "on_exhibition", label: "On Exhibition" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesCategory =
        activeCategory === "all" || artwork.category === activeCategory;
      const matchesStatus =
        activeStatus === "all" || artwork.status === activeStatus;
      return matchesCategory && matchesStatus;
    });
  }, [activeCategory, activeStatus]);

  return (
    <>
      <PageHero image="/images/hero/gallery/gallery.jpg" alt="Mona Niko Gallery" />

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-1.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5"
          >
            Mona Niko
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-[-0.02em]"
          >
            Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Explore the complete collection of original paintings, mixed media
            works, and limited edition prints by Mona Niko.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="divider-gold mx-auto mt-8"
          />
        </div>
      </section>

      {/* ─── Filters ───────────────────────────────────────── */}
      <section className="border-b border-warm-gray bg-cream sticky top-[var(--header-height)] z-30">
        <div className="container-gallery py-5 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mr-3 hidden md:inline">
                Category
              </span>
              <div className="flex items-center gap-1">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveCategory(tab.value)}
                    className={cn(
                      "px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-medium transition-all duration-300",
                      activeCategory === tab.value
                        ? "bg-black text-white"
                        : "text-charcoal-light hover:text-black hover:bg-warm-gray"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mr-3 hidden md:inline">
                Status
              </span>
              <div className="flex items-center gap-1">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveStatus(tab.value)}
                    className={cn(
                      "px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-medium transition-all duration-300",
                      activeStatus === tab.value
                        ? "bg-black text-white"
                        : "text-charcoal-light hover:text-black hover:bg-warm-gray"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Gallery Grid ──────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-gallery">
          {/* Results Count */}
          <motion.p
            key={`${activeCategory}-${activeStatus}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[12px] tracking-wider uppercase text-charcoal-light mb-10"
          >
            {filteredArtworks.length}{" "}
            {filteredArtworks.length === 1 ? "Work" : "Works"}
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${activeStatus}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {filteredArtworks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filteredArtworks.map((artwork, i) => (
                    <ArtworkCard
                      key={artwork.id}
                      artwork={artwork}
                      index={i}
                      priority={i < 4}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <p className="font-serif text-2xl text-black mb-3">
                    No works found
                  </p>
                  <p className="text-sm text-charcoal-light">
                    Try adjusting your filters to discover more pieces.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Private Viewing CTA ───────────────────────────── */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5">
              By Appointment
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-medium mb-4">
              Request a Private Viewing
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
              Experience the collection in person at the gallery in Mission
              Viejo, or arrange a virtual walkthrough with Mona.
            </p>
            <a
              href="/contact?type=private_viewing"
              className="inline-flex items-center justify-center px-8 py-3.5 text-[12px] tracking-[0.12em] uppercase font-medium bg-gold text-white hover:bg-gold-light transition-all duration-300"
            >
              Schedule a Viewing
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
