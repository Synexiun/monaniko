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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className={cn(
        "mb-12 md:mb-16",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <h2
        className={cn(
          "font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-medium tracking-[-0.01em]",
          light ? "text-white" : "text-black"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-[15px] leading-relaxed max-w-2xl",
            align === "center" ? "mx-auto" : "",
            light ? "text-white/60" : "text-charcoal-light"
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "divider-gold mt-6",
          align === "center" ? "mx-auto" : ""
        )}
      />
    </motion.div>
  );
}
