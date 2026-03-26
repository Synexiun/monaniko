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
  const [shopExpanded, setShopExpanded] = useState(false);
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

      <nav className="container-gallery flex items-center justify-between h-24 lg:h-[100px]">

        {/* Logo */}
        <Link href="/" className="relative z-50 group">
          <h1
            className={cn(
              "font-display text-[2.6rem] lg:text-[3.2rem] tracking-[0.04em] font-light italic transition-all duration-700",
              scrolled && !isOpen
                ? "text-stone-900"
                : "text-white drop-shadow-sm"
            )}
          >
            Mona Niko
          </h1>
          <div
            className={cn(
              "text-[9px] tracking-[0.42em] uppercase font-sans font-light mt-[-7px] text-center transition-all duration-700",
              scrolled && !isOpen ? "text-[#C4A265]" : "text-white/50"
            )}
          >
            · Fine Art Gallery ·
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
                  "relative text-[12px] tracking-[0.14em] uppercase font-medium transition-colors duration-500",
                  "after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-0 after:transition-all after:duration-500 hover:after:w-full",
                  scrolled
                    ? "text-stone-700 hover:text-[#C4A265] after:bg-[#C4A265]"
                    : "text-white/90 hover:text-white after:bg-white/70"
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
            onClick={() => { setIsOpen(!isOpen); setShopExpanded(false); }}
            className={cn(
              "lg:hidden p-2 transition-colors duration-300 relative z-[51]",
              isOpen ? "text-white" : scrolled ? "text-stone-700" : "text-white"
            )}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span className={cn("block h-[1.5px] bg-current transition-all duration-300", isOpen ? "rotate-45 translate-y-[6.5px]" : "")} />
              <span className={cn("block h-[1.5px] bg-current transition-all duration-300", isOpen ? "opacity-0 scale-x-0" : "")} />
              <span className={cn("block h-[1.5px] bg-current transition-all duration-300", isOpen ? "-rotate-45 -translate-y-[6.5px]" : "")} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu — full-screen dark overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 lg:hidden bg-[#111111] flex flex-col overflow-y-auto"
          >
            {/* Spacer for the fixed header above */}
            <div className="h-24 flex-shrink-0" />

            {/* Gold rule below header */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#C4A265]/40 to-transparent mx-6 flex-shrink-0" />

            {/* Nav links */}
            <nav className="flex-1 px-6 pt-4 pb-2">
              {navLinks.map((link, i) => (
                <div key={link.href}>
                  {link.children ? (
                    // Shop accordion
                    <>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + i * 0.055, duration: 0.4 }}
                        onClick={() => setShopExpanded((v) => !v)}
                        className="flex items-center justify-between w-full py-4 group"
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="text-[10px] text-white/20 tracking-widest tabular-nums w-5 text-left">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-display text-[2.2rem] font-light italic text-white/85 group-hover:text-[#C4A265] transition-colors duration-300">
                            {link.label}
                          </span>
                        </div>
                        <motion.span
                          animate={{ rotate: shopExpanded ? 45 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-[#C4A265]/60 text-2xl font-light leading-none pr-1"
                        >
                          +
                        </motion.span>
                      </motion.button>

                      <AnimatePresence initial={false}>
                        {shopExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden pl-9"
                          >
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => { setIsOpen(false); setShopExpanded(false); }}
                                className="flex items-center gap-3 py-2.5 group/child"
                              >
                                <span className="w-3 h-px bg-[#C4A265]/30 group-hover/child:bg-[#C4A265] group-hover/child:w-5 transition-all duration-300 flex-shrink-0" />
                                <span className="text-[11px] tracking-[0.18em] uppercase text-white/40 group-hover/child:text-[#C4A265] transition-colors duration-300">
                                  {child.label}
                                </span>
                              </Link>
                            ))}
                            <div className="h-3" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.055, duration: 0.4 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-baseline gap-4 py-4 group"
                      >
                        <span className="text-[10px] text-white/20 tracking-widest tabular-nums w-5 text-left">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-[2.2rem] font-light italic text-white/85 group-hover:text-[#C4A265] transition-colors duration-300">
                          {link.label}
                        </span>
                      </Link>
                    </motion.div>
                  )}

                  {/* Subtle divider */}
                  <div className="h-px bg-white/[0.05]" />
                </div>
              ))}
            </nav>

            {/* Bottom strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="px-6 py-6 flex items-center justify-between border-t border-white/[0.07] flex-shrink-0"
            >
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="text-[11px] tracking-[0.25em] uppercase text-white/35 hover:text-white transition-colors duration-300"
              >
                My Account
              </Link>
              <span className="text-[9px] tracking-[0.3em] uppercase text-white/20">
                Mission Viejo · CA
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
