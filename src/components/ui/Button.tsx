"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium tracking-[0.12em] uppercase transition-all duration-300",
          {
            // Variants
            "bg-black text-white hover:bg-charcoal": variant === "primary",
            "bg-cream text-black hover:bg-warm-gray": variant === "secondary",
            "border border-charcoal text-charcoal hover:bg-black hover:text-white hover:border-black":
              variant === "outline",
            "text-charcoal hover:text-gold bg-transparent": variant === "ghost",
            "bg-gold text-white hover:bg-gold-light": variant === "gold",
            // Sizes
            "text-[11px] px-5 py-2.5": size === "sm",
            "text-[12px] px-8 py-3.5": size === "md",
            "text-[13px] px-10 py-4": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
