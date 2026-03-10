'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Users,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const SEGMENTS = [
  { value: 'all', label: 'All Subscribers' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'collector', label: 'Collectors' },
  { value: 'print_buyer', label: 'Print Buyers' },
  { value: 'workshop_attendee', label: 'Workshop Attendees' },
  { value: 'vip', label: 'VIP' },
  { value: 'press', label: 'Press' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: Clock },
  SENDING: { label: 'Sending', color: 'bg-blue-50 text-blue-600', icon: RefreshCw },
  SENT: { label: 'Sent', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
  FAILED: { label: 'Failed', color: 'bg-red-50 text-red-600', icon: XCircle },
};

interface Template {
  id: string;
  name: string;
  subject: string;
  html: string;
  previewText: string | null;
  category: string;
}

interface Blast {
  id: string;
  subject: string;
  html: string;
  previewText: string | null;
  segment: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  sentAt: string | null;
  templateId: string | null;
  notes: string | null;
  createdAt: string;
  template: { id: string; name: string } | null;
}

const defaultForm = { subject: '', html: '', previewText: '', segment: 'all', templateId: '', notes: '' };

export default function BlastsPage() {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [templates, setTemplates] = useState<Template[]>([]);

  // Panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Send
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [confirmSend, setConfirmSend] = useState<Blast | null>(null);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Blast | null>(null);

  const loadBlasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/marketing/blasts?${params}`);
      if (!res.ok) throw new Error('Failed to load blasts');
      const data = await res.json();
      setBlasts(data.blasts);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/templates?limit=100');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadBlasts(); }, [loadBlasts]);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const openCreate = () => {
    setForm(defaultForm);
    setFormError(null);
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); };

  const applyTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) { setForm((p) => ({ ...p, templateId })); return; }
    setForm((p) => ({
      ...p,
      templateId,
      subject: tmpl.subject,
      html: tmpl.html,
      previewText: tmpl.previewText || '',
    }));
  };

  const handleSave = async () => {
    if (!form.subject.trim() || !form.html.trim()) {
      setFormError('Subject and HTML content are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch('/api/marketing/blasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          templateId: form.templateId || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }
      closePanel();
      loadBlasts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (blast: Blast) => {
    setSendingId(blast.id);
    try {
      const res = await fetch(`/api/marketing/blasts/${blast.id}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setConfirmSend(null);
      loadBlasts();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (blast: Blast) => {
    setDeletingId(blast.id);
    try {
      const res = await fetch(`/api/marketing/blasts/${blast.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Delete failed');
      }
      setConfirmDelete(null);
      loadBlasts();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const previewHtml = (blast: Blast) => {
    const w = window.open('', '_blank', 'width=700,height=700');
    if (!w) return;
    w.document.write(blast.html);
    w.document.close();
  };

  const STATUS_TABS = ['', 'DRAFT', 'SENDING', 'SENT', 'FAILED'];

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Blasts</h1>
          <p className="text-sm text-gray-500 mt-1">{total} blast{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Blast
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 -mb-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              statusFilter === s
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {s ? STATUS_CONFIG[s]?.label : 'All'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={loadBlasts} className="text-sm text-gray-600 underline">Retry</button>
        </div>
      ) : blasts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No blasts yet. Compose your first one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Segment</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Stats</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="px-5 py-3 w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {blasts.map((b) => {
                const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.DRAFT;
                const Icon = cfg.icon;
                const segLabel = SEGMENTS.find((s) => s.value === b.segment)?.label ?? b.segment;
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{b.subject}</p>
                      {b.template && (
                        <p className="text-xs text-gray-400 mt-0.5">Template: {b.template.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {segLabel}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full', cfg.color)}>
                        <Icon className={cn('w-3.5 h-3.5', b.status === 'SENDING' && 'animate-spin')} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {b.status === 'SENT' || b.status === 'FAILED' ? (
                        <div className="text-xs text-gray-500">
                          <span className="text-emerald-600 font-medium">{b.sentCount}</span>
                          <span className="mx-1">/</span>
                          <span>{b.recipientCount}</span>
                          {b.failedCount > 0 && (
                            <span className="ml-1 text-red-500">({b.failedCount} failed)</span>
                          )}
                        </div>
                      ) : b.recipientCount > 0 ? (
                        <span className="text-xs text-gray-400">{b.recipientCount} recipients</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                      {b.sentAt
                        ? new Date(b.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => previewHtml(b)}
                          className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {b.status === 'DRAFT' && (
                          <button
                            onClick={() => setConfirmSend(b)}
                            disabled={sendingId === b.id}
                            className="p-1.5 rounded text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                            title="Send blast"
                          >
                            {sendingId === b.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {b.status !== 'SENDING' && (
                          <button
                            onClick={() => setConfirmDelete(b)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Blast Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={closePanel}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[700px] bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Compose Blast</h2>
                <button onClick={closePanel} className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                {/* Use Template */}
                {templates.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Load from Template (optional)</label>
                    <div className="relative">
                      <select
                        value={form.templateId}
                        onChange={(e) => applyTemplate(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="">— Select a template —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Audience Segment *</label>
                  <div className="relative">
                    <select
                      value={form.segment}
                      onChange={(e) => setForm((p) => ({ ...p, segment: e.target.value }))}
                      className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {SEGMENTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject Line *</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. New collection available now"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Preview Text</label>
                  <input
                    value={form.previewText}
                    onChange={(e) => setForm((p) => ({ ...p, previewText: e.target.value }))}
                    placeholder="Short inbox preview text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">HTML Content *</label>
                  <textarea
                    value={form.html}
                    onChange={(e) => setForm((p) => ({ ...p, html: e.target.value }))}
                    rows={16}
                    placeholder="Paste or write your full HTML email..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    placeholder="Optional notes for this blast"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-400">Saved as Draft — send separately</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={closePanel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Draft
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Send Confirm */}
      <AnimatePresence>
        {confirmSend && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setConfirmSend(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Send className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Send Blast</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  You are about to send:
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm">
                  <p className="font-medium text-gray-900">{confirmSend.subject}</p>
                  <p className="text-gray-500 mt-1">
                    Segment: {SEGMENTS.find((s) => s.value === confirmSend.segment)?.label ?? confirmSend.segment}
                  </p>
                </div>
                <p className="text-xs text-amber-600 mb-5">
                  This will immediately email all active subscribers in this segment. This cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmSend(null)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSend(confirmSend)}
                    disabled={sendingId === confirmSend.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {sendingId === confirmSend.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" />Send Now</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Delete Blast</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Delete <strong>{confirmDelete.subject}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    disabled={deletingId === confirmDelete.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === confirmDelete.id && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete
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
