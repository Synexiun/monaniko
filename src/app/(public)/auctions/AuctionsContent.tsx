"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Gavel, Clock, TrendingUp, Loader2 } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";

interface AuctionItem {
  id: string;
  artworkTitle: string;
  artworkImage: string | null;
  slug: string;
  startingBid: number;
  currentBid: number | null;
  endAt: string;
  _count: { bids: number };
}

function Countdown({ endAt }: { endAt: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setRemaining(`${d}d ${h}h ${m}m`);
      else setRemaining(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endAt]);

  return <span>{remaining}</span>;
}

export default function AuctionsContent() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuctions = useCallback(async () => {
    try {
      const res = await fetch('/api/auctions?public=true&limit=24');
      if (!res.ok) return;
      const json = await res.json();
      setAuctions(json.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  return (
    <>
      <PageHero
        image="/images/hero/gallery/2.jpg"
        alt="Auctions"
        title="Auctions"
        subtitle="Bid on exclusive original works"
      />

      {/* Auctions Grid */}
      <section className="py-20 md:py-28">
        <div className="container-gallery">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#C4A265]" />
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-20">
              <Gavel className="w-12 h-12 mx-auto mb-4 text-[#C4A265]/40" />
              <h2 className="font-serif text-2xl text-[#1A1A1A] mb-2">No Active Auctions</h2>
              <p className="text-[#6B6560]">Check back soon — new auctions are announced regularly.</p>
            </div>
          ) : (
            <>
              <SectionHeading title="Live Now" subtitle={`${auctions.length} auction${auctions.length !== 1 ? 's' : ''} currently active`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {auctions.map((auction, i) => (
                  <motion.div key={auction.id}
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                    <Link href={`/auctions/${auction.slug}`} className="group block bg-white border border-[#E8E5E0] hover:border-[#C4A265] transition-colors overflow-hidden">
                      <div className="relative aspect-[4/3] bg-[#F5F3EE] overflow-hidden">
                        {auction.artworkImage ? (
                          <Image src={auction.artworkImage} alt={auction.artworkTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Gavel className="w-12 h-12 text-[#C4A265]/30" />
                          </div>
                        )}
                        {/* Live badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm text-white text-[10px] tracking-[0.15em] uppercase px-2.5 py-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          Live
                        </div>
                        {/* Countdown */}
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#C4A265]" />
                          <Countdown endAt={auction.endAt} />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg text-[#1A1A1A] mb-3">{auction.artworkTitle}</h3>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-0.5">Current Bid</p>
                            <p className="font-serif text-xl text-[#C4A265]">
                              ${(auction.currentBid ?? auction.startingBid).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-[#6B6560]">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#E8E5E0]">
                          <span className="block w-full text-center py-2.5 text-[11px] tracking-[0.15em] uppercase bg-[#1A1A1A] text-white group-hover:bg-[#C4A265] transition-colors">
                            Place Bid →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
