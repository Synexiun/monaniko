"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { testimonials } from "@/data/artworks";

const processSteps = [
  {
    number: "01",
    title: "Consultation",
    description:
      "We begin with an in-depth conversation about your vision, space, and aesthetic preferences. Whether in person at the gallery or via video call, this is where your artwork begins to take shape.",
  },
  {
    number: "02",
    title: "Concept",
    description:
      "Based on our consultation, Mona creates initial concept sketches and a color palette proposal. You will review and provide feedback to refine the direction before any painting begins.",
  },
  {
    number: "03",
    title: "Creation",
    description:
      "Mona brings your vision to life in her studio. You will receive progress updates with photos at key milestones, with opportunities to provide input throughout the process.",
  },
  {
    number: "04",
    title: "Delivery",
    description:
      "Your completed artwork is professionally framed, packaged with museum-grade materials, and delivered to your door with a certificate of authenticity. Installation guidance is included.",
  },
];

const faqItems = [
  {
    question: "How long does a commission take?",
    answer:
      "Most commissions are completed within 6 to 12 weeks depending on size and complexity. Large-scale works or multi-piece series may take longer. We will establish a clear timeline during the consultation phase.",
  },
  {
    question: "What sizes are available for commissions?",
    answer:
      "Commissions can range from intimate 12\" x 12\" pieces to large-scale works spanning 8 feet or more. Mona works with you to determine the ideal size for your space.",
  },
  {
    question: "How is pricing determined?",
    answer:
      "Commission pricing is based on size, complexity, materials, and timeline. After our initial consultation, you will receive a detailed proposal with a fixed price. A 50% deposit is required to begin.",
  },
  {
    question: "Can I request changes during the process?",
    answer:
      "Absolutely. The process includes built-in review points where you can provide feedback. Minor adjustments are included in the commission price. Significant changes in direction may be subject to additional costs.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes. We work with specialized fine art shippers to ensure your commission arrives safely anywhere in the world. Shipping costs are quoted separately based on size and destination.",
  },
];

const commissionTestimonial = testimonials.find((t) => t.id === "t2");

export default function CommissionsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredSize: "",
    budgetRange: "",
    vision: "",
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      // Post as a COMMISSION inquiry
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COMMISSION",
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: `${formData.vision}\n\nPreferred size: ${formData.preferredSize || "Not specified"}\nBudget: ${formData.budgetRange}`,
          budget: formData.budgetRange,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send inquiry");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/artworks/artwork-2.jpg"
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
            Bespoke Artworks
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
          >
            Custom Commissions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Collaborate with Mona Niko to create a one-of-a-kind artwork
            tailored to your space, vision, and story.
          </motion.p>
        </div>
      </section>

      {/* ─── Process Steps ────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="The Commission Process"
            subtitle="A collaborative journey from concept to masterpiece, guided by open communication at every step."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[1px] bg-warm-gray" />
                )}
                <div className="text-center lg:text-left">
                  <span className="font-serif text-5xl text-gold/20 font-medium">
                    {step.number}
                  </span>
                  <h3 className="font-serif text-xl text-black mt-2 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-charcoal-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Commission Inquiry Form ──────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeading
                title="Start Your Commission"
                subtitle="Tell us about your vision. We will respond within 48 hours to schedule your consultation."
                align="left"
              />

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 md:p-10 text-center"
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
                    Inquiry Received
                  </h3>
                  <p className="text-charcoal-light leading-relaxed">
                    Thank you for your interest in a custom commission. Mona
                    will review your inquiry and reach out within 48 hours to
                    schedule your consultation.
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                        Preferred Size
                      </label>
                      <input
                        type="text"
                        value={formData.preferredSize}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferredSize: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                        placeholder='e.g., 36" x 48"'
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                      Budget Range *
                    </label>
                    <select
                      required
                      value={formData.budgetRange}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetRange: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors appearance-none"
                    >
                      <option value="">Select your budget range</option>
                      <option value="3000-5000">$3,000 &ndash; $5,000</option>
                      <option value="5000-10000">$5,000 &ndash; $10,000</option>
                      <option value="10000-20000">
                        $10,000 &ndash; $20,000
                      </option>
                      <option value="20000-50000">
                        $20,000 &ndash; $50,000
                      </option>
                      <option value="50000+">$50,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.15em] uppercase text-charcoal-light mb-2">
                      Your Vision *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.vision}
                      onChange={(e) =>
                        setFormData({ ...formData, vision: e.target.value })
                      }
                      className="w-full bg-white border border-warm-gray px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Describe what you envision — colors, mood, subject matter, the space it will live in, and any other details that will help us understand your vision."
                    />
                  </div>

                  <p className="text-[12px] text-charcoal-light">
                    Feel free to include reference images in your follow-up
                    email to{" "}
                    <span className="text-gold">studio@monaniko.com</span> after
                    submitting this form.
                  </p>

                  {submitError && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}

                  <Button type="submit" variant="gold" size="lg" disabled={submitting}>
                    {submitting ? "Sending…" : "Submit Inquiry"}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Right Side — Image + Testimonial */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/artworks/artwork-8.jpg"
                  alt="Commission artwork example"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Testimonial */}
              {commissionTestimonial && (
                <div className="bg-white p-8 md:p-10">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg
                        key={j}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-gold"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-charcoal leading-relaxed italic mb-6">
                    &ldquo;{commissionTestimonial.text}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-medium text-black">
                      {commissionTestimonial.name}
                    </p>
                    {commissionTestimonial.role && (
                      <p className="text-[12px] text-charcoal-light mt-0.5">
                        {commissionTestimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery max-w-3xl">
          <SectionHeading
            title="Commission FAQ"
            subtitle="Common questions about the commission process."
          />
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-warm-gray"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-cream-dark/50 transition-colors"
                >
                  <span className="font-serif text-base text-black pr-8">
                    {item.question}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`text-gold flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-sm text-charcoal-light leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
