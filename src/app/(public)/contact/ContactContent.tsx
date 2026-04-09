"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

const galleryInfo = {
  address: "25550 Commercentre Drive, Suite 250",
  city: "Mission Viejo, CA 92691",
  phone: "(949) 555-0142",
  email: "hello@monaniko.com",
  hours: [
    { days: "Tuesday – Friday", time: "10:00 AM – 6:00 PM" },
    { days: "Saturday", time: "11:00 AM – 5:00 PM" },
    { days: "Sunday – Monday", time: "By Appointment Only" },
  ],
};

const subjectOptions = [
  "General Inquiry",
  "Artwork Inquiry",
  "Commission Request",
  "Workshop Question",
  "Private Viewing Request",
  "Press / Media",
  "Collaboration",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [pvFormData, setPvFormData] = useState({
    name: "",
    email: "",
    preferredDate: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [pvSubmitted, setPvSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handlePvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPvSubmitted(true);
  };

  return (
    <>
      {/* ── Contact Hero — "The Invitation" ──────────────── */}
      <section className="pt-28 lg:pt-32">
        <div className="container-gallery">
          <div className="relative h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] overflow-hidden bg-[#111111]">

            {/* Grain texture overlay */}
            <div
              className="absolute inset-0 z-10 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                backgroundSize: "128px 128px",
              }}
            />

            {/* Left — warm painting, fades into black at right edge */}
            <motion.div
              className="absolute inset-y-0 left-0 w-[46%] md:w-[44%]"
              initial={{ x: "-6%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/images/artworks/fancy-girl.jpg"
                alt="Mona Niko Gallery"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 46vw, 42vw"
              />
              {/* Fade right edge into the dark background */}
              <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-transparent to-[#111111] pointer-events-none" />
              {/* Subtle top + bottom vignette */}
              <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#111111]/60 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#111111]/60 to-transparent pointer-events-none" />
            </motion.div>

            {/* Right — invitation text */}
            <motion.div
              className="absolute inset-y-0 right-0 w-[60%] md:w-[62%] flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-16 z-20"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.35 }}
            >
              <span className="block text-[7px] sm:text-[8px] tracking-[0.5em] uppercase text-[#C4A265]/70 font-sans mb-3 md:mb-4">
                Mona Niko Gallery
              </span>

              <h1
                className="font-display font-light italic text-white leading-[0.88] tracking-[-0.02em]"
                style={{ fontSize: "clamp(2rem, 5.5vw, 5rem)" }}
              >
                Contact &amp; Visit
              </h1>

              {/* Gold + white divider */}
              <div className="mt-4 md:mt-5 flex items-center gap-3">
                <div className="h-px w-8 bg-[#C4A265]/70 flex-shrink-0" />
                <div className="h-px w-16 bg-white/10 flex-shrink-0" />
              </div>

              {/* Gallery details */}
              <div className="mt-4 md:mt-5 space-y-1.5">
                <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-white/35 font-sans">
                  Mission Viejo · California
                </p>
                <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-white/35 font-sans">
                  Tue – Fri &nbsp;10:00 – 18:00 &nbsp;·&nbsp; Sat 11:00 – 17:00
                </p>
              </div>

              {/* Open indicator */}
              <div className="mt-4 md:mt-5 flex items-center gap-2">
                <span className="block w-1.5 h-1.5 rounded-full bg-[#C4A265] animate-pulse flex-shrink-0" />
                <span className="text-[8px] tracking-[0.35em] uppercase text-[#C4A265]/75 font-sans">
                  Open for Visits &amp; Inquiries
                </span>
              </div>
            </motion.div>

            {/* Four corner brackets — invitation card motif */}
            {(["top-3 left-3 border-t border-l",
               "top-3 right-3 border-t border-r",
               "bottom-3 left-3 border-b border-l",
               "bottom-3 right-3 border-b border-r"] as const).map((cls) => (
              <div
                key={cls}
                className={`absolute w-5 h-5 sm:w-6 sm:h-6 border-[#C4A265]/30 pointer-events-none z-30 ${cls}`}
              />
            ))}

            {/* Top gold hairline */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C4A265]/40 to-transparent z-30 pointer-events-none" />
          </div>
          <div className="h-px bg-warm-gray/50" />
        </div>
      </section>

      {/* ─── Contact Form + Info ───────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeading
                title="Send a Message"
                subtitle="Fill out the form below and we will get back to you within 24 hours."
                align="left"
              />

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cream-dark p-8 md:p-10 text-center"
                >
                  <div className="text-gold mb-4">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="mx-auto"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-black mb-3">
                    Message Sent
                  </h3>
                  <p className="text-charcoal-light leading-relaxed">
                    Thank you for reaching out. We will respond within 24
                    hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                      Subject *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors appearance-none"
                    >
                      <option value="">Select a subject</option>
                      {subjectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button type="submit" variant="gold" size="lg">
                    Send Message
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Gallery Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-10"
            >
              {/* Address */}
              <div>
                <h3 className="font-serif text-xl text-black mb-4">
                  Gallery Address
                </h3>
                <div className="divider-gold mb-6" />
                <div className="flex items-start gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gold mt-1 flex-shrink-0"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-sm text-charcoal">{galleryInfo.address}</p>
                    <p className="text-sm text-charcoal">{galleryInfo.city}</p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div>
                <h3 className="font-serif text-xl text-black mb-4">
                  Gallery Hours
                </h3>
                <div className="divider-gold mb-6" />
                <div className="space-y-3">
                  {galleryInfo.hours.map((slot) => (
                    <div
                      key={slot.days}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-charcoal">{slot.days}</span>
                      <span className="text-sm text-charcoal-light">
                        {slot.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone & Email */}
              <div>
                <h3 className="font-serif text-xl text-black mb-4">
                  Direct Contact
                </h3>
                <div className="divider-gold mb-6" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold flex-shrink-0"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <a
                      href={`tel:${galleryInfo.phone}`}
                      className="text-sm text-charcoal hover:text-gold transition-colors"
                    >
                      {galleryInfo.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold flex-shrink-0"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <a
                      href={`mailto:${galleryInfo.email}`}
                      className="text-sm text-charcoal hover:text-gold transition-colors"
                    >
                      {galleryInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-serif text-xl text-black mb-4">
                  Follow Along
                </h3>
                <div className="divider-gold mb-6" />
                <div className="flex items-center gap-5">
                  {[
                    {
                      name: "Instagram",
                      href: "https://instagram.com/monaniko",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      ),
                    },
                    {
                      name: "Pinterest",
                      href: "https://pinterest.com/monaniko",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.25 2.67 7.9 6.44 9.34-.09-.78-.17-1.99.04-2.85.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.8-2.42 1.8-2.42.85 0 1.26.64 1.26 1.4 0 .85-.54 2.12-.82 3.3-.24.99.5 1.8 1.47 1.8 1.76 0 3.12-1.86 3.12-4.54 0-2.37-1.7-4.03-4.14-4.03-2.82 0-4.47 2.11-4.47 4.3 0 .85.33 1.76.74 2.26.08.1.09.19.07.29-.08.31-.25.99-.28 1.13-.04.18-.15.22-.34.13-1.26-.58-2.05-2.43-2.05-3.91 0-3.18 2.31-6.1 6.67-6.1 3.5 0 6.22 2.49 6.22 5.83 0 3.48-2.19 6.28-5.23 6.28-1.02 0-1.98-.53-2.31-1.16l-.63 2.4c-.23.88-.85 1.98-1.27 2.66A10 10 0 0022 12c0-5.52-4.48-10-10-10z" />
                        </svg>
                      ),
                    },
                    {
                      name: "Facebook",
                      href: "https://facebook.com/monaniko",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        </svg>
                      ),
                    },
                    {
                      name: "YouTube",
                      href: "https://youtube.com/@monaniko",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z" />
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                        </svg>
                      ),
                    },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="text-charcoal-light hover:text-gold transition-colors"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div>
                <h3 className="font-serif text-xl text-black mb-4">
                  Find Us
                </h3>
                <div className="divider-gold mb-6" />
                <div className="relative aspect-[16/9] bg-warm-gray overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-charcoal-light mx-auto mb-3"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <p className="text-sm text-charcoal-light">
                        Interactive map coming soon
                      </p>
                      <p className="text-[11px] text-charcoal-light mt-1">
                        Mission Viejo, CA 92691
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Request Private Viewing ──────────────────────── */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
                Exclusive Experience
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-white font-medium mb-6">
                Request a Private Viewing
              </h2>
              <div className="divider-gold mb-8" />
              <p className="text-white/60 leading-relaxed mb-6">
                Experience the gallery on your own terms. Private viewings offer
                an intimate setting to explore the collection, meet the artist,
                and discover the perfect piece for your space — with no
                distractions and no rush.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "One-on-one time with the artist",
                  "Personalized tour of current collection",
                  "Complimentary refreshments",
                  "No-pressure, consultative experience",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
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
                    <span className="text-sm text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {pvSubmitted ? (
                <div className="bg-white/5 border border-white/10 p-8 md:p-10 text-center">
                  <div className="text-gold mb-4">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="mx-auto"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-white mb-3">
                    Request Received
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    We will confirm your private viewing within 24 hours. We
                    look forward to welcoming you.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handlePvSubmit}
                  className="bg-white/5 border border-white/10 p-8 md:p-10 space-y-6"
                >
                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-white/50 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={pvFormData.name}
                      onChange={(e) =>
                        setPvFormData({ ...pvFormData, name: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-white/50 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={pvFormData.email}
                      onChange={(e) =>
                        setPvFormData({ ...pvFormData, email: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-white/50 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={pvFormData.preferredDate}
                      onChange={(e) =>
                        setPvFormData({
                          ...pvFormData,
                          preferredDate: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-white/50 mb-2">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      value={pvFormData.notes}
                      onChange={(e) =>
                        setPvFormData({ ...pvFormData, notes: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Any specific interests or requirements"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                  >
                    Request Private Viewing
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
