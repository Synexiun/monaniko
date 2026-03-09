"use client";

import Link from "next/link";

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
    <footer className="bg-black text-white/70">
      {/* Newsletter Band */}
      <div className="border-b border-white/10">
        <div className="container-gallery py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-2xl text-white mb-2">Join the Collector&apos;s Circle</h3>
            <p className="text-sm text-white/50 max-w-md">
              Receive early access to new works, private viewing invitations, and exclusive collector insights.
            </p>
          </div>
          <form className="flex w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/15 px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              className="bg-gold hover:bg-gold-light text-white px-8 py-3.5 text-[12px] tracking-[0.15em] uppercase font-medium transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-gallery py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-serif text-2xl text-white">Mona Niko</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50 max-w-sm mb-6">
              Contemporary fine art gallery featuring original paintings, limited edition prints,
              and immersive creative workshops. Located in Mission Viejo, California.
            </p>
            <div className="flex gap-5">
              {["Instagram", "Facebook", "Pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-[11px] tracking-[0.15em] uppercase text-white/40 hover:text-gold transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 mb-5 font-sans font-semibold">
              Gallery
            </h4>
            <ul className="space-y-3">
              {footerLinks.gallery.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 mb-5 font-sans font-semibold">
              Experience
            </h4>
            <ul className="space-y-3">
              {footerLinks.experience.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 mb-5 font-sans font-semibold">
              Information
            </h4>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-gallery py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30 tracking-wide">
            &copy; {new Date().getFullYear()} Mona Niko Gallery. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/policies" className="text-[11px] text-white/30 hover:text-white/50 transition-colors tracking-wide">
              Privacy Policy
            </Link>
            <Link href="/policies" className="text-[11px] text-white/30 hover:text-white/50 transition-colors tracking-wide">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
