"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/shop/ProductCard";
import PageHero from "@/components/ui/PageHero";
import { products, artworks } from "@/data/artworks";

const featuredProducts = products.filter((p) => p.featured).slice(0, 6);

const originalCount = artworks.filter((a) => a.status === "available").length;
const printCount = products.filter((p) => p.shopCategory === "print_limited_edition").length;
const merchCount = products.filter((p) => p.shopCategory.startsWith("merch_")).length;
const designersCount = products.filter((p) => p.shopCategory === "designers_collection").length;

const categories = [
  {
    title: "Original Paintings",
    description:
      "Acquire museum-quality original works directly from the artist. Each painting is a unique, one-of-a-kind piece accompanied by a certificate of authenticity.",
    href: "/shop/originals",
    image: "/images/artworks/artwork-2.jpg",
    count: originalCount,
    cta: "Browse Originals",
  },
  {
    title: "Prints & Limited Editions",
    description:
      "Museum-quality giclée prints on archival paper. Hand-signed and numbered by Mona Niko. A beautiful way to begin or expand your collection.",
    href: "/shop/prints",
    image: "/images/artworks/artwork-1.jpg",
    count: printCount,
    cta: "Browse Prints",
  },
  {
    title: "Merch & Objects",
    description:
      "Cushions, t-shirts, sweatshirts, leggings, and more — everyday objects transformed into wearable and functional art.",
    href: "/shop/merch",
    image: "/images/artworks/artwork-3.jpg",
    count: merchCount,
    cta: "Browse Merch",
  },
  {
    title: "Designers Collection",
    description:
      "Where art meets fashion. Hand-embellished jackets, blouses, dresses, and vests — each piece a wearable masterpiece from Mona Niko's atelier.",
    href: "/shop/designers",
    image: "/images/artworks/artwork-5.jpg",
    count: designersCount,
    cta: "Browse Collection",
  },
  {
    title: "Workshops",
    description:
      "Learn painting, sculpting, and mixed media techniques in intimate, hands-on workshops led by Mona Niko and guest instructors at the gallery.",
    href: "/workshops",
    image: "/images/artworks/artwork-7.jpg",
    count: null,
    cta: "View Workshops",
  },
];

export default function ShopPage() {
  return (
    <>
      <PageHero
        images={[
          "/images/paintings/Mona-Niko-Artwork-1.jpg",
          "/images/paintings/Mona-Niko-Artwork-26.jpg",
          "/images/paintings/Mona-Niko-Artwork-8.jpg",
        ]}
        alt="Shop — Mona Niko Gallery"
        title="Shop"
        subtitle="Original Paintings · Prints · Limited Editions"
      />


      {/* ─── Category Cards ──────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {categories.map((category, i) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={i < 2 ? "lg:col-span-1 md:col-span-1" : ""}
              >
                <Link href={category.href} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={i < 2}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                      <h2 className="font-serif text-2xl md:text-3xl text-white group-hover:text-gold-light transition-colors duration-300">
                        {category.title}
                      </h2>
                      {category.count !== null && (
                        <p className="text-[11px] tracking-[0.15em] uppercase text-gold/80 mt-2 font-medium">
                          {category.count} {category.count === 1 ? "item" : "items"}
                        </p>
                      )}
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
            subtitle="Hand-picked selections from across all categories — originals, prints, merch, and designer pieces."
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
            className="text-center mt-14 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/shop/prints">
              <Button variant="outline">View All Prints</Button>
            </Link>
            <Link href="/shop/merch">
              <Button variant="outline">View All Merch</Button>
            </Link>
            <Link href="/shop/designers">
              <Button variant="outline">Designers Collection</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Trust Badges ────────────────────────────────────── */}
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
                title: "Worldwide Shipping",
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
              {
                title: "Secure Checkout",
                description:
                  "Shop with confidence. All transactions are encrypted and securely processed. Your personal information is always protected.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1" />
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
