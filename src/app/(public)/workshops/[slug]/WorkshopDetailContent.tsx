"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { workshops } from "@/data/artworks";
import { formatPrice } from "@/lib/utils";

const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All Levels",
};

const levelDescriptions: Record<string, string> = {
  beginner: "Perfect for those new to art. No prior experience needed.",
  intermediate: "Some painting experience recommended.",
  advanced: "For experienced artists looking to refine their skills.",
  all_levels: "Designed for artists at every stage of their journey.",
};

export default function WorkshopDetailContent() {
  const params = useParams();
  const workshop = workshops.find((w) => w.slug === params.slug);

  if (!workshop) {
    return (
      <section className="py-32 md:py-40">
        <div className="container-gallery text-center">
          <h1 className="font-serif text-3xl text-black mb-4">
            Workshop Not Found
          </h1>
          <p className="text-charcoal-light mb-8">
            The workshop you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/workshops">
            <Button variant="outline">Back to Workshops</Button>
          </Link>
        </div>
      </section>
    );
  }

  const formattedDate = new Date(workshop.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const spotsPercentage =
    ((workshop.capacity - workshop.spotsLeft) / workshop.capacity) * 100;

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={workshop.images[0]}
            alt={workshop.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/workshops"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/50 hover:text-gold transition-colors mb-8"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All Workshops
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            {formattedDate}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-light tracking-[-0.02em] max-w-3xl mx-auto"
          >
            {workshop.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 text-base text-white/60 max-w-xl mx-auto"
          >
            {workshop.description}
          </motion.p>
        </div>
      </section>

      {/* ─── Workshop Details ─────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative aspect-[16/9] overflow-hidden"
              >
                <Image src={workshop.images[0]} alt={workshop.title} fill className="object-cover" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-2xl md:text-3xl text-black font-medium mb-6">
                  About This Workshop
                </h2>
                <div className="divider-gold mb-8" />
                <p className="text-charcoal-light leading-[1.8] text-[15px]">
                  {workshop.longDescription}
                </p>
              </motion.div>

              {workshop.materials && workshop.materials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-serif text-2xl text-black font-medium mb-6">Materials Included</h2>
                  <div className="divider-gold mb-8" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workshop.materials.map((material) => (
                      <div key={material} className="flex items-center gap-3 bg-cream-dark px-5 py-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold flex-shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-sm text-charcoal">{material}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-2xl text-black font-medium mb-6">Skill Level</h2>
                <div className="divider-gold mb-8" />
                <div className="bg-cream-dark p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full ${
                          level === "beginner" &&
                          (workshop.level === "beginner" || workshop.level === "intermediate" || workshop.level === "advanced" || workshop.level === "all_levels")
                            ? "bg-gold"
                            : level === "intermediate" &&
                              (workshop.level === "intermediate" || workshop.level === "advanced" || workshop.level === "all_levels")
                            ? "bg-gold"
                            : level === "advanced" &&
                              (workshop.level === "advanced" || workshop.level === "all_levels")
                            ? "bg-gold"
                            : "bg-warm-gray"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-black mb-1">{levelLabels[workshop.level]}</p>
                  <p className="text-sm text-charcoal-light">{levelDescriptions[workshop.level]}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-2xl text-black font-medium mb-6">Your Instructor</h2>
                <div className="divider-gold mb-8" />
                <div className="flex items-start gap-6 bg-cream-dark p-6 md:p-8">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                    <Image src="/images/hero/artist-portrait.jpg" alt={workshop.instructor || "Instructor"} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-black mb-2">{workshop.instructor}</h3>
                    <p className="text-sm text-charcoal-light leading-relaxed">
                      Contemporary artist whose work bridges abstract expressionism and emotional storytelling. With years of teaching experience, Mona creates an inspiring, supportive environment where artists of every level can discover their creative voice.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar — Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white border border-warm-gray p-8 sticky top-[calc(var(--header-height)+2rem)]"
              >
                <div className="text-center mb-8">
                  <p className="font-serif text-3xl text-black">{formatPrice(workshop.price)}</p>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light mt-1">per person</p>
                </div>

                <div className="space-y-4 mb-8 pb-8 border-b border-warm-gray">
                  {[
                    { icon: "calendar", label: "Date", value: formattedDate },
                    { icon: "clock", label: "Time", value: workshop.time },
                    { icon: "duration", label: "Duration", value: workshop.duration },
                    { icon: "location", label: "Location", value: workshop.location },
                    { icon: "capacity", label: "Capacity", value: `${workshop.capacity} participants` },
                  ].map(({ label, value }) => (
                    value && (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-gold">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mb-0.5">{label}</p>
                          <p className="text-sm text-black">{value}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-charcoal">Spots Remaining</p>
                    <p className="text-sm font-medium text-black">{workshop.spotsLeft} of {workshop.capacity}</p>
                  </div>
                  <div className="w-full bg-warm-gray rounded-full h-2">
                    <div className="bg-gold rounded-full h-2 transition-all duration-500" style={{ width: `${spotsPercentage}%` }} />
                  </div>
                  {workshop.spotsLeft <= 5 && (
                    <p className="text-[11px] text-error mt-2 font-medium">Almost full — book your spot soon</p>
                  )}
                </div>

                <Button variant="gold" size="lg" className="w-full">Book Now</Button>
                <p className="text-[11px] text-charcoal-light text-center mt-4 leading-relaxed">
                  Secure your spot with a full payment. Cancellations accepted up to 72 hours before the workshop for a full refund.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Other Workshops ──────────────────────────────── */}
      {workshops.filter((w) => w.slug !== workshop.slug).length > 0 && (
        <section className="py-24 md:py-32 bg-cream-dark">
          <div className="container-gallery">
            <SectionHeading title="Other Workshops" subtitle="Explore more creative experiences at Mona Niko Gallery." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {workshops
                .filter((w) => w.slug !== workshop.slug)
                .slice(0, 2)
                .map((otherWorkshop, i) => (
                  <motion.div
                    key={otherWorkshop.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Link href={`/workshops/${otherWorkshop.slug}`} className="group block bg-white hover:shadow-lg transition-shadow duration-500">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image src={otherWorkshop.images[0]} alt={otherWorkshop.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                      <div className="p-6 md:p-8">
                        <p className="text-[11px] tracking-[0.15em] uppercase text-gold mb-2">
                          {new Date(otherWorkshop.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <h3 className="font-serif text-xl text-black group-hover:text-gold transition-colors mb-2">
                          {otherWorkshop.title}
                        </h3>
                        <div className="flex items-center justify-between mt-4">
                          <p className="font-serif text-lg text-black">{formatPrice(otherWorkshop.price)}</p>
                          <p className="text-[11px] tracking-[0.1em] uppercase text-gold">{otherWorkshop.spotsLeft} spots left</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
