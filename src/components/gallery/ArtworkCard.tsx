"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Artwork } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
  priority?: boolean;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  sold: { label: "Sold", className: "bg-charcoal text-white" },
  on_exhibition: { label: "On Exhibition", className: "bg-gold text-white" },
  commissioned: { label: "Commissioned", className: "bg-charcoal-light text-white" },
};

export default function ArtworkCard({ artwork, index = 0, priority = false }: ArtworkCardProps) {
  const status = statusLabels[artwork.status];
  const coverImage = Array.isArray(artwork.images) ? artwork.images[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/gallery/${artwork.slug}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={artwork.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-warm-gray flex items-center justify-center">
              <span className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light/40">No Image</span>
            </div>
          )}
          {/* Status Badge */}
          {status && (
            <div className={cn("absolute top-4 left-4 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-medium", status.className)}>
              {status.label}
            </div>
          )}
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-500" />
          {/* View Work reveal */}
          <div className="absolute inset-x-0 bottom-0 px-5 py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center justify-between pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="relative text-[10px] tracking-[0.22em] uppercase text-white/90">View Work</span>
            <span className="relative text-white/60">→</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-5 space-y-1.5">
          <h3 className="font-serif text-lg text-black group-hover:text-gold transition-colors duration-300 leading-tight">
            {artwork.title}
          </h3>
          <p className="text-[11px] tracking-[0.14em] uppercase text-charcoal-light">
            {artwork.medium ? artwork.medium.replace("_", " ") : ""}
            {artwork.dimensions ? ` — ${artwork.dimensions.width}" × ${artwork.dimensions.height}"` : ""}
          </p>
          <p className="text-[13px] font-medium text-charcoal">
            {artwork.status === "available" && artwork.price
              ? formatPrice(artwork.price)
              : artwork.priceOnInquiry
              ? "Price on Inquiry"
              : ""}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
