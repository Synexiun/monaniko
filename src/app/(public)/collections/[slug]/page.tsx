"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import { artworks, collections } from "@/data/artworks";

export default function CollectionDetailPage() {
  const params = useParams<{ slug: string }>();
  const collection = collections.find((c) => c.slug === params.slug);

  if (!collection) {
    notFound();
  }

  const collectionArtworks = artworks.filter((a) =>
    collection.artworkIds.includes(a.id)
  );

  const otherCollections = collections.filter(
    (c) => c.id !== collection.id
  );

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
              href="/collections"
              className="text-charcoal-light hover:text-gold transition-colors"
            >
              Collections
            </Link>
            <span className="text-warm-gray-dark">/</span>
            <span className="text-charcoal">{collection.title}</span>
          </motion.nav>
        </div>
      </div>

      {/* ─── Collection Hero ───────────────────────────────── */}
      <section className="py-10 md:py-16 bg-cream">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                <Image
                  src={collection.coverImage}
                  alt={collection.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </motion.div>

            {/* Collection Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {collection.year && (
                <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">
                  Collection &mdash; {collection.year}
                </p>
              )}
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-medium text-black tracking-[-0.01em] leading-tight">
                {collection.title}
              </h1>
              <div className="divider-gold mt-6 mb-8" />
              <p className="text-[15px] text-charcoal leading-relaxed mb-6">
                {collection.description}
              </p>
              <p className="text-[12px] tracking-wider uppercase text-charcoal-light">
                {collectionArtworks.length}{" "}
                {collectionArtworks.length === 1 ? "Work" : "Works"} in
                Collection
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Artworks Grid ─────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-cream border-t border-warm-gray">
        <div className="container-gallery">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">
              {collection.title}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-black">
              Works in This Collection
            </h2>
            <div className="divider-gold mx-auto mt-6" />
          </motion.div>

          {collectionArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {collectionArtworks.map((artwork, i) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  index={i}
                  priority={i < 3}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-charcoal-light">
                Works from this collection will be available soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Other Collections ─────────────────────────────── */}
      {otherCollections.length > 0 && (
        <section className="py-20 md:py-28 bg-cream-dark">
          <div className="container-gallery">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">
                Explore More
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-black">
                Other Collections
              </h2>
              <div className="divider-gold mx-auto mt-6" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {otherCollections.map((otherCollection, i) => (
                <motion.div
                  key={otherCollection.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    href={`/collections/${otherCollection.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                      <Image
                        src={otherCollection.coverImage}
                        alt={otherCollection.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-white/60 mb-2">
                          Collection
                          {otherCollection.year &&
                            ` \u2014 ${otherCollection.year}`}
                        </p>
                        <h3 className="font-serif text-2xl md:text-3xl text-white group-hover:text-gold-light transition-colors duration-300">
                          {otherCollection.title}
                        </h3>
                        <span className="inline-block mt-4 text-[11px] tracking-[0.15em] uppercase text-gold group-hover:text-gold-light transition-colors">
                          View Collection
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Inquire CTA ───────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-5">
              Interested in This Collection?
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-medium mb-4">
              Inquire About Availability
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
              Contact the gallery to learn more about available works, pricing,
              and private viewings for the {collection.title} collection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/contact?type=artwork&collection=${collection.slug}`}>
                <Button
                  variant="gold"
                  size="lg"
                >
                  Send an Inquiry
                </Button>
              </Link>
              <Link href="/contact?type=private_viewing">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white hover:text-black hover:border-white"
                >
                  Schedule a Viewing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
