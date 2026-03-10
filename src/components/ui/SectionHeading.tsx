"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7 }}
      className={cn(
        "mb-14 md:mb-20",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4 mb-5",
          align === "center" ? "justify-center" : ""
        )}
      >
        <div className="w-8 h-[1px] bg-gold" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
        <div className="w-8 h-[1px] bg-gold" />
      </div>
      <h2
        className={cn(
          "font-display text-3xl md:text-4xl lg:text-[2.75rem] font-light tracking-[0.01em] leading-[1.15]",
          light ? "text-white" : "text-black"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-5 text-[14px] md:text-[15px] leading-relaxed max-w-xl font-light font-sans",
            align === "center" ? "mx-auto" : "",
            light ? "text-white/50" : "text-charcoal-light"
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
