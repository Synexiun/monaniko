"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { pressItems } from "@/data/artworks";

const exhibitions = [
  {
    year: "2024",
    title: "Luminous — Solo Exhibition",
    venue: "Mona Niko Gallery, Mission Viejo, CA",
  },
  {
    year: "2024",
    title: "Unveiled — Solo Exhibition",
    venue: "Mona Niko Gallery, Mission Viejo, CA",
  },
  {
    year: "2023",
    title: "Contemporary Voices",
    venue: "Orange County Museum of Art, Costa Mesa, CA",
  },
  {
    year: "2023",
    title: "Color & Emotion — Group Exhibition",
    venue: "Laguna Art Museum, Laguna Beach, CA",
  },
  {
    year: "2022",
    title: "New Perspectives",
    venue: "The Broad Stage, Santa Monica, CA",
  },
  {
    year: "2022",
    title: "Abstract Horizons — Juried Exhibition",
    venue: "Palm Springs Art Museum, Palm Springs, CA",
  },
  {
    year: "2021",
    title: "Emerging Artists Showcase",
    venue: "LA Art Show, Los Angeles Convention Center",
  },
];

const awards = [
  {
    year: "2024",
    title: "Artist of the Year",
    organization: "Orange County Arts Council",
  },
  {
    year: "2023",
    title: "Excellence in Contemporary Art",
    organization: "California Art Association",
  },
  {
    year: "2023",
    title: "Best Solo Exhibition",
    organization: "Southern California Gallery Awards",
  },
  {
    year: "2022",
    title: "Emerging Artist Award",
    organization: "National Arts Foundation",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative py-32 md:py-40 bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/hero/artist-portrait.jpg"
            alt="Mona Niko"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            The Artist
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-medium tracking-[-0.02em]"
          >
            About Mona Niko
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Contemporary artist, storyteller, and creative guide.
          </motion.p>
        </div>
      </section>

      {/* ─── Biography ────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/hero/artist-portrait.jpg"
                  alt="Mona Niko in her studio"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
                Biography
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-black font-medium mb-6">
                Where Emotion Meets Canvas
              </h2>
              <div className="divider-gold mb-8" />
              <div className="space-y-5 text-[15px] text-charcoal-light leading-[1.8]">
                <p>
                  Mona Niko is a contemporary fine artist whose work exists at
                  the intersection of abstract expressionism and emotional
                  narrative. Born with an innate fascination for color and
                  light, she has dedicated her life to translating the
                  intangible — memory, emotion, the quiet brilliance of
                  ordinary moments — into visual experiences that resonate
                  deeply with collectors worldwide.
                </p>
                <p>
                  Working primarily in oils and mixed media, Mona&apos;s
                  paintings are characterized by their luminous color
                  palettes, rich textural surfaces, and a commanding sense of
                  presence. Each piece is the result of an intuitive creative
                  process that balances careful intention with spontaneous
                  expression, allowing the work to evolve organically on
                  canvas.
                </p>
                <p>
                  Her artistic journey has been shaped by a deep appreciation
                  for nature, travel, and the meditative practices that
                  inform her daily life. These influences manifest in work
                  that ranges from bold, gestural abstractions to intimate,
                  contemplative compositions — unified by an unwavering
                  commitment to authenticity and emotional truth.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Artistic Philosophy ──────────────────────────── */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container-gallery">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
                Artistic Philosophy
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-white font-medium mb-6">
                &ldquo;Art should be felt before it is understood.&rdquo;
              </h2>
              <div className="divider-gold mx-auto mb-10" />
              <div className="space-y-6 text-[15px] text-white/60 leading-[1.8]">
                <p>
                  I believe that the most powerful art operates on an
                  emotional frequency that bypasses intellectual analysis. When
                  someone stands before one of my paintings and feels
                  something shift within them — a memory surfacing, a breath
                  deepening, a sudden awareness of beauty — that is the moment
                  the artwork fulfills its purpose.
                </p>
                <p>
                  My practice is rooted in the belief that vulnerability is
                  strength. Every canvas begins as an act of courage — a
                  willingness to sit with uncertainty and trust the creative
                  process. I pour myself into each piece, not to create
                  decoration, but to create connection. A bridge between my
                  inner world and yours.
                </p>
                <p>
                  Color is my language, texture is my voice, and light is my
                  north star. Through these elements, I seek to create works
                  that don&apos;t just occupy space on a wall but transform
                  the energy of a room and the experience of those who
                  inhabit it.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Studio / Gallery ─────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
                The Space
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-black font-medium mb-6">
                Studio &amp; Gallery
              </h2>
              <div className="divider-gold mb-8" />
              <div className="space-y-5 text-[15px] text-charcoal-light leading-[1.8]">
                <p>
                  Nestled in the heart of Mission Viejo, the Mona Niko
                  Gallery serves as both a working studio and an intimate
                  exhibition space. Here, visitors can experience art in the
                  very environment where it is created — surrounded by the
                  energy, textures, and light that inspire each piece.
                </p>
                <p>
                  The gallery is open for private viewings and scheduled
                  appointments, offering collectors the rare opportunity to
                  engage with the art and artist in a personal, unhurried
                  setting. It also serves as the home for workshops and
                  creative events throughout the year.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button variant="gold">Schedule a Visit</Button>
                </Link>
                <Link href="/workshops">
                  <Button variant="outline">View Workshops</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/hero/workshop-preview.jpg"
                  alt="Mona Niko Gallery & Studio"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Exhibition History ────────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <SectionHeading
            title="Exhibition History"
            subtitle="Selected exhibitions and shows."
          />
          <div className="max-w-3xl mx-auto">
            {exhibitions.map((exhibition, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-start gap-6 py-6 border-b border-warm-gray last:border-0"
              >
                <span className="font-serif text-lg text-gold flex-shrink-0 w-16">
                  {exhibition.year}
                </span>
                <div>
                  <h3 className="font-serif text-base text-black">
                    {exhibition.title}
                  </h3>
                  <p className="text-sm text-charcoal-light mt-1">
                    {exhibition.venue}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Awards & Recognition ─────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="Awards & Recognition"
            subtitle="Honors and accolades received throughout the artistic journey."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {awards.map((award, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-6 md:p-8"
              >
                <span className="text-[11px] tracking-[0.15em] uppercase text-gold">
                  {award.year}
                </span>
                <h3 className="font-serif text-lg text-black mt-2 mb-1">
                  {award.title}
                </h3>
                <p className="text-sm text-charcoal-light">
                  {award.organization}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Press Mentions ───────────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <SectionHeading
            title="In the Press"
            subtitle="Selected media features and press mentions."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pressItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white p-8"
              >
                <p className="text-[11px] tracking-[0.15em] uppercase text-gold mb-3">
                  {item.publication}
                </p>
                <h3 className="font-serif text-base text-black mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-charcoal-light leading-relaxed mb-4">
                  {item.excerpt}
                </p>
                <p className="text-[11px] text-charcoal-light">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/press">
              <Button variant="outline">View All Press</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
