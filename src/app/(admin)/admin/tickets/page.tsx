'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Search,
  Plus,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  HelpCircle,
  Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };
const ITEMS_PER_PAGE = 20;

interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  pageContext: string | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

type TabValue = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  open: { label: 'Open', icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  in_progress: { label: 'In Progress', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolved', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Closed', icon: XCircle, className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  medium: { label: 'Medium', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  critical: { label: 'Critical', className: 'bg-red-50 text-red-700 border-red-200' },
};

const categoryConfig: Record<string, string> = {
  general: 'General',
  bug: 'Bug / Error',
  feature: 'Feature Request',
  content: 'Content Issue',
  billing: 'Billing',
  access: 'Access / Login',
  performance: 'Performance',
  other: 'Other',
};

const statIcons = [
  { key: 'open', icon: AlertCircle, label: 'Open', color: 'text-red-500' },
  { key: 'in_progress', icon: Clock, label: 'In Progress', color: 'text-amber-500' },
  { key: 'resolved', icon: CheckCircle2, label: 'Resolved', color: 'text-emerald-500' },
  { key: 'closed', icon: XCircle, label: 'Closed', color: 'text-gray-400' },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<TabValue>('all');
  const [counts, setCounts] = useState({ all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [activeTab, setActiveTab] = useState<'tickets' | 'report'>('tickets');

  const [newModal, setNewModal] = useState(false);
  const [detailModal, setDetailModal] = useState<SupportTicket | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: '', description: '', category: 'general', priority: 'medium', pageContext: '' });
  const [editForm, setEditForm] = useState({ status: '', priority: '', resolution: '' });

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set('search', search);
      if (tabFilter !== 'all') params.set('status', tabFilter);
      const res = await fetch(`/api/tickets?${params}`);
      const json = await res.json();
      setTickets(Array.isArray(json.data) ? json.data : []);
      setTotal(json.pagination?.total || 0);
      if (json.counts) setCounts(json.counts);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, tabFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearchChange = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(value); setPage(1); }, 400);
  };

  const createTicket = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setNewModal(false);
        setForm({ title: '', description: '', category: 'general', priority: 'medium', pageContext: '' });
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const updateTicket = async (id: string, data: Partial<SupportTicket>) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? updated : t));
        if (detailModal?.id === id) setDetailModal(updated);
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
    setStatusDropdown(null);
  };

  const deleteTicket = async (id: string) => {
    if (!confirm('Delete this ticket permanently?')) return;
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    setDetailModal(null);
    fetchData();
  };

  const openDetail = (ticket: SupportTicket) => {
    setDetailModal(ticket);
    setEditForm({ status: ticket.status, priority: ticket.priority, resolution: ticket.resolution || '' });
  };

  const saveEdit = async () => {
    if (!detailModal) return;
    setSaving(true);
    await updateTicket(detailModal.id, { status: editForm.status, priority: editForm.priority, resolution: editForm.resolution || null } as Partial<SupportTicket>);
    setSaving(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const tabs: { value: TabValue; label: string; count: number; dot?: boolean }[] = [
    { value: 'all', label: 'All', count: counts.all || total },
    { value: 'open', label: 'Open', count: counts.open, dot: counts.open > 0 },
    { value: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { value: 'resolved', label: 'Resolved', count: counts.resolved },
    { value: 'closed', label: 'Closed', count: counts.closed },
  ];

  /* ─── Report data ─────────────────────────────── */
  const reportByStatus = Object.entries(statusConfig).map(([k, v]) => ({
    label: v.label, count: (counts as Record<string, number>)[k] || 0, className: v.className,
  }));

  const categoryTotals: Record<string, number> = {};
  const priorityTotals: Record<string, number> = {};
  tickets.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + 1;
    priorityTotals[t.priority] = (priorityTotals[t.priority] || 0) + 1;
  });

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Track and resolve admin issues and requests ({total} total)</p>
        </div>
        <button
          onClick={() => setNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statIcons.map(s => (
          <div key={s.key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{(counts as Record<string, number>)[s.key] || 0}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Top Nav: Tickets | Report */}
        <div className="flex items-center gap-0 px-4 pt-3 border-b border-gray-100">
          {(['tickets', 'report'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === t ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'tickets' ? <Ticket className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {activeTab === t && <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          ))}
        </div>

        {activeTab === 'tickets' ? (
          <>
            {/* Status Tabs */}
            <div className="flex items-center gap-0 px-4 border-b border-gray-100 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => { setTabFilter(tab.value); setPage(1); }}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                    tabFilter === tab.value ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.dot && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                    {tab.label}
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full', tabFilter === tab.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500')}>
                      {tab.count}
                    </span>
                  </span>
                  {tabFilter === tab.value && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  defaultValue={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="ml-3 text-sm text-gray-500">Loading tickets...</span>
              </div>
            ) : tickets.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Ticket</th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Category</th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Priority</th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Created</th>
                        <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tickets.map(ticket => {
                        const status = statusConfig[ticket.status] || statusConfig.open;
                        const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
                        const StatusIcon = status.icon;
                        return (
                          <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-5 py-3.5">
                              <div>
                                <p className="text-xs text-gray-400 font-mono">{ticket.ticketNumber}</p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5 max-w-[220px] truncate">{ticket.title}</p>
                                {ticket.pageContext && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{ticket.pageContext}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 hidden sm:table-cell">
                              <span className="text-xs text-gray-500">{categoryConfig[ticket.category] || ticket.category}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-full border', priority.className)}>
                                {priority.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="relative">
                                <button
                                  onClick={() => setStatusDropdown(statusDropdown === ticket.id ? null : ticket.id)}
                                  className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer', status.className)}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                {statusDropdown === ticket.id && (
                                  <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                                    {Object.entries(statusConfig).map(([k, v]) => (
                                      <button
                                        key={k}
                                        onClick={() => updateTicket(ticket.id, { status: k } as Partial<SupportTicket>)}
                                        className={cn('w-full text-left px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg', ticket.status === k ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50')}
                                      >
                                        {v.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 hidden md:table-cell">
                              <span className="text-sm text-gray-500">{formatDate(ticket.createdAt)}</span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => openDetail(ticket)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 px-2">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <HelpCircle className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No tickets found</p>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  {search ? 'Try a different search term.' : 'Create your first ticket to get started.'}
                </p>
              </div>
            )}
          </>
        ) : (
          /* ─── Report Tab ─────────────────────────────── */
          <ReportView
            reportByStatus={reportByStatus}
            categoryTotals={categoryTotals}
            priorityTotals={priorityTotals}
            counts={counts}
            total={total}
          />
        )}
      </div>

      {/* ─── New Ticket Modal ─────────────────────────── */}
      <AnimatePresence>
        {newModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setNewModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">New Support Ticket</h2>
                <button onClick={() => setNewModal(false)} className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Brief summary of the issue"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    placeholder="Describe the issue in detail — steps to reproduce, expected vs actual behavior..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors">
                      {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors">
                      {Object.keys(priorityConfig).map(k => <option key={k} value={k}>{priorityConfig[k].label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Page / Context</label>
                  <input
                    type="text"
                    placeholder="e.g. /admin/artworks, checkout page..."
                    value={form.pageContext}
                    onChange={e => setForm(f => ({ ...f, pageContext: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button onClick={() => setNewModal(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={createTicket}
                  disabled={saving || !form.title || !form.description}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Ticket
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Detail / Edit Modal ──────────────────────── */}
      <AnimatePresence>
        {detailModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setDetailModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 sm:inset-auto sm:top-[8%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:max-h-[84vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <p className="text-xs font-mono text-gray-400">{detailModal.ticketNumber}</p>
                  <h2 className="text-base font-semibold text-gray-900 mt-0.5">{detailModal.title}</h2>
                </div>
                <button onClick={() => setDetailModal(null)} className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Meta chips */}
                <div className="flex flex-wrap gap-2">
                  <span className={cn('inline-block text-xs font-medium px-2.5 py-1 rounded-full border', statusConfig[detailModal.status]?.className || '')}>
                    {statusConfig[detailModal.status]?.label || detailModal.status}
                  </span>
                  <span className={cn('inline-block text-xs font-medium px-2.5 py-1 rounded-full border', priorityConfig[detailModal.priority]?.className || '')}>
                    {priorityConfig[detailModal.priority]?.label || detailModal.priority}
                  </span>
                  <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                    {categoryConfig[detailModal.category] || detailModal.category}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detailModal.description}</p>
                  </div>
                </div>

                {detailModal.pageContext && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Page / Context</h3>
                    <p className="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg">{detailModal.pageContext}</p>
                  </div>
                )}

                {/* Edit Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors">
                      {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
                    <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors">
                      {Object.keys(priorityConfig).map(k => <option key={k} value={k}>{priorityConfig[k].label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Resolution Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how this was resolved or what action was taken..."
                    value={editForm.resolution}
                    onChange={e => setEditForm(f => ({ ...f, resolution: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Created {formatDate(detailModal.createdAt)} · Updated {formatDate(detailModal.updatedAt)}
                </p>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => deleteTicket(detailModal.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDetailModal(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Close
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
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

/* ─── Report View ─────────────────────────────────────── */
function ReportView({
  reportByStatus,
  categoryTotals,
  priorityTotals,
  counts,
  total,
}: {
  reportByStatus: { label: string; count: number; className: string }[];
  categoryTotals: Record<string, number>;
  priorityTotals: Record<string, number>;
  counts: Record<string, number>;
  total: number;
}) {
  const resolution = total > 0 ? Math.round(((counts.resolved || 0) + (counts.closed || 0)) / total * 100) : 0;

  return (
    <div className="p-6 space-y-8">
      {/* Print button */}
      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-gray-50 rounded-xl p-5 flex flex-wrap gap-6">
        <div>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Tickets</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-emerald-600">{resolution}%</p>
          <p className="text-sm text-gray-500 mt-0.5">Resolution Rate</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-red-600">{counts.open || 0}</p>
          <p className="text-sm text-gray-500 mt-0.5">Needs Attention</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">By Status</h3>
        <div className="space-y-2.5">
          {reportByStatus.map(row => (
            <div key={row.label} className="flex items-center gap-4">
              <span className="w-24 text-sm text-gray-600 flex-shrink-0">{row.label}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-700"
                  style={{ width: total ? `${(row.count / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="w-8 text-sm font-medium text-gray-700 text-right">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">By Category</h3>
          <div className="space-y-2">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{categoryConfig[k] || k}</span>
                <span className="font-medium text-gray-900">{v}</span>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && <p className="text-sm text-gray-400">No data yet</p>}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">By Priority</h3>
          <div className="space-y-2">
            {(['critical', 'high', 'medium', 'low'] as const).map(k => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-full border', priorityConfig[k].className)}>
                  {priorityConfig[k].label}
                </span>
                <span className="font-medium text-gray-900">{priorityTotals[k] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
