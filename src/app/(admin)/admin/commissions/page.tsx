'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paintbrush, Plus, X, Loader2, AlertTriangle, ChevronDown,
  Pencil, Trash2, CheckCircle2, Clock, DollarSign,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const STAGES = [
  'CONSULTATION', 'CONCEPT', 'DEPOSIT_PENDING', 'DEPOSIT_PAID',
  'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED',
];

const STAGE_COLORS: Record<string, string> = {
  CONSULTATION: 'bg-gray-100 text-gray-700',
  CONCEPT: 'bg-blue-50 text-blue-700',
  DEPOSIT_PENDING: 'bg-yellow-50 text-yellow-700',
  DEPOSIT_PAID: 'bg-emerald-50 text-emerald-700',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700',
  REVIEW: 'bg-purple-50 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-50 text-red-600',
};

const ACTIVE_STAGES = STAGES.filter((s) => s !== 'CANCELLED' && s !== 'COMPLETED');

interface Commission {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  stage: string;
  artworkDescription: string | null;
  medium: string | null;
  dimensions: string | null;
  colorNotes: string | null;
  deadline: string | null;
  depositAmount: number | null;
  totalAmount: number | null;
  depositPaidAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
}

const defaultForm = {
  clientName: '', clientEmail: '', clientPhone: '',
  artworkDescription: '', medium: '', dimensions: '',
  colorNotes: '', deadline: '', depositAmount: '', totalAmount: '', notes: '',
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState('');

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Commission | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Commission | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = new URLSearchParams({ limit: '100' });
      if (stageFilter) params.set('stage', stageFilter);
      const res = await fetch(`/api/commissions?${params}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCommissions(data.commissions);
      setTotal(data.total);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }, [stageFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null); setForm(defaultForm); setFormError(null); setPanelOpen(true);
  };
  const openEdit = (c: Commission) => {
    setEditing(c);
    setForm({
      clientName: c.clientName, clientEmail: c.clientEmail,
      clientPhone: c.clientPhone || '', artworkDescription: c.artworkDescription || '',
      medium: c.medium || '', dimensions: c.dimensions || '',
      colorNotes: c.colorNotes || '',
      deadline: c.deadline ? c.deadline.slice(0, 10) : '',
      depositAmount: c.depositAmount?.toString() || '',
      totalAmount: c.totalAmount?.toString() || '',
      notes: c.notes || '',
    });
    setFormError(null); setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.clientEmail.trim()) {
      setFormError('Client name and email are required'); return;
    }
    setSaving(true); setFormError(null);
    try {
      const url = editing ? `/api/commissions/${editing.id}` : '/api/commissions';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      setPanelOpen(false); setEditing(null); load();
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleStageChange = async (id: string, stage: string) => {
    setUpdatingStage(id);
    await fetch(`/api/commissions/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }),
    });
    setCommissions((prev) => prev.map((c) => c.id === id ? { ...c, stage } : c));
    setUpdatingStage(null);
  };

  const handleDelete = async (c: Commission) => {
    setDeletingId(c.id);
    await fetch(`/api/commissions/${c.id}`, { method: 'DELETE' });
    setConfirmDelete(null); setDeletingId(null); load();
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  // Group by active stages for pipeline view
  const pipeline = ACTIVE_STAGES.map((stage) => ({
    stage,
    items: commissions.filter((c) => c.stage === stage),
  }));
  const completed = commissions.filter((c) => c.stage === 'COMPLETED');
  const cancelled = commissions.filter((c) => c.stage === 'CANCELLED');

  const STATUS_TABS = [{ value: '', label: 'All' }, ...STAGES.map((s) => ({ value: s, label: s.replace('_', ' ') }))];

  const fieldClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
          <p className="text-sm text-gray-500 mt-1">{total} commission{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" /> New Commission
        </button>
      </div>

      {/* Stage filter tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto -mb-2 pb-0">
        {STATUS_TABS.slice(0, 5).map((t) => (
          <button key={t.value} onClick={() => setStageFilter(t.value)}
            className={cn('px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors',
              stageFilter === t.value ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}>
            {t.label === '' ? 'All' : t.label.charAt(0) + t.label.slice(1).toLowerCase().replace('_', ' ')}
          </button>
        ))}
        <div className="relative ml-1">
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2.5 text-xs border-0 border-b-2 border-transparent bg-transparent text-gray-500 focus:outline-none focus:border-gray-900 focus:text-gray-900 transition-colors">
            <option value="">More ▾</option>
            {STATUS_TABS.slice(5).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={load} className="text-sm text-gray-600 underline">Retry</button>
        </div>
      ) : commissions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Paintbrush className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No commissions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Stage</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Value</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Deadline</th>
                <th className="px-5 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{c.clientName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.clientEmail}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-600 truncate max-w-[200px]">
                      {c.artworkDescription || <span className="text-gray-300 italic">No description</span>}
                    </p>
                    {c.medium && <p className="text-xs text-gray-400 mt-0.5">{c.medium}{c.dimensions ? ` · ${c.dimensions}` : ''}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="relative">
                      <select
                        value={c.stage}
                        onChange={(e) => handleStageChange(c.id, e.target.value)}
                        disabled={updatingStage === c.id}
                        className={cn(
                          'appearance-none text-xs font-medium px-2.5 py-1 pr-6 rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-gray-900',
                          STAGE_COLORS[c.stage] ?? 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}</option>
                        ))}
                      </select>
                      {updatingStage === c.id && <Loader2 className="absolute right-1.5 top-1.5 w-3 h-3 animate-spin" />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {c.totalAmount ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatPrice(c.totalAmount)}</p>
                        {c.depositAmount && <p className="text-xs text-gray-400">{formatPrice(c.depositAmount)} deposit</p>}
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-500">
                    {c.deadline ? new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(c)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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

      {/* Slide-in Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40" onClick={() => setPanelOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[560px] bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">{editing ? 'Edit Commission' : 'New Commission'}</h2>
                <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {formError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Client Name *</label>
                    <input value={form.clientName} onChange={f('clientName')} placeholder="Full name" className={fieldClass} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Email *</label>
                    <input type="email" value={form.clientEmail} onChange={f('clientEmail')} placeholder="client@email.com" className={fieldClass} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Phone</label>
                    <input value={form.clientPhone} onChange={f('clientPhone')} placeholder="Optional" className={fieldClass} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClass}>Deadline</label>
                    <input type="date" value={form.deadline} onChange={f('deadline')} className={fieldClass} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Artwork Description</label>
                    <textarea value={form.artworkDescription} onChange={f('artworkDescription')} rows={3}
                      placeholder="What does the client want?" className={`${fieldClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Medium</label>
                    <input value={form.medium} onChange={f('medium')} placeholder="e.g. Oil on canvas" className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Dimensions</label>
                    <input value={form.dimensions} onChange={f('dimensions')} placeholder="e.g. 24 x 36 inches" className={fieldClass} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Color Notes / References</label>
                    <textarea value={form.colorNotes} onChange={f('colorNotes')} rows={2}
                      placeholder="Color palette, mood, inspiration…" className={`${fieldClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Deposit Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={form.depositAmount} onChange={f('depositAmount')} placeholder="0.00" className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Total Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={form.totalAmount} onChange={f('totalAmount')} placeholder="0.00" className={fieldClass} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Internal Notes</label>
                    <textarea value={form.notes} onChange={f('notes')} rows={2} className={`${fieldClass} resize-none`} />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button onClick={() => setPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Create Commission'}
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
                  <h3 className="font-semibold text-gray-900">Delete Commission</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Delete commission for <strong>{confirmDelete.clientName}</strong>? This cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                    {deletingId === confirmDelete.id && <Loader2 className="w-4 h-4 animate-spin" />} Delete
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
