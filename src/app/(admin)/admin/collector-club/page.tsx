'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Plus, Pencil, Trash2, X, Loader2, AlertTriangle, Crown, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const TIERS = ['SILVER', 'GOLD', 'PLATINUM'];
const STATUSES = ['ACTIVE', 'SUSPENDED', 'CANCELLED'];

const TIER_COLORS: Record<string, string> = {
  SILVER: 'bg-gray-100 text-gray-700',
  GOLD: 'bg-amber-50 text-amber-700',
  PLATINUM: 'bg-purple-50 text-purple-700',
};

const TIER_ICONS: Record<string, string> = { SILVER: '⬜', GOLD: '🥇', PLATINUM: '💎' };

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  SUSPENDED: 'bg-yellow-50 text-yellow-700',
  CANCELLED: 'bg-red-50 text-red-600',
};

interface Member {
  id: string;
  name: string;
  email: string;
  tier: string;
  status: string;
  joinedAt: string;
  expiresAt: string | null;
  notes: string | null;
}

interface Stats { tier: string; _count: { id: number } }

const defaultForm = { name: '', email: '', tier: 'SILVER', status: 'ACTIVE', notes: '', expiresAt: '' };

export default function CollectorClubPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState('');

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = new URLSearchParams({ limit: '100' });
      if (tierFilter) params.set('tier', tierFilter);
      const res = await fetch(`/api/collector-club?${params}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setMembers(data.members); setTotal(data.total); setStats(data.stats);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }, [tierFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setFormError(null); setPanelOpen(true); };
  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({ name: m.name, email: m.email, tier: m.tier, status: m.status, notes: m.notes || '', expiresAt: m.expiresAt ? m.expiresAt.slice(0, 10) : '' });
    setFormError(null); setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { setFormError('Name and email are required'); return; }
    setSaving(true); setFormError(null);
    try {
      const url = editing ? `/api/collector-club/${editing.id}` : '/api/collector-club';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      setPanelOpen(false); setEditing(null); load();
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (m: Member) => {
    setDeletingId(m.id);
    await fetch(`/api/collector-club/${m.id}`, { method: 'DELETE' });
    setConfirmDelete(null); setDeletingId(null); load();
  };

  const countByTier = (tier: string) => stats.find((s) => s.tier === tier)?._count?.id ?? 0;
  const activeTotal = stats.reduce((s, t) => s + (t._count?.id ?? 0), 0);

  const fieldClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collector Club</h1>
          <p className="text-sm text-gray-500 mt-1">{total} member{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', value: activeTotal, color: 'bg-gray-50', icon: Star },
          { label: 'Silver', value: countByTier('SILVER'), color: 'bg-gray-50', icon: Star },
          { label: 'Gold', value: countByTier('GOLD'), color: 'bg-amber-50', icon: Star },
          { label: 'Platinum', value: countByTier('PLATINUM'), color: 'bg-purple-50', icon: Crown },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-lg border border-gray-200 p-4 shadow-sm`}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tier Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 -mb-2">
        {[{ value: '', label: 'All' }, ...TIERS.map((t) => ({ value: t, label: t }))].map((t) => (
          <button key={t.value} onClick={() => setTierFilter(t.value)}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tierFilter === t.value ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}>
            {t.label === '' ? 'All Members' : `${TIER_ICONS[t.label]} ${t.label.charAt(0) + t.label.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={load} className="text-sm text-gray-600 underline">Retry</button>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No members yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Member</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Tier</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Expires</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', TIER_COLORS[m.tier] ?? 'bg-gray-100 text-gray-700')}>
                      {TIER_ICONS[m.tier]} {m.tier.charAt(0) + m.tier.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', STATUS_COLORS[m.status] ?? 'bg-gray-100 text-gray-700')}>
                      {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-500">
                    {new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                    {m.expiresAt ? new Date(m.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete(m)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-in Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40" onClick={() => setPanelOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">{editing ? 'Edit Member' : 'Add Member'}</h2>
                <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {formError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={fieldClass} placeholder="Full name" />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={fieldClass} placeholder="member@email.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tier</label>
                    <div className="relative">
                      <select value={form.tier} onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}
                        className={`${fieldClass} appearance-none pr-8`}>
                        {TIERS.map((t) => <option key={t} value={t}>{TIER_ICONS[t]} {t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <div className="relative">
                      <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                        className={`${fieldClass} appearance-none pr-8`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Expiry Date (optional)</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className={`${fieldClass} resize-none`} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button onClick={() => setPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-500" /></div>
                  <h3 className="font-semibold text-gray-900">Remove Member</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Remove <strong>{confirmDelete.name}</strong> from the Collector Club?</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                    {deletingId === confirmDelete.id && <Loader2 className="w-4 h-4 animate-spin" />} Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
