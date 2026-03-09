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

export default function WorkshopDetailPage() {
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
      <section className="relative py-32 md:py-40 bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src={workshop.images[0]}
            alt={workshop.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
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
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-medium tracking-[-0.02em] max-w-3xl mx-auto"
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
              {/* Workshop Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative aspect-[16/9] overflow-hidden"
              >
                <Image
                  src={workshop.images[0]}
                  alt={workshop.title}
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Long Description */}
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

              {/* Materials List */}
              {workshop.materials && workshop.materials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-serif text-2xl text-black font-medium mb-6">
                    Materials Included
                  </h2>
                  <div className="divider-gold mb-8" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workshop.materials.map((material) => (
                      <div
                        key={material}
                        className="flex items-center gap-3 bg-cream-dark px-5 py-3"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gold flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-sm text-charcoal">
                          {material}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Level Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-2xl text-black font-medium mb-6">
                  Skill Level
                </h2>
                <div className="divider-gold mb-8" />
                <div className="bg-cream-dark p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    {["beginner", "intermediate", "advanced"].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full ${
                          level === "beginner" &&
                          (workshop.level === "beginner" ||
                            workshop.level === "intermediate" ||
                            workshop.level === "advanced" ||
                            workshop.level === "all_levels")
                            ? "bg-gold"
                            : level === "intermediate" &&
                              (workshop.level === "intermediate" ||
                                workshop.level === "advanced" ||
                                workshop.level === "all_levels")
                            ? "bg-gold"
                            : level === "advanced" &&
                              (workshop.level === "advanced" ||
                                workshop.level === "all_levels")
                            ? "bg-gold"
                            : "bg-warm-gray"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-black mb-1">
                    {levelLabels[workshop.level]}
                  </p>
                  <p className="text-sm text-charcoal-light">
                    {levelDescriptions[workshop.level]}
                  </p>
                </div>
              </motion.div>

              {/* Instructor Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-serif text-2xl text-black font-medium mb-6">
                  Your Instructor
                </h2>
                <div className="divider-gold mb-8" />
                <div className="flex items-start gap-6 bg-cream-dark p-6 md:p-8">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/hero/artist-portrait.jpg"
                      alt={workshop.instructor}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-black mb-2">
                      {workshop.instructor}
                    </h3>
                    <p className="text-sm text-charcoal-light leading-relaxed">
                      Contemporary artist whose work bridges abstract
                      expressionism and emotional storytelling. With years of
                      teaching experience, Mona creates an inspiring,
                      supportive environment where artists of every level can
                      discover their creative voice.
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
                {/* Price */}
                <div className="text-center mb-8">
                  <p className="font-serif text-3xl text-black">
                    {formatPrice(workshop.price)}
                  </p>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light mt-1">
                    per person
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-8 pb-8 border-b border-warm-gray">
                  <div className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold mt-0.5 flex-shrink-0"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div>
                      <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mb-0.5">
                        Date
                      </p>
                      <p className="text-sm text-black">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold mt-0.5 flex-shrink-0"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div>
                      <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mb-0.5">
                        Time
                      </p>
                      <p className="text-sm text-black">{workshop.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold mt-0.5 flex-shrink-0"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <div>
                      <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mb-0.5">
                        Duration
                      </p>
                      <p className="text-sm text-black">{workshop.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold mt-0.5 flex-shrink-0"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mb-0.5">
                        Location
                      </p>
                      <p className="text-sm text-black">{workshop.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold mt-0.5 flex-shrink-0"
                    >
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    <div>
                      <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mb-0.5">
                        Capacity
                      </p>
                      <p className="text-sm text-black">
                        {workshop.capacity} participants
                      </p>
                    </div>
                  </div>
                </div>

                {/* Spots Remaining */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-charcoal">Spots Remaining</p>
                    <p className="text-sm font-medium text-black">
                      {workshop.spotsLeft} of {workshop.capacity}
                    </p>
                  </div>
                  <div className="w-full bg-warm-gray rounded-full h-2">
                    <div
                      className="bg-gold rounded-full h-2 transition-all duration-500"
                      style={{ width: `${spotsPercentage}%` }}
                    />
                  </div>
                  {workshop.spotsLeft <= 5 && (
                    <p className="text-[11px] text-error mt-2 font-medium">
                      Almost full — book your spot soon
                    </p>
                  )}
                </div>

                {/* Book Now CTA */}
                <Button variant="gold" size="lg" className="w-full">
                  Book Now
                </Button>

                <p className="text-[11px] text-charcoal-light text-center mt-4 leading-relaxed">
                  Secure your spot with a full payment. Cancellations accepted
                  up to 72 hours before the workshop for a full refund.
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
            <SectionHeading
              title="Other Workshops"
              subtitle="Explore more creative experiences at Mona Niko Gallery."
            />
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
                    <Link
                      href={`/workshops/${otherWorkshop.slug}`}
                      className="group block bg-white hover:shadow-lg transition-shadow duration-500"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={otherWorkshop.images[0]}
                          alt={otherWorkshop.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6 md:p-8">
                        <p className="text-[11px] tracking-[0.15em] uppercase text-gold mb-2">
                          {new Date(otherWorkshop.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <h3 className="font-serif text-xl text-black group-hover:text-gold transition-colors mb-2">
                          {otherWorkshop.title}
                        </h3>
                        <div className="flex items-center justify-between mt-4">
                          <p className="font-serif text-lg text-black">
                            {formatPrice(otherWorkshop.price)}
                          </p>
                          <p className="text-[11px] tracking-[0.1em] uppercase text-gold">
                            {otherWorkshop.spotsLeft} spots left
                          </p>
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
