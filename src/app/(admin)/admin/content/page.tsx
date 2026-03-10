'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CampaignChannel } from '@/types';

type ContentType = 'journal_post' | 'campaign_post' | 'email_blast' | 'social_post';
type ContentStatus = 'scheduled' | 'published' | 'failed' | 'cancelled';
type ViewMode = 'calendar' | 'list';

const typeColor: Record<ContentType, { dot: string; badge: string; label: string }> = {
  journal_post: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700',
    label: 'Journal',
  },
  campaign_post: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
    label: 'Campaign',
  },
  email_blast: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700',
    label: 'Email',
  },
  social_post: {
    dot: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-700',
    label: 'Social',
  },
};

const statusBadge: Record<ContentStatus, string> = {
  scheduled: 'bg-blue-50 text-blue-700',
  published: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const typeOptions: { value: ContentType; label: string }[] = [
  { value: 'journal_post', label: 'Journal Post' },
  { value: 'campaign_post', label: 'Campaign Post' },
  { value: 'email_blast', label: 'Email Blast' },
  { value: 'social_post', label: 'Social Post' },
];

const channelOptions: { value: CampaignChannel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'x', label: 'X' },
  { value: 'blog', label: 'Blog' },
];

const statusOptions: { value: ContentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  scheduledAt: string;
  status: ContentStatus;
  channel: CampaignChannel | null;
  contentRef: string | null;
  createdAt: string;
}

interface ContentFormState {
  title: string;
  type: ContentType;
  scheduledAt: string;
  channel: string;
  contentRef: string;
  status: ContentStatus;
}

const emptyForm: ContentFormState = {
  title: '',
  type: 'journal_post',
  scheduledAt: '',
  channel: '',
  contentRef: '',
  status: 'scheduled',
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('calendar');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContentFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleting, setDeleting] = useState(false);

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);

  // Fetch content
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        month: (currentMonth.month + 1).toString(),
        year: currentMonth.year.toString(),
      });
      const res = await fetch(`/api/content-schedule?${params}`);
      if (!res.ok) throw new Error('Failed to load content schedule');
      const json = await res.json();
      setItems(json.items || json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Group content by day for calendar
  const contentByDay = useMemo(() => {
    const map: Record<number, ContentItem[]> = {};
    items.forEach((item) => {
      const d = new Date(item.scheduledAt);
      if (
        d.getFullYear() === currentMonth.year &&
        d.getMonth() === currentMonth.month
      ) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(item);
      }
    });
    return map;
  }, [items, currentMonth]);

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  }

  // Calendar grid cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === currentMonth.year &&
    today.getMonth() === currentMonth.month &&
    today.getDate() === day;

  // Open create modal
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (item: ContentItem) => {
    setEditingId(item.id);
    const dt = new Date(item.scheduledAt);
    const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm({
      title: item.title,
      type: item.type,
      scheduledAt: localIso,
      channel: item.channel || '',
      contentRef: item.contentRef || '',
      status: item.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const body = {
        title: form.title,
        type: form.type,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
        channel: form.channel || null,
        contentRef: form.contentRef || null,
        status: form.status,
      };

      const url = editingId ? `/api/content-schedule/${editingId}` : '/api/content-schedule';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save content');
      }

      closeModal();
      fetchContent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete/Cancel
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/content-schedule/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteId(null);
      setDeleteTitle('');
      fetchContent();
    } catch {
      alert('Failed to delete content');
    } finally {
      setDeleting(false);
    }
  };

  const cancelContent = async (id: string) => {
    try {
      const res = await fetch(`/api/content-schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel');
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'cancelled' as ContentStatus } : item))
      );
    } catch {
      alert('Failed to cancel content');
    }
  };

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteId) {
          setDeleteId(null);
          setDeleteTitle('');
        } else if (modalOpen) {
          closeModal();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen, deleteId]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Content Scheduler
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Plan and schedule content across all channels.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            + Schedule Content
          </button>
        </div>

        {/* View Toggle & Month Nav */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Previous month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </span>
            <button
              onClick={nextMonth}
              className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Next month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-black text-white rounded-l-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'list'
                  ? 'bg-black text-white rounded-r-lg'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          {(Object.entries(typeColor) as [ContentType, typeof typeColor[ContentType]][]).map(
            ([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                <span className="text-xs text-gray-500">{val.label}</span>
              </div>
            )
          )}
        </div>

        {loading ? (
          <div className="mt-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-400 ml-3">Loading content...</p>
          </div>
        ) : error ? (
          <div className="mt-12 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchContent}
              className="mt-2 text-sm text-gray-600 underline hover:text-gray-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Calendar View */}
            {view === 'calendar' && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="px-2 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calendarCells.map((day, i) => (
                    <div
                      key={i}
                      className={`min-h-[90px] border-b border-r border-gray-50 p-1.5 ${
                        day === null ? 'bg-gray-50/50' : ''
                      } ${isToday(day ?? 0) ? 'bg-blue-50/40' : ''}`}
                    >
                      {day !== null && (
                        <>
                          <span
                            className={`inline-block text-xs font-medium mb-1 ${
                              isToday(day)
                                ? 'bg-black text-white rounded-full w-5 h-5 flex items-center justify-center'
                                : 'text-gray-600'
                            }`}
                          >
                            {day}
                          </span>
                          <div className="space-y-0.5">
                            {(contentByDay[day] || []).map((item) => (
                              <div
                                key={item.id}
                                onClick={() => openEditModal(item)}
                                className={`rounded px-1 py-0.5 text-[10px] leading-tight truncate cursor-pointer ${
                                  typeColor[item.type].badge
                                }`}
                                title={item.title}
                              >
                                {item.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List View */}
            {view === 'list' && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Title
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Channel
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Scheduled
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...items]
                      .sort(
                        (a, b) =>
                          new Date(a.scheduledAt).getTime() -
                          new Date(b.scheduledAt).getTime()
                      )
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">
                              {item.title}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                typeColor[item.type].badge
                              }`}
                            >
                              {typeColor[item.type].label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                            {item.channel || '\u2014'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {formatDate(item.scheduledAt)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatTime(item.scheduledAt)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                statusBadge[item.status]
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                Edit
                              </button>
                              {item.status === 'scheduled' && (
                                <button
                                  onClick={() => cancelContent(item.id)}
                                  className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setDeleteId(item.id);
                                  setDeleteTitle(item.title);
                                }}
                                className="text-xs text-red-500 hover:text-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {items.length === 0 && (
                  <div className="py-12 text-center text-sm text-gray-400">
                    No content scheduled for this month.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-lg z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Content' : 'Schedule Content'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="Content title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
                    <select
                      required
                      value={form.type}
                      onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as ContentType }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      {typeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel</label>
                    <select
                      value={form.channel}
                      onChange={(e) => setForm((prev) => ({ ...prev, channel: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      <option value="">No channel</option>
                      {channelOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheduled At *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content Reference</label>
                  <input
                    type="text"
                    value={form.contentRef}
                    onChange={(e) => setForm((prev) => ({ ...prev, contentRef: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="e.g., journal post slug or campaign ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ContentStatus }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Save Changes' : 'Schedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => { setDeleteId(null); setDeleteTitle(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Delete Content</h3>
                  <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">&ldquo;{deleteTitle}&rdquo;</span>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setDeleteId(null); setDeleteTitle(''); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
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
