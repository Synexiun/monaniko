'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle, Gavel, Clock, Trophy, Eye, ChevronRight, Trash2, StopCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuctionStatus = 'DRAFT' | 'LIVE' | 'ENDED' | 'CANCELLED';

const statusTabs: { label: string; value: AuctionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Live', value: 'LIVE' },
  { label: 'Ended', value: 'ENDED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const statusBadge: Record<AuctionStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  LIVE: 'bg-green-50 text-green-700',
  ENDED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

interface AuctionRow {
  id: string;
  artworkTitle: string;
  artworkImage: string | null;
  slug: string;
  startingBid: number;
  reservePrice: number | null;
  currentBid: number | null;
  winnerEmail: string | null;
  winnerName: string | null;
  status: AuctionStatus;
  startAt: string;
  endAt: string;
  description: string | null;
  notes: string | null;
  _count: { bids: number };
}

interface BidRow {
  id: string;
  bidderName: string;
  bidderEmail: string;
  amount: number;
  isWinning: boolean;
  createdAt: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

function timeRemaining(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const emptyForm = {
  artworkTitle: '', artworkImage: '', artworkId: '',
  startingBid: '', reservePrice: '', status: 'DRAFT' as AuctionStatus,
  startAt: '', endAt: '', description: '', notes: '',
};

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AuctionStatus | 'all'>('all');

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [bidsAuction, setBidsAuction] = useState<AuctionRow | null>(null);
  const [bids, setBids] = useState<BidRow[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [endingId, setEndingId] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (activeTab !== 'all') params.set('status', activeTab);
      const res = await fetch(`/api/auctions?${params}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setAuctions(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setPanelOpen(true); };
  const openEdit = (a: AuctionRow) => {
    setEditingId(a.id);
    setForm({
      artworkTitle: a.artworkTitle,
      artworkImage: a.artworkImage || '',
      artworkId: '',
      startingBid: String(a.startingBid),
      reservePrice: a.reservePrice ? String(a.reservePrice) : '',
      status: a.status,
      startAt: a.startAt.slice(0, 16),
      endAt: a.endAt.slice(0, 16),
      description: a.description || '',
      notes: a.notes || '',
    });
    setPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        artworkTitle: form.artworkTitle,
        artworkImage: form.artworkImage || null,
        artworkId: form.artworkId || null,
        startingBid: parseFloat(form.startingBid),
        reservePrice: form.reservePrice ? parseFloat(form.reservePrice) : null,
        status: form.status,
        startAt: form.startAt,
        endAt: form.endAt,
        description: form.description || null,
        notes: form.notes || null,
      };
      const url = editingId ? `/api/auctions/${editingId}` : '/api/auctions';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setPanelOpen(false);
      fetchAuctions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const viewBids = async (auction: AuctionRow) => {
    setBidsAuction(auction);
    setLoadingBids(true);
    setBids([]);
    try {
      const res = await fetch(`/api/auctions/${auction.id}/bid`);
      const json = await res.json();
      setBids(json);
    } catch { setBids([]); } finally { setLoadingBids(false); }
  };

  const endAuction = async (id: string) => {
    setEndingId(id);
    try {
      const res = await fetch(`/api/auctions/${id}/end`, { method: 'POST' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      fetchAuctions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to end auction');
    } finally { setEndingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`/api/auctions/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchAuctions();
    } finally { setDeleting(false); }
  };

  const fieldClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Gavel className="w-6 h-6 text-[#C4A265]" /> Auctions
            </h1>
            <p className="mt-1 text-sm text-gray-500">Manage live artwork auctions and track bids.</p>
          </div>
          <button onClick={openCreate} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            + New Auction
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {statusTabs.map((tab) => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.value ? 'border-black text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Gavel className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No auctions found. Create one to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Artwork</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Starting Bid</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Current Bid</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Bids</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Winner</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auctions.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 truncate max-w-[180px]">{a.artworkTitle}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusBadge[a.status])}>
                        {a.status === 'LIVE' && <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />}
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">{formatCurrency(a.startingBid)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-[#C4A265]">
                      {a.currentBid ? formatCurrency(a.currentBid) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{a._count.bids}</td>
                    <td className="px-4 py-3">
                      {a.status === 'LIVE' ? (
                        <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" /> {timeRemaining(a.endAt)}
                        </span>
                      ) : a.status === 'ENDED' ? (
                        <span className="text-xs text-gray-400">Ended</span>
                      ) : (
                        <span className="text-xs text-gray-400">{new Date(a.endAt).toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.winnerName ? (
                        <span className="flex items-center gap-1 text-xs text-amber-700">
                          <Trophy className="w-3.5 h-3.5" /> {a.winnerName}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => viewBids(a)} title="View bids"
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(a)} title="Edit"
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {a.status === 'LIVE' && (
                          <button onClick={() => endAuction(a.id)} disabled={endingId === a.id} title="End auction"
                            className="p-1.5 rounded-md text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50">
                            {endingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                          </button>
                        )}
                        {a.status === 'DRAFT' && (
                          <button onClick={async () => {
                            await fetch(`/api/auctions/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'LIVE' }) });
                            fetchAuctions();
                          }} title="Go live"
                            className="p-1.5 rounded-md text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(a.id)} title="Delete"
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40" onClick={() => setPanelOpen(false)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Auction' : 'New Auction'}</h2>
                <button onClick={() => setPanelOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className={labelClass}>Artwork Title *</label>
                  <input required value={form.artworkTitle} onChange={(e) => setForm(p => ({ ...p, artworkTitle: e.target.value }))}
                    placeholder="e.g. Eternal Beauty" className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Artwork Image URL</label>
                  <input value={form.artworkImage} onChange={(e) => setForm(p => ({ ...p, artworkImage: e.target.value }))}
                    placeholder="https://..." className={fieldClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Starting Bid ($) *</label>
                    <input required type="number" min="1" step="0.01" value={form.startingBid}
                      onChange={(e) => setForm(p => ({ ...p, startingBid: e.target.value }))}
                      placeholder="500" className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Reserve Price ($)</label>
                    <input type="number" min="1" step="0.01" value={form.reservePrice}
                      onChange={(e) => setForm(p => ({ ...p, reservePrice: e.target.value }))}
                      placeholder="Optional" className={fieldClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start Date & Time *</label>
                    <input required type="datetime-local" value={form.startAt}
                      onChange={(e) => setForm(p => ({ ...p, startAt: e.target.value }))} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date & Time *</label>
                    <input required type="datetime-local" value={form.endAt}
                      onChange={(e) => setForm(p => ({ ...p, endAt: e.target.value }))} className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as AuctionStatus }))}
                    className={fieldClass}>
                    {(['DRAFT', 'LIVE', 'ENDED', 'CANCELLED'] as AuctionStatus[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="About this artwork..." className={`${fieldClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Internal Notes</label>
                  <textarea rows={2} value={form.notes}
                    onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Admin notes only..." className={`${fieldClass} resize-none`} />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={submitting}
                    className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Save Changes' : 'Create Auction'}
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Bids Drawer */}
      <AnimatePresence>
        {bidsAuction && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40" onClick={() => setBidsAuction(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Bid History</h2>
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{bidsAuction.artworkTitle}</p>
                </div>
                <button onClick={() => setBidsAuction(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loadingBids ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : bids.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-10">No bids yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bids.map((bid, i) => (
                      <div key={bid.id} className={cn(
                        'flex items-center justify-between p-3 rounded-lg border text-sm',
                        bid.isWinning ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-white'
                      )}>
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            {bid.isWinning && <Trophy className="w-3.5 h-3.5 text-amber-600" />}
                            {bid.bidderName}
                            {i === 0 && !bid.isWinning && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Leading</span>}
                          </div>
                          <div className="text-xs text-gray-400">{bid.bidderEmail}</div>
                          <div className="text-xs text-gray-400">{new Date(bid.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="font-semibold text-[#C4A265]">{formatCurrency(bid.amount)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Auction?</h3>
              <p className="text-sm text-gray-600 mb-5">This will permanently delete the auction and all associated bids.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={confirmDelete} disabled={deleting}
                  className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
