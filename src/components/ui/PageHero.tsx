"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PageHeroProps {
  /** Single-image mode (all existing pages) */
  image?: string;
  /** Creative three-panel editorial mode */
  images?: [string, string, string] | [string, string];
  alt: string;
  title?: string;
  subtitle?: string;
}

// ─── Three-panel editorial header ────────────────────────────────────────────
// Same container height as the workshop page hero.
// Three paintings fill the frame, separated by hairline gold lines.
// An oversized ghost title blends into the paintings via mix-blend-mode.
// A clean readable title + subtitle lives in the bottom info strip.
function EditorialHero({
  images,
  alt,
  title,
  subtitle,
}: {
  images: string[];
  alt: string;
  title?: string;
  subtitle?: string;
}) {
  const [left, center, right] = images;

  return (
    <section className="pt-28 lg:pt-32">
      <div className="container-gallery">

        {/* ── Container — exact same size as workshop PageHero ── */}
        <div className="relative h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] overflow-hidden shadow-[0_4px_30px_-8px_rgba(0,0,0,0.12)]">

          {/* ── Three painting panels ─────────────────────────── */}
          {/* gap-px on a gold/40 background = hairline gold dividers */}
          <div className="absolute inset-0 flex gap-px bg-[#C4A265]/50">

            {/* Left panel — slides in from left */}
            <motion.div
              className="relative flex-1 overflow-hidden"
              initial={{ x: "-8%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={left}
                alt={alt}
                fill
                className="object-cover scale-[1.06] hover:scale-100 transition-transform duration-[1400ms] ease-out"
                sizes="(max-width: 768px) 33vw, 28vw"
              />
              {/* Dim the outer panels so center stays focal */}
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-700" />
            </motion.div>

            {/* Center panel — rises up, full saturation, focal point */}
            <motion.div
              className="relative flex-[1.45] overflow-hidden"
              initial={{ y: "5%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            >
              <Image
                src={center}
                alt={alt}
                fill
                priority
                className="object-cover hover:scale-[1.04] transition-transform duration-[1400ms] ease-out"
                sizes="(max-width: 768px) 34vw, 44vw"
              />
            </motion.div>

            {/* Right panel — slides in from right */}
            {right && (
              <motion.div
                className="relative flex-1 overflow-hidden"
                initial={{ x: "8%", opacity: 0 }}
                animate={{ x: "0%", opacity: 1 }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              >
                <Image
                  src={right}
                  alt={alt}
                  fill
                  className="object-cover scale-[1.06] hover:scale-100 transition-transform duration-[1400ms] ease-out"
                  sizes="(max-width: 768px) 33vw, 28vw"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-700" />
              </motion.div>
            )}
          </div>

          {/* ── Ghost title — bleeds off edges, blends into paintings ── */}
          {title && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
              <motion.span
                className="font-display font-light italic text-white leading-none tracking-[-0.025em] select-none whitespace-nowrap"
                style={{
                  fontSize: "clamp(4.5rem, 19vw, 18rem)",
                  mixBlendMode: "overlay",
                  opacity: 0,
                }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
              >
                {title}
              </motion.span>
            </div>
          )}

          {/* ── Bottom gradient ──────────────────────────────────── */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/65 via-black/20 to-transparent z-10 pointer-events-none" />

          {/* ── Top gold hairline ────────────────────────────────── */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C4A265]/60 to-transparent z-30 pointer-events-none" />

          {/* ── Info strip ───────────────────────────────────────── */}
          <motion.div
            className="absolute bottom-0 inset-x-0 px-5 pb-5 md:px-8 md:pb-7 lg:px-10 lg:pb-8 z-30 flex items-end justify-between gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.55 }}
          >
            {/* Title + subtitle */}
            <div>
              {title && (
                <h1 className="font-display text-[1.6rem] md:text-[2.1rem] lg:text-[2.6rem] font-light italic text-white leading-[1.0] tracking-[-0.01em]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1.5 text-[8px] md:text-[9px] tracking-[0.42em] uppercase text-[#C4A265]/85 font-sans">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Panel ticks — right side */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2 pb-0.5">
              <span className="text-[7px] tracking-[0.3em] uppercase text-white/25 font-sans hidden sm:block">
                Studio Collection
              </span>
              <div className="flex items-center gap-[5px]">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-px transition-all duration-300 ${
                      i === 1
                        ? "w-8 bg-[#C4A265]/80"
                        : "w-4 bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Subtle corner accent (bottom-left) ──────────────── */}
          <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-[#C4A265]/30 z-30 pointer-events-none" />
        </div>

        {/* Bottom rule — matches single-image PageHero visual rhythm */}
        <div className="h-px bg-warm-gray/50 mt-0" />
      </div>
    </section>
  );
}

// ─── Default single-image layout (all other pages — unchanged) ────────────────
export default function PageHero({ image, images, alt, title, subtitle }: PageHeroProps) {
  if (images && images.length >= 2) {
    return (
      <EditorialHero images={images} alt={alt} title={title} subtitle={subtitle} />
    );
  }

  const src = image ?? "";
  return (
    <section className="pt-28 lg:pt-32">
      <div className="container-gallery">
        <div className="relative h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] overflow-hidden shadow-[0_4px_30px_-8px_rgba(0,0,0,0.08)]">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) calc(100vw - 3rem), (max-width: 1280px) calc(100vw - 6rem), 1272px"
          />
        </div>
        {title && (
          <div className="mt-8 md:mt-10">
            <h1 className="font-display text-[2rem] md:text-[2.8rem] lg:text-[3.2rem] text-black font-light italic tracking-wide">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[11px] tracking-[0.3em] uppercase text-charcoal-light/60 font-sans font-light">
                {subtitle}
              </p>
            )}
            <div className="divider-gold mt-5" />
          </div>
        )}
      </div>
    </section>
  );
}
