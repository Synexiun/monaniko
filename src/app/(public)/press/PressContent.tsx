"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { pressItems } from "@/data/artworks";

export default function PressPage() {
  return (
    <>
      <PageHero
        image="/images/hero/gallery/2.jpg"
        alt="Press"
        title="Press & Media"
        subtitle="Mona Niko in the news"
      />

      {/* ─── Press Mentions ───────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="Featured In"
            subtitle="Publications and media outlets that have covered Mona Niko's work."
          />

          <div className="max-w-4xl mx-auto space-y-6">
            {pressItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 md:p-10 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] tracking-[0.15em] uppercase text-gold font-medium">
                        {item.publication}
                      </span>
                      {item.featured && (
                        <span className="inline-block bg-gold/10 text-gold text-[9px] tracking-[0.1em] uppercase px-2 py-0.5">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl text-black mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-charcoal-light leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                  <div className="flex-shrink-0 md:text-right">
                    <p className="text-sm text-charcoal-light">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] tracking-[0.15em] uppercase text-gold hover:text-gold-dark transition-colors mt-3 font-medium"
                      >
                        Read Article
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Press Kit CTA ────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-cream-dark">
        <div className="container-gallery">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
                For Media &amp; Press
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-black font-medium mb-4">
                Download Press Kit
              </h2>
              <div className="divider-gold mx-auto mb-8" />
              <p className="text-charcoal-light leading-relaxed mb-10">
                Our press kit includes high-resolution images, artist biography,
                exhibition history, and contact information. For press inquiries,
                interviews, or collaboration requests, please reach out
                directly.
              </p>

              <div className="bg-white p-8 md:p-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Artist Biography",
                      format: "PDF, 2 pages",
                    },
                    {
                      title: "High-Res Images",
                      format: "ZIP, 45 MB",
                    },
                    {
                      title: "Exhibition History",
                      format: "PDF, 3 pages",
                    },
                    {
                      title: "Logo & Brand Assets",
                      format: "ZIP, 8 MB",
                    },
                  ].map((asset) => (
                    <div
                      key={asset.title}
                      className="flex items-center gap-3 bg-cream-dark p-4"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-gold flex-shrink-0"
                      >
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="12" y2="18" />
                        <line x1="15" y1="15" x2="12" y2="18" />
                      </svg>
                      <div>
                        <p className="text-sm text-black">{asset.title}</p>
                        <p className="text-[11px] text-charcoal-light">
                          {asset.format}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="gold" size="lg" className="w-full sm:w-auto">
                  Download Full Press Kit
                </Button>
              </div>

              <div className="mt-10">
                <p className="text-sm text-charcoal-light mb-2">
                  Press inquiries:
                </p>
                <a
                  href="mailto:press@monaniko.com"
                  className="text-gold hover:text-gold-dark transition-colors font-medium"
                >
                  press@monaniko.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Media Contact ────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-2xl text-black mb-4">
              Looking for Something Specific?
            </h2>
            <p className="text-charcoal-light max-w-lg mx-auto mb-8">
              For interview requests, feature stories, or custom content
              collaborations, we are happy to help.
            </p>
            <Link href="/contact">
              <Button variant="outline">Get in Touch</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
