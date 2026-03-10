"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { workshops } from "@/data/artworks";

const kidsPrograms = [
  {
    id: "kids-club",
    title: "Kids Club",
    price: "$35/session or $160/monthly",
    description:
      "Weekly art sessions where children explore painting, drawing, and mixed media in a fun, nurturing environment. Each session introduces new techniques and themes designed to spark creativity and build confidence.",
    ageRange: "Ages 5-12",
    includes: [
      "1.5-hour guided art session",
      "All materials provided",
      "Take-home artwork each week",
      "Monthly themes and projects",
      "Small class sizes (max 12 kids)",
    ],
    num: "01",
  },
  {
    id: "foujan-classes",
    title: "Art & Paint Classes by Foujan",
    price: "$150/monthly",
    description:
      "Monthly painting classes taught by talented artist Foujan, designed to nurture artistic talent and develop creative expression in young artists. Four weekly sessions per month with personalized guidance.",
    ageRange: "Ages 6-14",
    includes: [
      "4 weekly 2-hour sessions",
      "Color theory and composition",
      "Canvas and acrylic painting",
      "Personalized instruction",
      "All materials included",
    ],
    num: "02",
  },
  {
    id: "kids-mom",
    title: "Kids & Mom Art Workshop",
    price: "$39/session or $124 for 4 sessions",
    description:
      "A special bonding experience for mothers (or caregivers) and children to create art together. Work on collaborative and individual projects with guidance from our team.",
    ageRange: "Ages 4 and up",
    includes: [
      "2-hour creative session",
      "Collaborative art projects",
      "Individual artworks to take home",
      "All materials included",
      "Light refreshments",
    ],
    num: "03",
  },
  {
    id: "birthday",
    title: "Celebrate Your Child's Birthday",
    price: "Custom pricing",
    description:
      "Host an unforgettable art party at Mona Niko Gallery. Kids enjoy guided art activities, painting projects, and creative games. Customizable packages for any group size.",
    ageRange: "Ages 4-14",
    includes: [
      "2-3 hours of creative fun",
      "Guided art activities",
      "Finished artwork for each child",
      "Setup and cleanup included",
      "Customizable themes and activities",
    ],
    num: "04",
  },
];

const kidsWorkshops = workshops.filter(
  (w) =>
    w.slug === "kids-club" ||
    w.slug === "kids-and-mom-art-workshop" ||
    w.slug === "celebrate-your-childs-birthday"
);

