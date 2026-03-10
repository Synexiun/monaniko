"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Crown, Star, Sparkles, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

const TIERS = [
  {
    id: "SILVER",
    name: "Silver",
    icon: "⬜",
    price: "Complimentary",
    color: "border-gray-300",
    highlight: false,
    description: "Begin your collecting journey with exclusive gallery access and early notifications.",
    benefits: [
      "Early access to new collection releases",
      "Invitations to opening receptions",
      "Monthly newsletter with studio updates",
      "10% discount on prints and merchandise",
      "Digital certificate with each purchase",
    ],
  },
  {
    id: "GOLD",
    name: "Gold",
    icon: "🥇",
    price: "$500 / year",
    color: "border-[#C4A265]",
    highlight: true,
    description: "Deepen your connection with the art and gain access to rare works and private previews.",
    benefits: [
      "All Silver benefits",
      "Private viewing appointments",
      "15% discount on original artworks",
      "First access to limited edition prints",
      "Invitation to annual Collector Dinner",
      "Signed edition catalogue each year",
    ],
  },
  {
    id: "PLATINUM",
    name: "Platinum",
    icon: "💎",
    price: "$2,500 / year",
    color: "border-purple-400",
    highlight: false,
    description: "The most exclusive tier — curated for serious collectors and dedicated patrons.",
    benefits: [
      "All Gold benefits",
      "Priority commission access",
      "Certificate of Authenticity for all works",
      "Studio visits and private tours",
      "Custom framing consultation",
      "Annual provenance report",
      "Dedicated gallery liaison",
    ],
  },
];

export default function CollectorClubPage() {
  const [form, setForm] = useState({ name: "", email: "", tier: "SILVER" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/collector-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/artworks/artwork-3.jpg" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/75" />
        </div>
        <div className="relative z-10 container-gallery text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] tracking-[0.3em] uppercase text-[#C4A265] mb-6"
          >
            Exclusive Membership
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-[-0.02em]"
          >
            The Collector Club
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Join a curated community of art collectors and patrons who share a passion
            for original, meaningful works. Enjoy exclusive access, personal service,
            and a direct connection with the artist.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10"
          >
            <a href="#join" className="inline-block px-8 py-3.5 bg-[#C4A265] text-white text-[12px] tracking-[0.15em] uppercase hover:bg-[#B8965A] transition-colors">
              Apply for Membership
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── Tiers ────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container-gallery">
          <SectionHeading
            title="Membership Tiers"
            subtitle="Choose the level of access and benefits that suits your collecting journey."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`relative border-2 ${tier.color} p-8 flex flex-col ${tier.highlight ? 'bg-[#FAF8F4]' : 'bg-white'}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#C4A265] text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1">Most Popular</span>
                  </div>
                )}
                <div className="text-3xl mb-3">{tier.icon}</div>
                <h3 className="font-serif text-2xl text-[#1A1A1A] mb-1">{tier.name}</h3>
                <p className="text-[#C4A265] text-sm font-medium mb-4">{tier.price}</p>
                <p className="text-sm text-[#6B6560] leading-relaxed mb-6">{tier.description}</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-[#4A4A4A]">
                      <CheckCircle2 className="w-4 h-4 text-[#C4A265] shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="#join"
                  onClick={() => setForm((p) => ({ ...p, tier: tier.id }))}
                  className={`block text-center py-3 text-[11px] tracking-[0.15em] uppercase transition-colors ${
                    tier.highlight
                      ? 'bg-[#1A1A1A] text-white hover:bg-[#C4A265]'
                      : 'border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                  }`}
                >
                  Join {tier.name}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits ─────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#1A1A1A]">
        <div className="container-gallery">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="text-[11px] tracking-[0.3em] uppercase text-[#C4A265] mb-6"
            >
              Why Join
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-white font-light mb-6"
            >
              More Than a Membership
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/60 leading-relaxed mb-16"
            >
              The Collector Club is built on genuine relationships between artist and collector.
              Every tier is designed to deepen your connection with the work, the creative process, and the artist.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Crown, title: "Personal Service", desc: "A dedicated liaison who knows your tastes and alerts you to works that match your collection." },
              { icon: Star, title: "Provenance & Value", desc: "Every piece comes with certified documentation, supporting the long-term value of your collection." },
              { icon: Sparkles, title: "Exclusive Access", desc: "Be the first to see new works, attend private openings, and commission bespoke pieces." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#C4A265]/10 border border-[#C4A265]/30 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[#C4A265]" />
                </div>
                <h3 className="font-serif text-lg text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Join Form ────────────────────────────────────── */}
      <section id="join" className="py-24 md:py-32">
        <div className="container-gallery max-w-xl mx-auto">
          <SectionHeading
            title="Apply for Membership"
            subtitle="We review each application personally. You will hear back within 2 business days."
          />

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#E8E5E0] p-10 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#C4A265]/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-[#C4A265]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1A1A] mb-3">Application Received</h3>
                <p className="text-sm text-[#6B6560] leading-relaxed">
                  Thank you for your interest in the Mona Niko Collector Club.
                  We will be in touch within 2 business days to confirm your membership and share next steps.
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleJoin} className="space-y-5">
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-[#6B6560] mb-2">Full Name *</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white border border-[#E8E5E0] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A265] transition-colors"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-[#6B6560] mb-2">Email Address *</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white border border-[#E8E5E0] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A265] transition-colors"
                    placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.15em] uppercase text-[#6B6560] mb-2">Membership Tier</label>
                  <select value={form.tier} onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}
                    className="w-full bg-white border border-[#E8E5E0] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A265] transition-colors appearance-none">
                    {TIERS.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.name} — {t.price}</option>)}
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Submitting…</> : "Apply for Membership"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
