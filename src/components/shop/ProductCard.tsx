"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

export default function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const typeLabels: Record<string, { label: string; className: string }> = {
    print: { label: "Limited Edition Print", className: "bg-gold/10 text-gold" },
    original: { label: "Original", className: "bg-black text-white" },
    merchandise: { label: "Merchandise", className: "bg-charcoal-light/10 text-charcoal-light" },
    designers_collection: { label: "Designers Collection", className: "bg-gold/20 text-gold" },
    workshop: { label: "Workshop", className: "bg-charcoal-light/10 text-charcoal-light" },
  };

  const badge = typeLabels[product.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          {/* Quick View Hint */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="bg-black/80 backdrop-blur-sm text-center py-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-white font-medium">
                View Details
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1.5">
          {badge && (
            <span className={`inline-block px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase font-medium ${badge.className}`}>
              {badge.label}
            </span>
          )}
          <h3 className="font-serif text-lg text-black group-hover:text-gold transition-colors duration-300">
            {product.title}
          </h3>
          <p className="text-[13px] text-charcoal">
            From {formatPrice(product.basePrice)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
