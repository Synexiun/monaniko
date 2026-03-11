"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/collections", label: "Collections" },
  {
    href: "/shop",
    label: "Shop",
    children: [
      { href: "/shop/originals", label: "Original Paintings" },
      { href: "/shop/prints", label: "Prints & Limited Editions" },
      { href: "/shop/merch", label: "Merch & Objects" },
      { href: "/shop/designers", label: "Designers Collection" },
    ],
  },
  { href: "/workshops", label: "Workshops & Events" },
  { href: "/commissions", label: "Commissions" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const itemCount = useCartStore((s) => s.itemCount);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(200,195,185,0.3)]"
          : "bg-transparent"
      )}
    >
      {/* Thin gold accent line when scrolled */}
      {scrolled && (
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C4A265]/40 to-transparent" />
      )}

      <nav className="container-gallery flex items-center justify-between h-20 lg:h-[88px]">

        {/* Logo */}
        <Link href="/" className="relative z-50 group">
          <h1
            className={cn(
              "font-display text-[2rem] lg:text-[2.2rem] tracking-[0.06em] font-light italic transition-all duration-700",
              scrolled
                ? "text-stone-900"
                : "text-white drop-shadow-sm"
            )}
          >
            Mona Niko
          </h1>
          <div
            className={cn(
              "text-[8px] tracking-[0.45em] uppercase font-sans font-light mt-[-4px] transition-all duration-700",
              scrolled ? "text-[#C4A265]" : "text-white/60"
            )}
          >
            Fine Art Gallery
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={() => link.children && setActiveDropdown(link.href)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "text-[12px] tracking-[0.14em] uppercase font-medium transition-colors duration-500",
                  scrolled
                    ? "text-stone-700 hover:text-[#C4A265]"
                    : "text-white/90 hover:text-white"
                )}
              >
                {link.label}
              </Link>
              {link.children && activeDropdown === link.href && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 pt-3"
                >
                  <div className="bg-white shadow-xl border border-stone-100 py-2 min-w-[210px]">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-5 py-2.5 text-[11px] tracking-[0.12em] uppercase text-stone-600 hover:text-[#C4A265] hover:bg-stone-50 transition-all duration-200"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 relative z-50">
          {/* Cart */}
          <button
            onClick={openCart}
            className={cn(
              "relative p-2 transition-colors duration-500",
              scrolled ? "text-stone-700 hover:text-[#C4A265]" : "text-white/90 hover:text-white"
            )}
            aria-label="Open cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C4A265] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {itemCount()}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "lg:hidden p-2 transition-colors duration-500",
              scrolled ? "text-stone-700" : "text-white"
            )}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span className={cn("block h-[1.5px] bg-current transition-all duration-300", isOpen ? "rotate-45 translate-y-[6.5px]" : "")} />
              <span className={cn("block h-[1.5px] bg-current transition-all duration-300", isOpen ? "opacity-0" : "")} />
              <span className={cn("block h-[1.5px] bg-current transition-all duration-300", isOpen ? "-rotate-45 -translate-y-[6.5px]" : "")} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-40 lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-7">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="font-display text-3xl text-stone-900 hover:text-[#C4A265] transition-colors italic"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 pt-6 border-t border-stone-200"
              >
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="text-sm tracking-[0.15em] uppercase text-stone-400 hover:text-[#C4A265] transition-colors"
                >
                  My Account
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
