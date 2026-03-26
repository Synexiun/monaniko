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
    <section className="relative w-full h-[200px] sm:h-[260px] md:h-[320px] overflow-hidden">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Subtle gradient only when we need text overlay */}
      {title && (
        <>
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-end pb-8 md:pb-12">
            <h1 className="font-display text-[2rem] md:text-[2.8rem] text-white font-light italic tracking-wide">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white/50">
                {subtitle}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
