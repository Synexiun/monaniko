"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  gallery: [
    { href: "/gallery", label: "All Works" },
    { href: "/collections", label: "Collections" },
    { href: "/shop/originals", label: "Original Paintings" },
    { href: "/shop/prints", label: "Prints" },
  ],
  experience: [
    { href: "/workshops", label: "Workshops" },
    { href: "/commissions", label: "Custom Commissions" },
    { href: "/journal", label: "Journal" },
    { href: "/press", label: "Press" },
  ],
  info: [
    { href: "/about", label: "About the Artist" },
    { href: "/contact", label: "Contact & Visit" },
    { href: "/faq", label: "FAQ" },
    { href: "/policies", label: "Shipping & Policies" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white/60">
      {/* Newsletter Band */}
      <div className="border-b border-white/[0.06]">
        <div className="container-gallery py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="w-8 h-[1px] bg-gold/50" />
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/70 font-sans">
                  Exclusive Access
                </p>
              </div>
              <h3 className="font-display text-[2.4rem] md:text-[3rem] text-white font-light italic leading-snug">
                Join the Collector&apos;s Circle
              </h3>
              <p className="text-[13px] text-white/35 max-w-md mt-3 font-light">
                Receive early access to new works, private viewing invitations,
                and exclusive collector insights.
              </p>
            </div>
            <form
              className="flex w-full max-w-lg"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] px-6 py-4 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-gold/40 transition-colors font-light"
              />
              <button
                type="submit"
                className="bg-gold hover:bg-gold-light text-white px-8 py-4 text-[11px] tracking-[0.18em] uppercase font-sans font-medium transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-gallery py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo/1.png"
                alt="Mona Niko Fine Art Gallery"
                width={200}
                height={200}
                className="h-[90px] w-auto object-contain brightness-0 invert opacity-85"
              />
            </Link>
            <p className="text-[13px] leading-[1.8] text-white/35 max-w-sm mb-8 font-light">
              Contemporary fine art gallery featuring original paintings,
              limited edition prints, and immersive creative workshops.
              Located in Mission Viejo, California.
            </p>
            <div className="flex gap-6">
              {[
                { name: "Instagram", icon: "M7.8 2h8.4C19 2 22 5 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z" },
                { name: "Pinterest", icon: "M12 2C6.48 2 2 6.48 2 12c0 4.12 2.5 7.65 6.08 9.18-.08-.72-.15-1.82.03-2.6.17-.72 1.08-4.58 1.08-4.58s-.28-.55-.28-1.37c0-1.28.74-2.24 1.67-2.24.79 0 1.17.59 1.17 1.3 0 .79-.5 1.97-.77 3.07-.22.92.46 1.67 1.37 1.67 1.65 0 2.91-1.74 2.91-4.24 0-2.22-1.59-3.77-3.87-3.77-2.64 0-4.19 1.98-4.19 4.03 0 .8.31 1.65.69 2.12.08.09.09.17.07.26-.07.29-.23.92-.26 1.05-.04.18-.14.22-.33.13-1.22-.57-1.98-2.37-1.98-3.81 0-3.1 2.25-5.95 6.49-5.95 3.41 0 6.06 2.43 6.06 5.68 0 3.39-2.14 6.11-5.1 6.11-1 0-1.93-.52-2.25-1.13l-.61 2.34c-.22.86-.82 1.93-1.22 2.59.92.28 1.9.44 2.91.44 5.52 0 10-4.48 10-10S17.52 2 12 2z" },
                { name: "Facebook", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="text-white/40 hover:text-gold transition-colors duration-300"
                  aria-label={social.name}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="text-[10px] tracking-[0.25em] uppercase text-white/45 mb-6 font-sans font-semibold">
                {key === "info" ? "Information" : key.charAt(0).toUpperCase() + key.slice(1)}
              </h4>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/55 hover:text-gold transition-colors duration-300 font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06]">
        <div className="container-gallery py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/20 tracking-wide font-light">
            &copy; {new Date().getFullYear()} Mona Niko Gallery. All rights
            reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="/policies"
              className="text-[11px] text-white/20 hover:text-white/40 transition-colors tracking-wide font-light"
            >
              Privacy Policy
            </Link>
            <Link
              href="/policies"
              className="text-[11px] text-white/20 hover:text-white/40 transition-colors tracking-wide font-light"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
