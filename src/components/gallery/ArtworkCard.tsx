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
          <Image
            src={artwork.images[0]}
            alt={artwork.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          {/* Status Badge */}
          {status && (
            <div className={cn("absolute top-4 left-4 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-medium", status.className)}>
              {status.label}
            </div>
          )}
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1">
          <h3 className="font-serif text-lg text-black group-hover:text-gold transition-colors duration-300">
            {artwork.title}
          </h3>
          <p className="text-[12px] tracking-wider uppercase text-charcoal-light">
            {artwork.medium.replace("_", " ")} — {artwork.dimensions.width}&quot; × {artwork.dimensions.height}&quot;
          </p>
          <p className="text-[13px] text-charcoal">
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
