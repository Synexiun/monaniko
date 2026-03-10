"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import CollectionCard from "@/components/gallery/CollectionCard";
import { artworks, collections, testimonials, workshops } from "@/data/artworks";

const featuredArtworks = artworks.filter((a) => a.featured).slice(0, 4);
const featuredCollections = collections.filter((c) => c.featured);

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[750px] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero-main.jpg"
            alt="Mona Niko Gallery"
            fill
            className="object-cover scale-105"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </div>

        {/* Content — bottom-aligned, editorial style */}
        <div className="relative z-10 container-gallery pb-20 md:pb-28 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-[1px] bg-gold" />
              <p className="text-[11px] md:text-[12px] tracking-[0.35em] uppercase text-gold font-sans font-medium">
                Contemporary Fine Art
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-display text-6xl md:text-8xl lg:text-9xl text-white font-light leading-[0.95] tracking-[0.01em]"
            >
              Mona
              <br />
              <span className="italic font-light">Niko</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 text-[15px] md:text-[17px] text-white/60 max-w-md leading-relaxed font-light font-sans"
            >
              Original paintings and limited editions that transform spaces
              and captivate collectors worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link href="/gallery">
                <Button variant="gold" size="lg">View Gallery</Button>
              </Link>
              <Link href="/collections">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white hover:text-black hover:border-white"
                >
                  Explore Collections
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-3"
        >
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/40 font-sans [writing-mode:vertical-lr]">
            Scroll
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-10 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* ─── Featured Artworks ─────────────────────────────── */}
      <section className="py-28 md:py-36">
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
          <div className="text-center mt-14">
            <Link href="/gallery">
              <Button variant="outline">View All Works</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Artist Statement Band ─────────────────────────── */}
      <section className="py-28 md:py-36 bg-black text-white overflow-hidden">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/hero/artist-portrait.jpg"
                  alt="Mona Niko in her studio"
                  fill
                  className="object-cover"
                />
                {/* Gold corner accent */}
                <div className="absolute top-0 left-0 w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gold/40" />
                  <div className="absolute top-0 left-0 h-full w-[1px] bg-gold/40" />
                </div>
                <div className="absolute bottom-0 right-0 w-16 h-16">
                  <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gold/40" />
                  <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gold/40" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[1px] bg-gold" />
                <p className="text-[11px] tracking-[0.3em] uppercase text-gold font-sans font-medium">
                  About the Artist
                </p>
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-white font-light mb-8 leading-[1.1]">
                Where Emotion
                <br />
                <span className="italic">Meets Canvas</span>
              </h2>
              <p className="text-[15px] text-white/50 leading-[1.8] mb-6 font-light">
                Mona Niko is a contemporary artist whose work bridges the gap between abstract expressionism
                and emotional storytelling. Working primarily in oils and mixed media, she creates pieces that
                invite viewers into intimate conversations about light, identity, and the beauty found in
                life&apos;s quiet moments.
              </p>
              <p className="text-[15px] text-white/50 leading-[1.8] mb-10 font-light">
                Based in Southern California, Mona&apos;s gallery at Mission Viejo serves as both creative
                studio and exhibition space, offering collectors the rare opportunity to experience art in
                the environment where it was born.
              </p>
              <Link href="/about">
                <Button
                  variant="outline"
                  className="border-white/25 text-white hover:bg-white hover:text-black hover:border-white"
                >
                  Read Full Story
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Collections ───────────────────────────────────── */}
      <section className="py-28 md:py-36">
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

      {/* ─── Services ─────────────────────────────────────────── */}
      <section className="py-28 md:py-36 bg-cream-dark">
        <div className="container-gallery">
          <SectionHeading
            title="The Experience"
            subtitle="Beyond the gallery — discover unique ways to engage with art."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-warm-gray/50">
            {[
              {
                title: "Original Paintings",
                description:
                  "Acquire museum-quality original works directly from the artist. Each piece comes with a certificate of authenticity.",
                cta: "Browse Originals",
                href: "/shop/originals",
                num: "01",
              },
              {
                title: "Art Workshops",
                description:
                  "Join intimate creative sessions led by Mona. From abstract expressionism to color theory — unlock your artistic potential.",
                cta: "View Workshops",
                href: "/workshops",
                num: "02",
              },
              {
                title: "Custom Commissions",
                description:
                  "Commission a bespoke artwork tailored to your space and vision. A collaborative journey from concept to masterpiece.",
                cta: "Start a Commission",
                href: "/commissions",
                num: "03",
              },
              {
                title: "Kids Club",
                description:
                  "Creative art programs for young artists ages 4-14. Weekly sessions, birthday parties, and parent-child workshops in a nurturing environment.",
                cta: "Explore Kids Club",
                href: "/kids-club",
                num: "04",
              },
              {
                title: "Events & Parties",
                description:
                  "Host memorable events at the gallery — from wine and painting nights to private celebrations and corporate team-building experiences.",
                cta: "Plan an Event",
                href: "/contact",
                num: "05",
              },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={i >= 3 ? "sm:col-span-1" : ""}
              >
                <Link
                  href={service.href}
                  className="group block bg-white p-10 md:p-12 h-full relative overflow-hidden"
                >
                  {/* Background number */}
                  <span className="absolute top-6 right-8 font-display text-[5rem] text-charcoal/[0.03] font-light leading-none select-none">
                    {service.num}
                  </span>

                  <div className="relative">
                    <div className="w-8 h-[1px] bg-gold mb-8 group-hover:w-12 transition-all duration-500" />
                    <h3 className="font-serif text-xl md:text-[1.35rem] text-black mb-4 leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-[14px] text-charcoal-light leading-relaxed mb-8 font-light">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-gold group-hover:text-gold-dark transition-colors font-sans font-medium">
                      {service.cta}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────── */}
      <section className="py-28 md:py-36">
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
                className="relative bg-white p-10 md:p-12"
              >
                {/* Quote mark */}
                <span className="absolute top-8 right-8 font-display text-6xl text-gold/10 leading-none select-none">
                  &ldquo;
                </span>

                <div className="flex gap-[3px] mb-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-[14px] text-charcoal leading-[1.8] font-light italic mb-8">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-gold" />
                  <div>
                    <p className="text-[13px] font-medium text-black font-sans">{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="text-[11px] text-charcoal-light mt-0.5 font-sans">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Workshop Preview ──────────────────────────────── */}
      <section className="py-28 md:py-36 bg-cream-dark">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <SectionHeading
                title="Upcoming Workshops"
                subtitle="Learn from Mona in intimate, hands-on creative sessions."
                align="left"
              />
              <div className="space-y-4">
                {workshops.slice(0, 2).map((workshop) => (
                  <Link
                    key={workshop.id}
                    href={`/workshops/${workshop.slug}`}
                    className="group block bg-white p-6 md:p-8 hover:shadow-lg transition-all duration-500"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-[1px] bg-gold" />
                          <p className="text-[10px] tracking-[0.2em] uppercase text-gold font-sans font-medium">
                            {new Date(workshop.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <h3 className="font-serif text-lg md:text-xl text-black group-hover:text-gold transition-colors duration-300">
                          {workshop.title}
                        </h3>
                        <p className="text-[13px] text-charcoal-light mt-2 leading-relaxed font-light">
                          {workshop.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 pt-8">
                        <p className="font-display text-2xl text-black font-light">${workshop.price}</p>
                        <p className="text-[10px] tracking-[0.1em] uppercase text-gold mt-1 font-sans">
                          {workshop.spotsLeft} spots left
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-10">
                <Link href="/workshops">
                  <Button variant="outline">All Workshops</Button>
                </Link>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] overflow-hidden hidden lg:block"
            >
              <Image
                src="/images/hero/workshop-preview.jpg"
                alt="Art workshop at Mona Niko Gallery"
                fill
                className="object-cover"
              />
              <div className="absolute top-0 left-0 w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gold/40" />
                <div className="absolute top-0 left-0 h-full w-[1px] bg-gold/40" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────── */}
      <section className="relative py-36 md:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/cta-bg.jpg"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-12 h-[1px] bg-gold mx-auto mb-8" />
            <h2 className="font-display text-4xl md:text-6xl text-white font-light mb-6 leading-[1.1]">
              Begin Your
              <br />
              <span className="italic">Collection</span>
            </h2>
            <p className="text-[15px] text-white/50 max-w-md mx-auto mb-12 font-light leading-relaxed">
              Whether you&apos;re a first-time buyer or an established collector,
              every great collection starts with a single piece.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop/originals">
                <Button variant="gold" size="lg">Shop Originals</Button>
              </Link>
              <Link href="/shop/prints">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white hover:text-black hover:border-white"
                >
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
