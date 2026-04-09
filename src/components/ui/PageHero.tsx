"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PageHeroProps {
  /** Single-image mode (legacy / simple pages) */
  image?: string;
  /** Multi-panel triptych mode — pass 2 or 3 painting paths */
  images?: [string, string, string] | [string, string];
  alt: string;
  title?: string;
  subtitle?: string;
}

// ─── Triptych layout ────────────────────────────────────────────────────────
function TriptychHero({
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
    <section className="pt-28 lg:pt-36 overflow-hidden bg-cream">
      <div className="container-gallery">

        {/* ── Title ─────────────────────────────────────────── */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 md:mb-14"
          >
            <span className="block text-[9px] tracking-[0.45em] uppercase text-gold font-sans mb-4">
              Mona Niko
            </span>
            <h1 className="font-display font-light italic text-black leading-[0.9] tracking-[-0.02em]"
              style={{ fontSize: "clamp(3.2rem, 7vw, 7rem)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-[10px] tracking-[0.38em] uppercase text-charcoal-light/50 font-sans">
                {subtitle}
              </p>
            )}
            {/* Hairline gold rule */}
            <div className="mt-7 flex items-center gap-5">
              <div className="h-px w-14 bg-gold/70" />
              <div className="h-px flex-1 bg-warm-gray/60" />
            </div>
          </motion.div>
        )}

        {/* ── Triptych frames ───────────────────────────────── */}
        <div className="relative flex items-end gap-3 md:gap-5 lg:gap-6">

          {/* Left — medium, floats higher */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="w-[26%] md:w-[24%] flex-shrink-0 self-end pb-10 md:pb-16"
          >
            <div className="relative overflow-hidden border border-warm-gray-dark/25 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.18)] group">
              <div className="relative" style={{ paddingTop: "133%" }}>
                <Image
                  src={left}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 26vw, 22vw"
                />
              </div>
              {/* Subtle vignette */}
              <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.06)] pointer-events-none" />
            </div>
          </motion.div>

          {/* Center — tallest, the focal point */}
          <motion.div
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.0 }}
            className="flex-1 min-w-0"
          >
            <div className="relative overflow-hidden border border-warm-gray-dark/25 shadow-[0_20px_64px_-20px_rgba(0,0,0,0.22)] group">
              <div className="relative" style={{ paddingTop: "120%" }}>
                <Image
                  src={center}
                  alt={alt}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 44vw, 50vw"
                />
              </div>
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.07)] pointer-events-none" />
            </div>
          </motion.div>

          {/* Right — smallest, offset down */}
          {right && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
              className="w-[26%] md:w-[24%] flex-shrink-0 self-end pt-12 md:pt-20"
            >
              <div className="relative overflow-hidden border border-warm-gray-dark/25 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.18)] group">
                <div className="relative" style={{ paddingTop: "133%" }}>
                  <Image
                    src={right}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 26vw, 22vw"
                  />
                </div>
                <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.06)] pointer-events-none" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom spacing strip with a thin rule */}
        <div className="mt-8 md:mt-10 h-px bg-warm-gray/40" />
      </div>
    </section>
  );
}

// ─── Default single-image layout (all other pages unchanged) ───────────────
export default function PageHero({ image, images, alt, title, subtitle }: PageHeroProps) {
  if (images && images.length >= 2) {
    return (
      <TriptychHero
        images={images}
        alt={alt}
        title={title}
        subtitle={subtitle}
      />
    );
  }

  const src = image ?? "";
  return (
    <section className="pt-28 lg:pt-32">
      <div className="container-gallery">
        {/* Contained image box — gallery-framed */}
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

        {/* Title below image */}
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
