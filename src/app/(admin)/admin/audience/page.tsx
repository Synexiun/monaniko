'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AudienceSegment } from '@/types';

type SegmentFilter = AudienceSegment | 'all';

const segmentFilters: { label: string; value: SegmentFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Collectors', value: 'collector' },
  { label: 'Print Buyers', value: 'print_buyer' },
  { label: 'Workshop Attendees', value: 'workshop_attendee' },
  { label: 'Commission Leads', value: 'commission_lead' },
  { label: 'Press', value: 'press' },
  { label: 'Newsletter', value: 'newsletter' },
  { label: 'VIP', value: 'vip' },
];

const segmentBadge: Record<AudienceSegment, { bg: string; label: string }> = {
  collector: { bg: 'bg-purple-50 text-purple-700', label: 'Collector' },
  print_buyer: { bg: 'bg-blue-50 text-blue-700', label: 'Print Buyer' },
  workshop_attendee: { bg: 'bg-green-50 text-green-700', label: 'Workshop' },
  commission_lead: { bg: 'bg-orange-50 text-orange-700', label: 'Commission' },
  press: { bg: 'bg-pink-50 text-pink-700', label: 'Press' },
  newsletter: { bg: 'bg-gray-100 text-gray-600', label: 'Newsletter' },
  vip: { bg: 'bg-amber-50 text-amber-700', label: 'VIP' },
};

const segmentOptions: { value: AudienceSegment; label: string }[] = [
  { value: 'collector', label: 'Collector' },
  { value: 'print_buyer', label: 'Print Buyer' },
  { value: 'workshop_attendee', label: 'Workshop Attendee' },
  { value: 'commission_lead', label: 'Commission Lead' },
  { value: 'press', label: 'Press' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'vip', label: 'VIP' },
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ContactRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  segments: AudienceSegment[];
  source: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  lastActivity: string | null;
  totalSpent: number;
}

interface AudienceStats {
  total: number;
  active: number;
  segmentCounts: Record<string, number>;
}

interface ContactFormState {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  segments: AudienceSegment[];
  source: string;
  notes: string;
  isActive: boolean;
}

const emptyForm: ContactFormState = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  segments: [],
  source: '',
  notes: '',
  isActive: true,
};

const ITEMS_PER_PAGE = 20;

export default function AudiencePage() {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [stats, setStats] = useState<AudienceStats>({ total: 0, active: 0, segmentCounts: {} });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContactFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [exporting, setExporting] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search
  useEffect(() => {
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (segmentFilter !== 'all') params.set('segment', segmentFilter);

      const res = await fetch(`/api/subscribers?${params}`);
      if (!res.ok) throw new Error('Failed to load subscribers');
      const json = await res.json();
      setContacts(json.subscribers || json.data || []);
      setTotalCount(json.total || json.totalCount || 0);
      if (json.stats) {
        setStats(json.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, segmentFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Export CSV
  const exportCSV = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/subscribers?export=csv');
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export subscribers');
    } finally {
      setExporting(false);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (contact: ContactRow) => {
    setEditingId(contact.id);
    setForm({
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      segments: contact.segments,
      source: contact.source,
      notes: contact.notes || '',
      isActive: contact.isActive,
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
        email: form.email,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        phone: form.phone || null,
        segments: form.segments,
        source: form.source || 'admin',
        notes: form.notes || null,
        isActive: form.isActive,
      };

      const url = editingId ? `/api/subscribers/${editingId}` : '/api/subscribers';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save contact');
      }

      closeModal();
      fetchContacts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save contact');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete contact
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/subscribers/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteId(null);
      setDeleteName('');
      fetchContacts();
    } catch {
      alert('Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle segment in form
  const toggleSegment = (seg: AudienceSegment) => {
    setForm((prev) => ({
      ...prev,
      segments: prev.segments.includes(seg)
        ? prev.segments.filter((s) => s !== seg)
        : [...prev.segments, seg],
    }));
  };

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteId) {
          setDeleteId(null);
          setDeleteName('');
        } else if (modalOpen) {
          closeModal();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen, deleteId]);

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors';

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Audience</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage contacts, segments, and relationships.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export CSV
            </button>
            <button
              onClick={openCreateModal}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              + Add Contact
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Contacts', value: stats.total.toString() },
            { label: 'Active', value: stats.active.toString() },
            { label: 'VIP Collectors', value: (stats.segmentCounts?.vip || 0).toString() },
            { label: 'Newsletter', value: (stats.segmentCounts?.newsletter || 0).toString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Segment Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {segmentFilters.map((seg) => (
            <button
              key={seg.value}
              onClick={() => {
                setSegmentFilter(seg.value);
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                segmentFilter === seg.value
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {seg.label}
              {seg.value !== 'all' && stats.segmentCounts?.[seg.value] !== undefined && (
                <span className="ml-1 text-xs opacity-70">
                  ({stats.segmentCounts[seg.value]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {/* Contacts Table */}
        {loading ? (
          <div className="mt-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-400 ml-3">Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="mt-8 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchContacts}
              className="mt-2 text-sm text-gray-600 underline hover:text-gray-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Name
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Segments
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Source
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Last Activity
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                        Total Spent
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                              {(contact.firstName?.[0] || '')}{(contact.lastName?.[0] || '')}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {contact.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {contact.phone || '\u2014'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {contact.segments.map((seg) => (
                              <span
                                key={seg}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${segmentBadge[seg]?.bg || 'bg-gray-100 text-gray-600'}`}
                              >
                                {segmentBadge[seg]?.label || seg}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {contact.source}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(contact.lastActivity || undefined)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {contact.totalSpent > 0
                            ? formatCurrency(contact.totalSpent)
                            : '\u2014'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(contact)}
                              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(contact.id);
                                setDeleteName(
                                  `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
                                    contact.email
                                );
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
              </div>

              {contacts.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">
                  No contacts found.
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {contacts.length} of {totalCount} contacts
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
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
                  {editingId ? 'Edit Contact' : 'Add Contact'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className={inputClass}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      className={inputClass}
                      placeholder="First"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      className={inputClass}
                      placeholder="Last"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className={inputClass}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
                    <input
                      type="text"
                      value={form.source}
                      onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g., Website, Gallery Visit"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className={cn(inputClass, 'resize-none')}
                    placeholder="Internal notes about this contact..."
                  />
                </div>

                {/* Segments multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Segments</label>
                  <div className="flex flex-wrap gap-2">
                    {segmentOptions.map((seg) => (
                      <button
                        key={seg.value}
                        type="button"
                        onClick={() => toggleSegment(seg.value)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                          form.segments.includes(seg.value)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/10"
                  />
                  Active subscriber
                </label>

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
                    {editingId ? 'Save Changes' : 'Add Contact'}
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
              onClick={() => { setDeleteId(null); setDeleteName(''); }}
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
                  <h3 className="text-base font-semibold text-gray-900">Delete Contact</h3>
                  <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">&ldquo;{deleteName}&rdquo;</span>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setDeleteId(null); setDeleteName(''); }}
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
