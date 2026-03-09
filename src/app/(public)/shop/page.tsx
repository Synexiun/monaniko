"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/shop/ProductCard";
import { products } from "@/data/artworks";

const featuredProducts = products.filter((p) => p.featured);

const categories = [
  {
    title: "Original Paintings",
    description:
      "Acquire museum-quality original works directly from the artist. Each painting is a unique, one-of-a-kind piece accompanied by a certificate of authenticity.",
    href: "/shop/originals",
    image: "/images/artworks/artwork-2.jpg",
    cta: "Browse Originals",
  },
  {
    title: "Limited Edition Prints",
    description:
      "Museum-quality giclée prints on archival paper. Hand-signed and numbered by Mona Niko. A beautiful way to begin or expand your collection.",
    href: "/shop/prints",
    image: "/images/artworks/artwork-1.jpg",
    cta: "Browse Prints",
  },
];

export default function ShopPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-[var(--header-height)] bg-black">
        <div className="py-24 md:py-32">
          <div className="container-gallery text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5"
            >
              Mona Niko Gallery
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-medium tracking-[-0.02em]"
            >
              Shop
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
            >
              Discover original paintings and limited edition prints — each piece
              a testament to color, emotion, and craftsmanship.
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

      {/* ─── Featured Categories ───────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {categories.map((category, i) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Link href={category.href} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={i === 0}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                      <h2 className="font-serif text-3xl md:text-4xl text-white group-hover:text-gold-light transition-colors duration-300">
                        {category.title}
                      </h2>
                      <p className="text-sm text-white/60 mt-3 max-w-sm leading-relaxed line-clamp-3">
                        {category.description}
                      </p>
                      <span className="inline-block mt-5 text-[11px] tracking-[0.15em] uppercase text-gold group-hover:text-gold-light transition-colors font-medium">
                        {category.cta} &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products Grid ────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <SectionHeading
            title="Featured Products"
            subtitle="Hand-picked selections from our most popular prints and editions."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} priority={i < 2} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-14"
          >
            <Link href="/shop/prints">
              <Button variant="outline">View All Prints</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Collector Promise ─────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                title: "Certificate of Authenticity",
                description:
                  "Every original painting and limited edition print ships with a signed certificate of authenticity from the artist.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M12 15l-2 5l-1-3l-3-1l5-2z" />
                    <path d="M20 12a8 8 0 10-16 0a8 8 0 0016 0z" />
                    <path d="M12 8v4l2 2" />
                  </svg>
                ),
              },
              {
                title: "Museum-Quality Materials",
                description:
                  "Archival inks, acid-free papers, and gallery-grade canvases ensure your artwork endures for generations.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                ),
              },
              {
                title: "Secure Worldwide Shipping",
                description:
                  "Professional art handling and insured shipping worldwide. Every piece is carefully packaged to arrive in perfect condition.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 text-gold mb-5">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg text-black mb-2">{item.title}</h3>
                <p className="text-sm text-charcoal-light leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