export default function KidsClubPage() {
  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/artworks/artwork-7.jpg"
            alt="Kids creating art at Mona Niko Gallery"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative z-10 container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="w-12 h-[1px] bg-gold" />
            <p className="text-[11px] md:text-[12px] tracking-[0.35em] uppercase text-gold font-sans font-medium">
              Creative Programs for Children
            </p>
            <div className="w-12 h-[1px] bg-gold" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl text-white font-light leading-[0.95] tracking-[0.01em]"
          >
            Kids Club &
            <br />
            <span className="italic font-light">Creative Programs</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 text-[15px] md:text-[17px] text-white/60 max-w-lg mx-auto leading-relaxed font-light font-sans"
          >
            Nurturing the next generation of artists through play, exploration,
            and creative expression at Mona Niko Gallery.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10"
          >
            <Link href="/contact">
              <Button variant="gold" size="lg">
                Book a Session
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Intro Section ──────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container-gallery">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="w-8 h-[1px] bg-gold" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
                <div className="w-8 h-[1px] bg-gold" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-light text-black leading-[1.15]">
                Where Little Artists Shine
              </h2>
              <p className="mt-6 text-[15px] text-charcoal-light leading-[1.8] font-light font-sans">
                At Mona Niko Gallery, we believe every child is an artist. Our
                creative programs are designed to inspire confidence, develop
                fine motor skills, and unlock the joy of self-expression through
                art. Whether your child is picking up a brush for the first time
                or already loves to create, we have a program that will nurture
                their passion and help them grow.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Programs Section ────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-cream-dark">
        <div className="container-gallery">
          <SectionHeading
            title="Our Programs"
            subtitle="From weekly sessions to birthday celebrations, find the perfect creative experience for your child."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {kidsPrograms.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 md:p-10 relative overflow-hidden group"
              >
                {/* Background number */}
                <span className="absolute top-4 right-6 font-display text-[5rem] text-charcoal/[0.03] font-light leading-none select-none">
                  {program.num}
                </span>

                <div className="relative">
                  <div className="w-8 h-[1px] bg-gold mb-6 group-hover:w-12 transition-all duration-500" />

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <h3 className="font-serif text-xl md:text-[1.35rem] text-black leading-snug">
                      {program.title}
                    </h3>
                    <span className="font-display text-lg text-gold font-light whitespace-nowrap">
                      {program.price}
                    </span>
                  </div>

                  <p className="text-[14px] text-charcoal-light leading-relaxed mb-4 font-light">
                    {program.description}
                  </p>

                  <div className="inline-flex items-center gap-2 bg-cream px-3 py-1.5 mb-6">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-[11px] tracking-[0.12em] uppercase text-charcoal font-sans font-medium">
                      {program.ageRange}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] tracking-[0.15em] uppercase text-black font-sans font-semibold mb-3">
                      What&apos;s Included
                    </p>
                    <ul className="space-y-2">
                      {program.includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-[13px] text-charcoal-light font-light"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gold flex-shrink-0 mt-0.5"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Upcoming Sessions ───────────────────────────────── */}
      {kidsWorkshops.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-gallery">
            <SectionHeading
              title="Upcoming Sessions"
              subtitle="Check out our next available kids programs and reserve your spot."
            />

            <div className="space-y-4 max-w-3xl mx-auto">
              {kidsWorkshops.map((workshop, i) => (
                <motion.div
                  key={workshop.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    href={`/workshops/${workshop.slug}`}
                    className="group block bg-white border border-warm-gray/30 p-6 md:p-8 hover:shadow-lg transition-all duration-500"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-[1px] bg-gold" />
                          <p className="text-[10px] tracking-[0.2em] uppercase text-gold font-sans font-medium">
                            {new Date(workshop.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <h3 className="font-serif text-lg md:text-xl text-black group-hover:text-gold transition-colors duration-300">
                          {workshop.title}
                        </h3>
                        <p className="text-[13px] text-charcoal-light mt-2 leading-relaxed font-light">
                          {workshop.description}
                        </p>
                        <p className="text-[11px] tracking-[0.1em] uppercase text-charcoal-light mt-2 font-sans">
                          {workshop.time} &middot; {workshop.duration}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 pt-6">
                        <p className="font-display text-2xl text-black font-light">
                          ${workshop.price}
                        </p>
                        <p className="text-[10px] tracking-[0.1em] uppercase text-gold mt-1 font-sans">
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
      )}

      {/* ─── Testimonial ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-cream-dark">
        <div className="container-gallery">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="font-display text-7xl text-gold/20 leading-none select-none">
                &ldquo;
              </span>
              <p className="text-[16px] md:text-[18px] text-charcoal leading-[1.8] font-light italic -mt-6 mb-8">
                My daughter has been attending Kids Club for three months now and
                the transformation in her confidence is incredible. She used to
                be shy about creating, but now she comes home buzzing with
                excitement to show us what she made. The instructors truly care
                about nurturing each child&apos;s unique creative voice.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-[1px] bg-gold" />
                <div>
                  <p className="text-[13px] font-medium text-black font-sans">
                    Sarah M.
                  </p>
                  <p className="text-[11px] text-charcoal-light mt-0.5 font-sans">
                    Parent, Kids Club Member
                  </p>
                </div>
                <div className="w-8 h-[1px] bg-gold" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Gallery Preview ─────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container-gallery">
          <SectionHeading
            title="Young Artists at Work"
            subtitle="A glimpse into the creative magic that happens at our kids programs."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              "/images/artworks/artwork-7.jpg",
              "/images/artworks/artwork-6.jpg",
              "/images/artworks/artwork-3.jpg",
              "/images/artworks/artwork-4.jpg",
            ].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative aspect-square overflow-hidden group"
              >
                <Image
                  src={src}
                  alt={`Kids artwork ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/artworks/artwork-7.jpg"
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
              Ready to Spark
              <br />
              <span className="italic">Their Creativity?</span>
            </h2>
            <p className="text-[15px] text-white/50 max-w-md mx-auto mb-12 font-light leading-relaxed">
              Contact us to learn more about our kids programs, schedule a trial
              session, or book a birthday party at the gallery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="gold" size="lg">
                  Contact Us to Book
                </Button>
              </Link>
              <Link href="/workshops">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white hover:text-black hover:border-white"
                >
                  View All Workshops
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
