"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Gavel, Clock, TrendingUp, CheckCircle2, AlertTriangle, Loader2, Trophy, User } from "lucide-react";
import Button from "@/components/ui/Button";

interface Auction {
  id: string;
  artworkTitle: string;
  artworkImage: string | null;
  slug: string;
  startingBid: number;
  reservePrice: number | null;
  currentBid: number | null;
  winnerName: string | null;
  winnerEmail: string | null;
  status: string;
  startAt: string;
  endAt: string;
  description: string | null;
  _count: { bids: number };
  bids: BidRow[];
}

interface BidRow {
  id: string;
  bidderName: string;
  bidderEmail: string;
  amount: number;
  isWinning: boolean;
  createdAt: string;
}

function Countdown({ endAt, onEnded }: { endAt: string; onEnded?: () => void }) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0, ended: false });

  useEffect(() => {
    const update = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) {
        setParts({ d: 0, h: 0, m: 0, s: 0, ended: true });
        onEnded?.();
        return;
      }
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        ended: false,
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endAt, onEnded]);

  if (parts.ended) return <span className="text-red-500 font-semibold">Auction Ended</span>;

  const blocks = parts.d > 0
    ? [{ label: 'Days', val: parts.d }, { label: 'Hours', val: parts.h }, { label: 'Mins', val: parts.m }, { label: 'Secs', val: parts.s }]
    : [{ label: 'Hours', val: parts.h }, { label: 'Mins', val: parts.m }, { label: 'Secs', val: parts.s }];

  return (
    <div className="flex gap-3">
      {blocks.map(({ label, val }) => (
        <div key={label} className="text-center">
          <div className="w-16 h-16 bg-[#1A1A1A] flex items-center justify-center rounded-lg">
            <span className="font-mono text-2xl text-white font-bold">{String(val).padStart(2, '0')}</span>
          </div>
          <p className="text-[10px] text-[#6B6560] tracking-[0.1em] uppercase mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function AuctionDetailContent() {
  const params = useParams();
  const slug = params.slug as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [bidForm, setBidForm] = useState({ name: '', email: '', amount: '' });
  const [bidding, setBidding] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState('');

  const fetchAuction = useCallback(async () => {
    try {
      const res = await fetch(`/api/auctions/${slug}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setAuction(data);
      // Pre-fill minimum bid amount
      setBidForm(p => ({
        ...p,
        amount: String(Math.ceil((data.currentBid ?? data.startingBid) + 1)),
      }));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchAuction(); }, [fetchAuction]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    setBidding(true);
    setBidError('');
    setBidSuccess(false);
    try {
      const res = await fetch(`/api/auctions/${auction.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidderName: bidForm.name,
          bidderEmail: bidForm.email,
          amount: parseFloat(bidForm.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place bid');
      setBidSuccess(true);
      fetchAuction(); // Refresh to show new bid
    } catch (err) {
      setBidError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBidding(false);
    }
  };

  const minBid = auction ? Math.ceil((auction.currentBid ?? auction.startingBid) + 1) : 0;
  const isLive = auction?.status === 'LIVE';
  const isEnded = auction?.status === 'ENDED';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4A265]" />
      </div>
    );
  }

  if (notFound || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <Gavel className="w-12 h-12 mx-auto mb-4 text-[#C4A265]/40" />
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2">Auction Not Found</h1>
          <p className="text-[#6B6560]">This auction may have ended or doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-28 pb-4">
        <div className="container-gallery">
          <nav className="text-xs text-[#6B6560] tracking-[0.1em] uppercase">
            <a href="/auctions" className="hover:text-[#C4A265] transition-colors">Auctions</a>
            <span className="mx-2">›</span>
            <span>{auction.artworkTitle}</span>
          </nav>
        </div>
      </div>

      {/* Main */}
      <section className="pb-24 md:pb-32">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Left: Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="relative aspect-square bg-[#F5F3EE] overflow-hidden">
                {auction.artworkImage ? (
                  <Image src={auction.artworkImage} alt={auction.artworkTitle} fill className="object-contain p-4" priority />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gavel className="w-20 h-20 text-[#C4A265]/20" />
                  </div>
                )}
                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-medium ${
                  isLive ? 'bg-black/80 text-white' : isEnded ? 'bg-gray-800/80 text-gray-300' : 'bg-amber-900/80 text-amber-300'
                }`}>
                  {isLive && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
                  {isEnded ? 'Ended' : isLive ? 'Live' : auction.status}
                </div>
              </div>
            </motion.div>

            {/* Right: Details + Bid */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col">

              <h1 className="font-display text-3xl md:text-4xl text-[#1A1A1A] font-light tracking-[-0.02em] mb-2">
                {auction.artworkTitle}
              </h1>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Original Artwork by Mona Niko</p>

              {auction.description && (
                <p className="text-[#4A4A4A] leading-relaxed mb-8">{auction.description}</p>
              )}

              {/* Current Bid */}
              <div className="bg-[#FAF8F4] border border-[#E8E5E0] p-6 mb-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-1">
                      {auction.currentBid ? 'Current Bid' : 'Starting Bid'}
                    </p>
                    <p className="font-serif text-4xl text-[#C4A265]">
                      ${(auction.currentBid ?? auction.startingBid).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-sm text-[#6B6560]">
                    <div className="flex items-center gap-1.5 justify-end">
                      <TrendingUp className="w-4 h-4" />
                      {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {isLive && (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Time Remaining
                    </p>
                    <Countdown endAt={auction.endAt} onEnded={fetchAuction} />
                  </div>
                )}

                {isEnded && auction.winnerName && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E8E5E0]">
                    <Trophy className="w-5 h-5 text-[#C4A265]" />
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[#6B6560]">Winner</p>
                      <p className="font-semibold text-[#1A1A1A]">{auction.winnerName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bid Form */}
              {isLive && !bidSuccess && (
                <form onSubmit={handleBid} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-1.5">Your Name *</label>
                      <input required value={bidForm.name} onChange={e => setBidForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full border border-[#E8E5E0] bg-white px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A265] transition-colors"
                        placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-1.5">Email *</label>
                      <input required type="email" value={bidForm.email} onChange={e => setBidForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full border border-[#E8E5E0] bg-white px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C4A265] transition-colors"
                        placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-1.5">
                      Bid Amount (min. ${minBid.toLocaleString()}) *
                    </label>
                    <div className="flex items-center border border-[#E8E5E0] bg-white focus-within:border-[#C4A265] transition-colors">
                      <span className="px-3 text-[#6B6560] text-sm font-medium">$</span>
                      <input required type="number" min={minBid} step="1" value={bidForm.amount}
                        onChange={e => setBidForm(p => ({ ...p, amount: e.target.value }))}
                        className="flex-1 py-2.5 pr-3 text-sm text-[#1A1A1A] bg-transparent focus:outline-none"
                        placeholder={String(minBid)} />
                    </div>
                  </div>

                  {bidError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {bidError}
                    </div>
                  )}

                  <Button type="submit" variant="gold" size="lg" className="w-full" disabled={bidding}>
                    {bidding ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Placing Bid…</> : `Place Bid — $${parseFloat(bidForm.amount || '0').toLocaleString() || minBid.toLocaleString()}`}
                  </Button>
                  <p className="text-xs text-[#6B6560] text-center">By placing a bid you agree to purchase if you win.</p>
                </form>
              )}

              {bidSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 p-5 flex items-start gap-3 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Bid Placed Successfully!</p>
                    <p className="text-sm text-green-700 mt-1">You will receive an email if you are outbid. Good luck!</p>
                    <button onClick={() => setBidSuccess(false)} className="text-xs text-green-600 underline mt-2">Place another bid</button>
                  </div>
                </motion.div>
              )}

              {isEnded && !auction.winnerName && (
                <div className="bg-gray-50 border border-gray-200 p-5 text-sm text-[#6B6560] mb-6">
                  This auction has ended with no bids.
                </div>
              )}
            </motion.div>
          </div>

          {/* Bid History */}
          {auction.bids.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-2xl text-[#1A1A1A] mb-6">Bid History</h2>
              <div className="max-w-2xl">
                <div className="divide-y divide-[#E8E5E0] border border-[#E8E5E0]">
                  {auction.bids.map((bid, i) => (
                    <div key={bid.id} className={`flex items-center justify-between px-5 py-3.5 ${bid.isWinning ? 'bg-amber-50' : i === 0 && !bid.isWinning ? 'bg-[#FAF8F4]' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#E8E5E0] flex items-center justify-center">
                          {bid.isWinning ? (
                            <Trophy className="w-3.5 h-3.5 text-[#C4A265]" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-[#6B6560]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{bid.bidderName}</p>
                          <p className="text-xs text-[#6B6560]">{new Date(bid.createdAt).toLocaleString()}</p>
                        </div>
                        {i === 0 && !bid.isWinning && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full tracking-[0.08em] uppercase font-medium">Leading</span>
                        )}
                        {bid.isWinning && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full tracking-[0.08em] uppercase font-medium">Winner</span>
                        )}
                      </div>
                      <p className="font-serif text-lg text-[#C4A265]">${bid.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
