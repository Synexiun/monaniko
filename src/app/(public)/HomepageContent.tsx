"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import CollectionCard from "@/components/gallery/CollectionCard";
import { artworks, collections, testimonials, workshops } from "@/data/artworks";

const featuredArtworks = artworks.filter((a) => a.featured).slice(0, 4);
const featuredCollections = collections.filter((c) => c.featured);

const SLIDE_INTERVAL = 5000;
const FALLBACK_IMAGE = "/images/hero/hero-main.jpg";

function useHeroImages() {
  const [images, setImages] = useState<string[]>([FALLBACK_IMAGE]);

  useEffect(() => {
    fetch("/api/hero-images")
      .then((res) => res.json())
      .then((data: string[]) => {
        if (data.length > 0) setImages(data);
      })
      .catch(() => {});
  }, []);

  return images;
}

function HeroSlideshow() {
  const images = useHeroImages();
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(advance, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [advance, images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="hero-ken-burns absolute inset-0"
          style={{
            backgroundImage: `url(${images[current]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </AnimatePresence>

      {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 z-10 flex gap-2 items-center">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group p-1"
            >
              <div className={`rounded-full transition-all duration-500 ${
                i === current
                  ? "w-6 h-1 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 group-hover:bg-white/80"
              }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-cream">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-14 items-center">

            {/* Image box — sharp, vivid, no overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="relative h-[62vh] min-h-[460px] overflow-hidden shadow-2xl"
            >
              <HeroSlideshow />
            </motion.div>

            {/* Text */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-[10px] tracking-[0.35em] uppercase text-gold mb-6"
              >
                Contemporary Fine Art Gallery
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.25, 0, 0, 1] }}
                className="font-display font-light italic text-black display-hero leading-none"
              >
                <span className="block">Mona</span>
                <span className="block">Niko</span>
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
                className="origin-left mt-6 mb-6 w-12 h-px bg-gold"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="text-charcoal-light leading-relaxed mb-8 max-w-xs"
              >
                Original paintings and limited editions that transform spaces and captivate collectors worldwide.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="/gallery">
                  <Button variant="gold" size="lg">View Gallery</Button>
                </Link>
                <Link href="/collections">
                  <Button variant="outline" size="lg">Explore Collections</Button>
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="mt-8 text-[9px] tracking-[0.35em] uppercase text-warm-gray-dark"
              >
                Mission Viejo · California
              </motion.p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Featured Artworks ─────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="Featured Works"
            subtitle="A curated selection of recent original paintings available for collectors."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredArtworks.map((artwork, i) => (
              <ArtworkCard key={artwork.id} artwork={artwork} index={i} priority={i < 2} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/gallery">
              <Button variant="outline">View All Works</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Artist Statement Band ─────────────────────────── */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src="/images/hero/artist-portrait.jpg" alt="Mona Niko in her studio" fill className="object-cover" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:pl-8"
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">About the Artist</p>
              <h2
                className="font-display font-light italic text-white mb-6"
                style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", lineHeight: 1.1 }}
              >
                Where Emotion Meets Canvas
              </h2>
              <div className="divider-gold mb-8" />
              <p className="text-white/60 leading-relaxed mb-6">
                Mona Niko is a contemporary artist whose work bridges the gap between abstract expressionism
                and emotional storytelling. Working primarily in oils and mixed media, she creates pieces that
                invite viewers into intimate conversations about light, identity, and the beauty found in
                life&apos;s quiet moments.
              </p>
              <p className="text-white/60 leading-relaxed mb-8">
                Based in Southern California, Mona&apos;s gallery at Mission Viejo serves as both creative
                studio and exhibition space, offering collectors the rare opportunity to experience art in
                the environment where it was born.
              </p>
              <Link href="/about">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-black hover:border-white">
                  Read Full Story
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Collections ───────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="Collections"
            subtitle="Explore curated bodies of work, each telling a unique visual story."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredCollections.map((collection, i) => (
              <CollectionCard key={collection.id} collection={collection} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services Triptych ──────────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <SectionHeading
            title="The Mona Niko Experience"
            subtitle="Beyond the gallery — discover unique ways to engage with art."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Original Paintings",
                description: "Acquire museum-quality original works directly from the artist. Each piece comes with a certificate of authenticity.",
                cta: "Browse Originals",
                href: "/shop/originals",
                icon: (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>),
              },
              {
                title: "Art Workshops",
                description: "Join intimate creative sessions led by Mona. From abstract expressionism to color theory — unlock your artistic potential.",
                cta: "View Workshops",
                href: "/workshops",
                icon: (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>),
              },
              {
                title: "Custom Commissions",
                description: "Commission a bespoke artwork tailored to your space and vision. A collaborative journey from concept to masterpiece.",
                cta: "Start a Commission",
                href: "/commissions",
                icon: (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>),
              },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={service.href} className="group block bg-white p-8 md:p-12 h-full border-t-2 border-gold/15 hover:border-gold/60 hover:shadow-xl transition-all duration-500">
                  <div className="text-gold mb-8">{service.icon}</div>
                  <h3 className="font-serif text-2xl text-black mb-4">{service.title}</h3>
                  <p className="text-sm text-charcoal-light leading-relaxed mb-8">{service.description}</p>
                  <span className="text-[11px] tracking-[0.15em] uppercase text-gold group-hover:text-gold-dark transition-colors font-medium inline-flex items-center gap-1.5">
                    {service.cta}
                    <span className="inline-block translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="Collector Voices"
            subtitle="What collectors and art lovers say about working with Mona Niko."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 md:p-10 relative overflow-hidden"
              >
                <span className="absolute -top-3 right-5 font-display text-[6rem] leading-none text-gold/[0.07] select-none pointer-events-none italic" aria-hidden="true">&ldquo;</span>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-[15px] text-charcoal leading-relaxed italic mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-medium text-black">{testimonial.name}</p>
                  {testimonial.role && <p className="text-[12px] text-charcoal-light mt-0.5">{testimonial.role}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Workshop Preview ──────────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeading
                title="Upcoming Workshops"
                subtitle="Learn from Mona in intimate, hands-on creative sessions."
                align="left"
              />
              <div className="space-y-6">
                {workshops.slice(0, 2).map((workshop) => (
                  <Link key={workshop.id} href={`/workshops/${workshop.slug}`} className="group block bg-white p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] tracking-[0.15em] uppercase text-gold mb-2">
                          {new Date(workshop.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <h3 className="font-serif text-lg text-black group-hover:text-gold transition-colors">{workshop.title}</h3>
                        <p className="text-sm text-charcoal-light mt-1">{workshop.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-serif text-lg text-black">${workshop.price}</p>
                        <p className="text-[11px] text-gold mt-1">{workshop.spotsLeft} spots left</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/workshops"><Button variant="outline">All Workshops</Button></Link>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[4/5] overflow-hidden hidden lg:block"
            >
              <Image src="/images/hero/workshop-preview.jpg" alt="Art workshop at Mona Niko Gallery" fill className="object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────── */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero/cta-bg.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className="font-display font-light italic text-white mb-4"
              style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)", lineHeight: 1.05 }}
            >
              Begin Your Collection
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-10">
              Whether you&apos;re a first-time buyer or an established collector, every great collection starts with a single piece.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop/originals"><Button variant="gold" size="lg">Shop Originals</Button></Link>
              <Link href="/shop/prints">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white hover:text-black hover:border-white">
                  Browse Prints
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
