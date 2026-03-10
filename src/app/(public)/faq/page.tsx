"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

interface FaqCategory {
  title: string;
  items: { question: string; answer: string }[];
}

const faqCategories: FaqCategory[] = [
  {
    title: "Buying Art",
    items: [
      {
        question: "How do I purchase an original artwork?",
        answer:
          "Original artworks can be purchased directly through our website by clicking 'Inquire' or 'Add to Cart' on the artwork page. For pieces listed as 'Price on Inquiry,' please contact us for pricing details. We also welcome visitors to our gallery in Mission Viejo for in-person viewings and purchases.",
      },
      {
        question: "Do you offer payment plans?",
        answer:
          "Yes, we offer flexible payment plans for original artworks priced over $3,000. Payments can be split into 2-4 installments over 30-90 days. The artwork will be shipped upon receipt of the final payment. Contact us to discuss payment options for your purchase.",
      },
      {
        question: "How do I know the artwork will look right in my space?",
        answer:
          "We offer complimentary virtual consultations where we can help you visualize the artwork in your space. Share photos of your room and we will provide mockups showing the piece at scale. For local clients, we also offer in-home previews for original artworks.",
      },
      {
        question: "Do all artworks come with a certificate of authenticity?",
        answer:
          "Yes. Every original artwork and limited edition print comes with a signed certificate of authenticity. For originals, this includes details about the medium, dimensions, and provenance. Limited edition prints include the edition number.",
      },
    ],
  },
  {
    title: "Shipping & Handling",
    items: [
      {
        question: "How are artworks shipped?",
        answer:
          "All artworks are professionally packaged using museum-grade materials. Original paintings are crated in custom-built wooden crates with foam-lined interiors. Prints are shipped flat in rigid mailers. We use insured, tracked shipping through specialized fine art carriers.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship worldwide. International shipping costs vary based on size, weight, and destination. Customs duties and import taxes are the responsibility of the buyer. Contact us for a shipping quote before purchasing.",
      },
      {
        question: "How long does shipping take?",
        answer:
          "Domestic shipping typically takes 5-10 business days. International shipping can take 10-21 business days depending on destination and customs processing. Rush shipping is available for an additional fee.",
      },
      {
        question: "Is shipping insured?",
        answer:
          "Yes. All shipments are fully insured for the purchase value of the artwork. In the unlikely event of damage during transit, we will work with you to arrange a replacement or full refund.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 14-day return policy for original artworks and prints. The artwork must be returned in its original packaging and condition. Return shipping costs are the responsibility of the buyer. Custom commissions and personalized items are non-returnable.",
      },
      {
        question: "What if my artwork arrives damaged?",
        answer:
          "If your artwork arrives damaged, please contact us within 48 hours with photographs of the damage and packaging. We will arrange for a replacement or full refund, including return shipping costs. All shipments are insured for your protection.",
      },
    ],
  },
  {
    title: "Commissions",
    items: [
      {
        question: "How do I commission a custom artwork?",
        answer:
          "Visit our Commissions page to submit an inquiry form. Describe your vision, preferred size, and budget range. We will schedule a consultation to discuss your project in detail. The process typically takes 6-12 weeks from concept to delivery.",
      },
      {
        question: "What is the deposit structure for commissions?",
        answer:
          "A 50% deposit is required to begin a commission. The remaining 50% is due upon completion, before shipping. Deposits are non-refundable once work has begun, as materials are purchased and studio time is reserved specifically for your project.",
      },
      {
        question: "Can I request specific colors or themes?",
        answer:
          "Absolutely. The commission process begins with a detailed consultation where we discuss your preferences for colors, mood, subject matter, and the space the artwork will inhabit. Mona works collaboratively with you while maintaining her distinctive artistic voice.",
      },
    ],
  },
  {
    title: "Prints & Editions",
    items: [
      {
        question: "What is the difference between limited and open editions?",
        answer:
          "Limited edition prints are produced in a fixed quantity (e.g., 25 or 50), each hand-signed and numbered by the artist. Once sold out, they are never reprinted. Open edition prints are available in unlimited quantities and are signed but not numbered. Limited editions tend to appreciate in value over time.",
      },
      {
        question: "What printing method do you use?",
        answer:
          "All prints are museum-quality giclée prints produced on archival, acid-free paper using pigment-based inks rated for 100+ years of fade resistance. Select prints include additional hand-applied details such as gold foil.",
      },
      {
        question: "Do prints come framed?",
        answer:
          "Prints are shipped unframed to give you flexibility in choosing a frame that complements your space. We offer framing recommendations and can arrange professional framing through our partner framers upon request.",
      },
    ],
  },
  {
    title: "Workshops",
    items: [
      {
        question: "Do I need prior art experience to attend a workshop?",
        answer:
          "Most of our workshops welcome artists of all levels. Each workshop listing specifies the recommended skill level — Beginner, Intermediate, Advanced, or All Levels. Check the individual workshop page for details.",
      },
      {
        question: "Are materials included in the workshop price?",
        answer:
          "Yes, all in-person workshops include materials. The specific materials list is provided on each workshop page. For online workshops, a materials list is sent in advance so you can prepare your own supplies.",
      },
      {
        question: "What is the cancellation policy for workshops?",
        answer:
          "Full refunds are available for cancellations made at least 72 hours before the workshop date. Cancellations within 72 hours may receive a credit toward a future workshop. No-shows forfeit the workshop fee. If we cancel a workshop, you will receive a full refund.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-6.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6"
          >
            Help Center
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Everything you need to know about buying art, commissions,
            workshops, and more.
          </motion.p>
        </div>
      </section>

      {/* ─── FAQ Sections ─────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery max-w-3xl">
          {faqCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIndex * 0.05 }}
              className="mb-16 last:mb-0"
            >
              <h2 className="font-serif text-2xl text-black mb-2">
                {category.title}
              </h2>
              <div className="divider-gold mb-8" />

              <div className="space-y-3">
                {category.items.map((item, itemIndex) => {
                  const key = `${catIndex}-${itemIndex}`;
                  const isOpen = openItems[key] || false;

                  return (
                    <div
                      key={key}
                      className="border border-warm-gray bg-white overflow-hidden transition-shadow duration-300 hover:shadow-sm"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
                      >
                        <span className="font-serif text-[15px] text-black pr-8 leading-snug">
                          {item.question}
                        </span>
                        <span
                          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-300 ${
                            isOpen
                              ? "border-gold bg-gold text-white rotate-0"
                              : "border-warm-gray text-charcoal-light rotate-0"
                          }`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className={`transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-400 ease-in-out ${
                          isOpen ? "max-h-[500px]" : "max-h-0"
                        }`}
                      >
                        <div className="px-6 pb-6">
                          <div className="pt-2 border-t border-warm-gray">
                            <p className="text-sm text-charcoal-light leading-relaxed pt-4">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Still Have Questions CTA ─────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-black font-medium mb-4">
              Still Have Questions?
            </h2>
            <div className="divider-gold mx-auto mb-8" />
            <p className="text-charcoal-light max-w-lg mx-auto leading-relaxed mb-10">
              We are here to help. Reach out and we will get back to you within
              24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="gold" size="lg">
                  Contact Us
                </Button>
              </Link>
              <a href="mailto:hello@monaniko.com">
                <Button variant="outline" size="lg">
                  Email Directly
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
