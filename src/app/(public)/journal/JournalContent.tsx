"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { journalPosts } from "@/data/artworks";

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(journalPosts.map((post) => post.category));
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return journalPosts;
    return journalPosts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-4.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            Stories &middot; Reflections &middot; Insights
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
          >
            The Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Behind the canvas — studio diaries, creative reflections, and
            collector guides from Mona Niko.
          </motion.p>
        </div>
      </section>

      {/* ─── Category Filter ──────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-16"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-black text-white"
                    : "bg-transparent text-charcoal-light hover:text-black border border-warm-gray hover:border-charcoal"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                layout
              >
                <Link
                  href={`/journal/${post.slug}`}
                  className="group block bg-white h-full hover:shadow-lg transition-shadow duration-500"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-white/90 backdrop-blur-sm text-[10px] tracking-[0.15em] uppercase text-charcoal px-3 py-1.5">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <h3 className="font-serif text-xl text-black group-hover:text-gold transition-colors duration-300 mb-3 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-charcoal-light leading-relaxed mb-5">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-5 border-t border-warm-gray">
                      <span className="text-[11px] text-charcoal-light">
                        {post.publishedAt &&
                          new Date(post.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                      </span>
                      <span className="text-[11px] tracking-[0.15em] uppercase text-gold group-hover:text-gold-dark transition-colors font-medium">
                        Read More
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-charcoal-light">
                No posts found in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
