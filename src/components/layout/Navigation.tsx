"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  { href: "/auctions", label: "Auctions" },
  { href: "/kids-club", label: "Kids Club" },
  {
    href: "/about",
    label: "About",
    children: [
      { href: "/about", label: "Artist Story" },
      { href: "/press", label: "Press & Media" },
      { href: "/journal", label: "Journal" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const itemCount = useCartStore((s) => s.itemCount);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out",
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(200,195,185,0.4)]"
            : "bg-gradient-to-b from-black/50 to-transparent"
        )}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <nav className="container-gallery">
          <div className="flex items-center justify-between h-20 lg:h-[88px]">
            {/* Logo */}
            <Link href="/" className="relative z-50 group">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gold/30 group-hover:border-gold transition-colors duration-500">
                  <Image
                    src="/images/logo.png"
                    alt="MN"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1
                    className={cn(
                      "font-serif text-[1.6rem] lg:text-[1.85rem] tracking-[0.04em] font-medium transition-colors duration-500",
                      scrolled ? "text-black" : "text-white"
                    )}
                  >
                    Mona Niko
                  </h1>
                  <p
                    className={cn(
                      "text-[9px] tracking-[0.35em] uppercase font-sans font-light -mt-0.5 hidden sm:block transition-colors duration-500",
                      scrolled ? "text-charcoal-light" : "text-white/50"
                    )}
                  >
                    Fine Art Gallery
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Nav — centered */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div
                  key={link.href + link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.href + link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "relative px-3 xl:px-4 py-2 text-[10.5px] xl:text-[11.5px] tracking-[0.16em] uppercase font-sans font-medium transition-colors duration-300 group whitespace-nowrap",
                      scrolled
                        ? "text-charcoal hover:text-gold"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="inline-block ml-1 -mt-0.5"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    )}
                    <span
                      className={cn(
                        "absolute bottom-0 left-3 right-3 xl:left-4 xl:right-4 h-[1px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                        scrolled ? "bg-gold" : "bg-white/60"
                      )}
                    />
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.href + link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 pt-3"
                      >
                        <div className="bg-white shadow-xl border border-warm-gray/30 py-3 min-w-[240px]">
                          <div className="w-10 h-[1px] bg-gold mx-5 mb-2" />
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-3 px-5 py-3 text-[11px] tracking-[0.14em] uppercase text-charcoal hover:text-gold hover:bg-cream-dark/50 transition-all duration-200 group/item"
                            >
                              <span className="w-1.5 h-[1px] bg-gold/0 group-hover/item:bg-gold transition-all duration-200" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 relative z-50">
              {/* Search */}
              <button
                className={cn(
                  "p-2.5 transition-colors duration-300 hidden sm:block",
                  scrolled ? "text-charcoal hover:text-gold" : "text-white/70 hover:text-white"
                )}
                aria-label="Search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              {/* Wishlist */}
              <button
                className={cn(
                  "p-2.5 transition-colors duration-300 hidden sm:block",
                  scrolled ? "text-charcoal hover:text-gold" : "text-white/70 hover:text-white"
                )}
                aria-label="Wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className={cn(
                  "relative p-2.5 transition-colors duration-300",
                  scrolled ? "text-charcoal hover:text-gold" : "text-white/70 hover:text-white"
                )}
                aria-label="Open cart"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {itemCount() > 0 && (
                  <span className="absolute top-1 right-0.5 w-[18px] h-[18px] bg-gold text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-sm">
                    {itemCount()}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className={cn("w-[1px] h-5 mx-1 hidden lg:block", scrolled ? "bg-warm-gray" : "bg-white/20")} />

              {/* Account */}
              <Link
                href="/account"
                className={cn(
                  "p-2.5 transition-colors duration-300 hidden lg:block",
                  scrolled ? "text-charcoal hover:text-gold" : "text-white/70 hover:text-white"
                )}
                aria-label="Account"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "lg:hidden p-2.5 ml-1 transition-colors duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center",
                  isOpen
                    ? "text-black"
                    : scrolled
                    ? "text-charcoal"
                    : "text-white"
                )}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <div className="w-6 flex flex-col items-end gap-[6px]">
                  <span
                    className={cn(
                      "block h-[1.5px] bg-current transition-all duration-500 ease-out",
                      isOpen ? "w-6 rotate-45 translate-y-[7.5px]" : "w-6"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-[1.5px] bg-current transition-all duration-500 ease-out",
                      isOpen ? "w-0 opacity-0" : "w-4"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-[1.5px] bg-current transition-all duration-500 ease-out",
                      isOpen ? "w-6 -rotate-45 -translate-y-[7.5px]" : "w-5"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── Mobile Menu Fullscreen ─────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-cream" />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]">
              <Image
                src="/images/artworks/artwork-1.jpg"
                alt=""
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-full flex flex-col pt-24 pb-8 px-6 sm:px-8 overflow-y-auto">
              {/* Nav Links */}
              <div className="flex-1 flex flex-col justify-center">
                <nav className="space-y-0.5">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href + link.label}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                    >
                      {link.children ? (
                        <>
                          <button
                            onClick={() =>
                              setExpandedMobile(
                                expandedMobile === link.label ? null : link.label
                              )
                            }
                            className="group flex items-center gap-4 py-3 min-h-[48px] w-full text-left"
                            aria-expanded={expandedMobile === link.label}
                          >
                            <span className="w-8 h-[1px] bg-gold/30 group-hover:bg-gold group-hover:w-12 transition-all duration-300" />
                            <span className="font-display text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] text-black group-hover:text-gold transition-colors duration-300 font-light">
                              {link.label}
                            </span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={cn(
                                "text-gold/50 transition-transform duration-300 ml-1",
                                expandedMobile === link.label ? "rotate-180" : ""
                              )}
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                          <AnimatePresence>
                            {expandedMobile === link.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-12 space-y-0.5 mb-3">
                                  {link.children.map((child) => (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      onClick={() => setIsOpen(false)}
                                      className="block py-2.5 min-h-[44px] flex items-center text-[13px] tracking-[0.12em] uppercase text-charcoal-light hover:text-gold transition-colors"
                                    >
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-4 py-3 min-h-[48px]"
                        >
                          <span className="w-8 h-[1px] bg-gold/30 group-hover:bg-gold group-hover:w-12 transition-all duration-300" />
                          <span className="font-display text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] text-black group-hover:text-gold transition-colors duration-300 font-light">
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Bottom Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="border-t border-warm-gray pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-light mb-1">Visit Us</p>
                  <p className="text-sm text-charcoal">The Shops at Mission Viejo, CA</p>
                </div>
                <div className="flex gap-6">
                  {["Instagram", "Pinterest", "Facebook"].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="text-[10px] tracking-[0.15em] uppercase text-charcoal-light hover:text-gold transition-colors min-h-[44px] flex items-center"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
