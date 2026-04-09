"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import PageHero from "@/components/ui/PageHero";
import { cn } from "@/lib/utils";
import type { ArtworkCategory, ArtworkStatus } from "@/types";

type CategoryFilter = "all" | ArtworkCategory;
type StatusFilter = "all" | ArtworkStatus;

const categoryTabs: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "painting", label: "Paintings" },
  { value: "celebrity", label: "Celebrities" },
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
  const [filteredArtworks, setFilteredArtworks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeStatus !== "all") params.set("status", activeStatus);
    fetch(`/api/artworks?${params}`)
      .then((r) => r.json())
      .then((json) => setFilteredArtworks(json.artworks || json.data || []))
      .catch(() => setFilteredArtworks([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activeStatus]);

  return (
    <>
      <PageHero
        images={[
          "/images/paintings/Mona-Niko-Artwork-36.jpg",
          "/images/paintings/Mona-Niko-Artwork-46.jpg",
          "/images/paintings/fancy-girl-scaled.jpg",
        ]}
        alt="Mona Niko Gallery"
        title="Gallery"
        subtitle="Original Paintings · Celebrities · Fine Art"
      />

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
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-warm-gray animate-pulse" />
              ))}
            </div>
          ) : (
            <>
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
            </>
          )}
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
