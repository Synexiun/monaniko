"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { workshops } from "@/data/artworks";
import { formatPrice } from "@/lib/utils";
import PageHero from "@/components/ui/PageHero";

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All Levels",
};

export default function WorkshopsPage() {
  return (
    <>
      <PageHero image="/images/hero/workshop/hero.jpg" alt="Mona Niko Workshops" />

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/artworks/artwork-8.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            Learn &middot; Create &middot; Transform
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
          >
            Workshops &amp; Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Intimate creative sessions led by Mona Niko. Discover your artistic
            voice in a supportive, inspiring environment.
          </motion.p>
        </div>
      </section>

      {/* ─── Workshop Grid ────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="Upcoming Workshops"
            subtitle="Explore our current schedule of workshops and creative experiences."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop, i) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/workshops/${workshop.slug}`}
                  className="group block bg-white h-full hover:shadow-lg transition-shadow duration-500"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={workshop.images[0]}
                      alt={workshop.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Level Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-white/90 backdrop-blur-sm text-[10px] tracking-[0.15em] uppercase text-charcoal px-3 py-1.5">
                        {levelLabels[workshop.level]}
                      </span>
                    </div>
                    {/* Online Badge */}
                    {workshop.isOnline && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-block bg-gold text-white text-[10px] tracking-[0.15em] uppercase px-3 py-1.5">
                          Online
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    {/* Date */}
                    <p className="text-[11px] tracking-[0.15em] uppercase text-gold mb-3">
                      {new Date(workshop.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>

                    {/* Title */}
                    <h3 className="font-serif text-xl text-black group-hover:text-gold transition-colors duration-300 mb-3">
                      {workshop.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-charcoal-light leading-relaxed mb-5">
                      {workshop.description}
                    </p>

                    {/* Meta Row */}
                    <div className="flex items-center justify-between pt-5 border-t border-warm-gray">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-charcoal-light">
                          {workshop.location}
                        </span>
                      </div>
                    </div>

                    {/* Price & Spots */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-serif text-lg text-black">
                        {formatPrice(workshop.price)}
                      </p>
                      <p
                        className={`text-[11px] tracking-[0.1em] uppercase font-medium ${
                          workshop.spotsLeft <= 5
                            ? "text-error"
                            : "text-gold"
                        }`}
                      >
                        {workshop.spotsLeft} spots left
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Private Sessions CTA ─────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
              Bespoke Experience
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-black font-medium mb-4">
              Private &amp; Group Sessions
            </h2>
            <div className="divider-gold mx-auto mb-8" />
            <p className="text-charcoal-light max-w-lg mx-auto leading-relaxed mb-10">
              Looking for a private workshop or a custom group experience?
              Mona offers tailored creative sessions for individuals,
              corporate teams, and special events.
            </p>
            <Link href="/contact">
              <Button variant="gold" size="lg">
                Inquire About Private Sessions
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
