"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";

interface CollectionItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  featured: boolean;
  year: number | null;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collections?limit=100")
      .then((r) => r.json())
      .then((json) => setCollections(json.collections || json.data || []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        images={[
          "/images/paintings/Mona-Niko-Artwork-13.jpg",
          "/images/paintings/mask-40x40-1-scaled.jpg",
          "/images/paintings/Mona-Niko-Artwork-26.jpg",
        ]}
        alt="Mona Niko Collections"
        title="Collections"
        subtitle="Curated Series · Themed Works · Artist Selection"
      />

      {/* ─── Collections Grid ──────────────────────────────── */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-gallery">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-warm-gray animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {collections.map((collection, i) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={`/collections/${collection.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                      {collection.coverImage ? (
                        <Image
                          src={collection.coverImage}
                          alt={collection.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-warm-gray to-warm-gray-dark" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-white/60 mb-2">
                          Collection{collection.year && ` — ${collection.year}`}
                        </p>
                        <h3
                          className="font-display font-light italic text-white group-hover:text-gold-light transition-colors duration-300"
                          style={{ fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)", lineHeight: 1.1 }}
                        >
                          {collection.title}
                        </h3>
                        {collection.description && (
                          <p className="text-sm text-white/60 mt-2 line-clamp-2 max-w-sm">
                            {collection.description}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-2 mt-4 text-[11px] tracking-[0.15em] uppercase text-gold group-hover:text-gold-light transition-colors">
                          View Collection
                          <span className="inline-block translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
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
