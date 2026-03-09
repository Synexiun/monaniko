"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import { artworks, collections } from "@/data/artworks";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { ArtworkStatus } from "@/types";

const statusConfig: Record<
  ArtworkStatus,
  { label: string; className: string }
> = {
  available: { label: "Available", className: "bg-success text-white" },
  sold: { label: "Sold", className: "bg-charcoal text-white" },
  on_exhibition: {
    label: "On Exhibition",
    className: "bg-gold text-white",
  },
  commissioned: {
    label: "Commissioned",
    className: "bg-charcoal-light text-white",
  },
};

const mediumLabels: Record<string, string> = {
  oil: "Oil on Canvas",
  acrylic: "Acrylic on Canvas",
  watercolor: "Watercolor on Paper",
  mixed_media: "Mixed Media",
  ink: "Ink on Paper",
  pastel: "Pastel on Paper",
  digital: "Digital",
};

export default function ArtworkDetailPage() {
  const params = useParams<{ slug: string }>();
  const foundArtwork = artworks.find((a) => a.slug === params.slug);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [zoomed, setZoomed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!foundArtwork) {
    notFound();
  }

  const artwork = foundArtwork;

  const status = statusConfig[artwork.status];
  const collection = artwork.collectionId
    ? collections.find((c) => c.id === artwork.collectionId)
    : null;

  const relatedArtworks = artworks
    .filter((a) => a.id !== artwork.id)
    .filter(
      (a) =>
        a.collectionId === artwork.collectionId ||
        a.category === artwork.category
    )
    .slice(0, 3);

  const dimensionLabel = artwork.dimensions.depth
    ? `${artwork.dimensions.width} \u00d7 ${artwork.dimensions.height} \u00d7 ${artwork.dimensions.depth} ${artwork.dimensions.unit}`
    : `${artwork.dimensions.width} \u00d7 ${artwork.dimensions.height} ${artwork.dimensions.unit}`;

  function handleAddToCart() {
    addItem({
      id: `artwork-${artwork.id}`,
      productId: artwork.id,
      title: artwork.title,
      image: artwork.images[0],
      price: artwork.price ?? 0,
      quantity: 1,
      type: "original",
    });
    openCart();
  }

  return (
    <>
      {/* ─── Breadcrumbs ───────────────────────────────────── */}
      <div className="pt-24 md:pt-28 bg-cream">
        <div className="container-gallery">
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase"
          >
            <Link
              href="/"
              className="text-charcoal-light hover:text-gold transition-colors"
            >
              Home
            </Link>
            <span className="text-warm-gray-dark">/</span>
            <Link
              href="/gallery"
              className="text-charcoal-light hover:text-gold transition-colors"
            >
              Gallery
            </Link>
            <span className="text-warm-gray-dark">/</span>
            <span className="text-charcoal">{artwork.title}</span>
          </motion.nav>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────── */}
      <section className="py-10 md:py-16 bg-cream">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20">
            {/* ─── Image Column ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Main Image */}
              <div
                className={cn(
                  "relative bg-cream-dark overflow-hidden cursor-zoom-in",
                  zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                onClick={() => setZoomed(!zoomed)}
              >
                <div className="relative aspect-[3/4]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={artwork.images[activeImageIndex]}
                        alt={artwork.title}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-700 ease-out",
                          zoomed ? "scale-150" : "scale-100"
                        )}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Status Badge on Image */}
                <div
                  className={cn(
                    "absolute top-4 left-4 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-medium",
                    status.className
                  )}
                >
                  {status.label}
                </div>
                {/* Zoom Hint */}
                <div className="absolute bottom-4 right-4 text-[10px] tracking-[0.1em] uppercase text-charcoal-light/60 bg-white/80 px-3 py-1.5">
                  {zoomed ? "Click to zoom out" : "Click to zoom in"}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {artwork.images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {artwork.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImageIndex(i);
                        setZoomed(false);
                      }}
                      className={cn(
                        "relative w-20 h-20 overflow-hidden border-2 transition-colors duration-300",
                        activeImageIndex === i
                          ? "border-gold"
                          : "border-transparent hover:border-warm-gray-dark"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${artwork.title} view ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ─── Details Column ────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              {/* Collection Link */}
              {collection && (
                <Link
                  href={`/collections/${collection.slug}`}
                  className="text-[11px] tracking-[0.2em] uppercase text-gold hover:text-gold-dark transition-colors mb-3"
                >
                  {collection.title} Collection
                </Link>
              )}

              {/* Title & Year */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-medium text-black tracking-[-0.01em] leading-tight">
                {artwork.title}
              </h1>
              <p className="text-[13px] tracking-wider uppercase text-charcoal-light mt-2">
                {artwork.year}
              </p>

              <div className="divider-gold mt-6 mb-8" />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-1">
                    Medium
                  </p>
                  <p className="text-sm text-black">
                    {mediumLabels[artwork.medium] || artwork.medium}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-1">
                    Dimensions
                  </p>
                  <p className="text-sm text-black">{dimensionLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-1">
                    Category
                  </p>
                  <p className="text-sm text-black capitalize">
                    {artwork.category.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-1">
                    Status
                  </p>
                  <span
                    className={cn(
                      "inline-block px-3 py-1 text-[10px] tracking-[0.12em] uppercase font-medium",
                      status.className
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                  Price
                </p>
                {artwork.status === "available" && artwork.price ? (
                  <p className="font-serif text-2xl md:text-3xl text-black">
                    {formatPrice(artwork.price)}
                  </p>
                ) : (
                  <p className="font-serif text-xl text-charcoal-light italic">
                    Price on Inquiry
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-3">
                  About This Work
                </p>
                <p className="text-sm text-charcoal leading-relaxed">
                  {artwork.description}
                </p>
              </div>

              {/* Framing & Certificate */}
              <div className="bg-cream-dark p-6 mb-8 space-y-4">
                {artwork.framing && (
                  <div className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold flex-shrink-0 mt-0.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <rect x="7" y="7" width="10" height="10" />
                    </svg>
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-0.5">
                        Framing
                      </p>
                      <p className="text-sm text-black">{artwork.framing}</p>
                    </div>
                  </div>
                )}
                {artwork.certificate && (
                  <div className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold flex-shrink-0 mt-0.5"
                    >
                      <path d="M12 15l-3 3 1-4-3-3h4L12 7l1 4h4l-3 3 1 4z" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light mb-0.5">
                        Authenticity
                      </p>
                      <p className="text-sm text-black">
                        Includes signed Certificate of Authenticity
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-auto">
                {artwork.status === "available" && artwork.price && (
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                )}
                <Link href={`/contact?type=artwork&artwork=${artwork.slug}`} className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Inquire About This Piece
                  </Button>
                </Link>
                <Link
                  href="/contact?type=private_viewing"
                  className="block text-center text-[11px] tracking-[0.12em] uppercase text-gold hover:text-gold-dark transition-colors pt-2"
                >
                  Request Private Viewing
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Related Works ─────────────────────────────────── */}
      {relatedArtworks.length > 0 && (
        <section className="py-20 md:py-28 bg-cream border-t border-warm-gray">
          <div className="container-gallery">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">
                You May Also Love
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-black">
                Related Works
              </h2>
              <div className="divider-gold mx-auto mt-6" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedArtworks.map((relatedArtwork, i) => (
                <ArtworkCard
                  key={relatedArtwork.id}
                  artwork={relatedArtwork}
                  index={i}
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/gallery">
                <Button variant="outline">View All Works</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
