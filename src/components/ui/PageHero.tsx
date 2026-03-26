"use client";

import Image from "next/image";

interface PageHeroProps {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export default function PageHero({ image, alt, title, subtitle }: PageHeroProps) {
  return (
    <section className="pt-28 lg:pt-32">
      <div className="container-gallery">
        {/* Contained image box — not full-width, gallery-framed */}
        <div className="relative h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] overflow-hidden shadow-[0_4px_30px_-8px_rgba(0,0,0,0.08)]">
          <Image
            src={image}
            alt={alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) calc(100vw - 3rem), (max-width: 1280px) calc(100vw - 6rem), 1272px"
          />
        </div>

        {/* Title positioned below image — clean editorial layout */}
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
