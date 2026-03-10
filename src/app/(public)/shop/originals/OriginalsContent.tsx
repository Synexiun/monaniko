"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { artworks } from "@/data/artworks";
import { formatPrice } from "@/lib/utils";

const availableOriginals = artworks.filter((a) => a.status === "available");

export default function OriginalsShopPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-4.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10">
          <div className="container-gallery text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4"
            >
              <Link
                href="/shop"
                className="text-[11px] tracking-[0.2em] uppercase text-white/40 hover:text-gold transition-colors font-medium"
              >
                Shop
              </Link>
              <span className="text-white/20 mx-3">/</span>
              <span className="text-[11px] tracking-[0.2em] uppercase text-gold font-medium">
                Originals
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
            >
              Original Paintings
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-5 text-base text-white/60 max-w-lg mx-auto leading-relaxed"
            >
              One-of-a-kind works by Mona Niko. Each original painting comes
              with a certificate of authenticity and complimentary white-glove
              delivery within Southern California.
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

      {/* ─── Artworks Grid ─────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          {/* Info Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-between mb-12 pb-6 border-b border-warm-gray"
          >
            <p className="text-sm text-charcoal-light">
              {availableOriginals.length} original{availableOriginals.length !== 1 ? "s" : ""} available
            </p>
            <p className="text-[11px] tracking-[0.12em] uppercase text-charcoal-light">
              Certificate of authenticity included
            </p>
          </motion.div>

          {availableOriginals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {availableOriginals.map((artwork, i) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
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
                        priority={i < 2}
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>

                    {/* Info */}
                    <div className="mt-4 space-y-1.5">
                      <h3 className="font-serif text-xl text-black group-hover:text-gold transition-colors duration-300">
                        {artwork.title}
                      </h3>
                      <p className="text-[12px] tracking-wider uppercase text-charcoal-light">
                        {artwork.medium.replace("_", " ")} &mdash;{" "}
                        {artwork.dimensions.width}&quot; &times;{" "}
                        {artwork.dimensions.height}&quot;
                      </p>
                      <p className="font-serif text-lg text-black">
                        {artwork.price
                          ? formatPrice(artwork.price)
                          : "Price on Inquiry"}
                      </p>
                    </div>
                  </Link>

                  {/* CTAs */}
                  <div className="mt-4 flex gap-3">
                    <Link href={`/contact?subject=Inquiry: ${artwork.title}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Inquire
                      </Button>
                    </Link>
                    <Link href={`/gallery/${artwork.slug}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-charcoal-light mb-4">
                All originals are currently spoken for
              </p>
              <p className="text-sm text-charcoal-light max-w-md mx-auto mb-8">
                New works are released throughout the year. Join the collector&apos;s
                circle for early access to new original paintings.
              </p>
              <Link href="/commissions">
                <Button variant="gold">Commission a Custom Work</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Commissioning CTA ─────────────────────────────── */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading
              title="Looking for Something Unique?"
              subtitle="Commission a bespoke artwork tailored to your space and vision. Mona works closely with collectors to create pieces that resonate on a deeply personal level."
              light
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
              <Link href="/commissions">
                <Button variant="gold" size="lg">
                  Start a Commission
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white hover:text-black hover:border-white"
                >
                  Schedule a Visit
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
