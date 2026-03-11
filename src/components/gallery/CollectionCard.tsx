"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
  index?: number;
}

export default function CollectionCard({ collection, index = 0 }: CollectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/collections/${collection.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
          <Image
            src={collection.coverImage}
            alt={collection.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/60 mb-2">
              Collection {collection.year && `— ${collection.year}`}
            </p>
            <h3
              className="font-display font-light italic text-white group-hover:text-gold-light transition-colors duration-300"
              style={{ fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)", lineHeight: 1.1 }}
            >
              {collection.title}
            </h3>
            <p className="text-sm text-white/60 mt-2 line-clamp-2 max-w-sm">
              {collection.description}
            </p>
            <span className="inline-flex items-center gap-2 mt-4 text-[11px] tracking-[0.15em] uppercase text-gold group-hover:text-gold-light transition-colors">
              View Collection
              <span className="inline-block translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
