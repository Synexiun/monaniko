'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Loader2,
  Mail,
  Phone,
  User,
  ChevronDown,
  Image,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface Inquiry {
  id: string;
  type: 'artwork' | 'commission' | 'private_viewing' | 'general' | 'press';
  name: string;
  email: string;
  phone?: string;
  message: string;
  artworkId?: string;
  artworkTitle?: string;
  budget?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  createdAt: string;
}

type StatusFilter = 'all' | 'new' | 'contacted' | 'in_progress' | 'closed';

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { label: 'In Progress', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const typeConfig: Record<string, { label: string; className: string }> = {
  artwork: { label: 'Artwork', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  commission: { label: 'Commission', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  private_viewing: { label: 'Private Viewing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  general: { label: 'General', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  press: { label: 'Press', className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const statusWorkflow: Record<string, string> = {
  new: 'contacted',
  contacted: 'in_progress',
  in_progress: 'closed',
};

const ITEMS_PER_PAGE = 20;

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusCounts, setStatusCounts] = useState({ all: 0, new: 0, contacted: 0, in_progress: 0, closed: 0 });
  const [detailModal, setDetailModal] = useState<Inquiry | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const res = await fetch(`/api/inquiries?${params}`);
      const json = await res.json();
      setInquiries(json.data || []);
      setTotal(json.pagination?.total || 0);
      if (json.counts) {
        setStatusCounts(json.counts);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus as Inquiry['status'] } : inq))
      );
      setStatusDropdown(null);
      if (detailModal?.id === id) {
        setDetailModal((prev) => prev ? { ...prev, status: newStatus as Inquiry['status'] } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const advanceStatus = (inquiry: Inquiry) => {
    const nextStatus = statusWorkflow[inquiry.status];
    if (nextStatus) {
      updateStatus(inquiry.id, nextStatus);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const tabs: { value: StatusFilter; label: string; count: number; dot?: boolean }[] = [
    { value: 'all', label: 'All', count: statusCounts.all || total },
    { value: 'new', label: 'New', count: statusCounts.new, dot: statusCounts.new > 0 },
    { value: 'contacted', label: 'Contacted', count: statusCounts.contacted },
    { value: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
    { value: 'closed', label: 'Closed', count: statusCounts.closed },
  ];

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage customer inquiries and lead pipeline ({total} total)
        </p>
      </div>

      {/* Data Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-0 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={cn(
                'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === tab.value
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <span className="flex items-center gap-2">
                {tab.dot && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
                {tab.label}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    statusFilter === tab.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {tab.count}
                </span>
              </span>
              {statusFilter === tab.value && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search + Type Filter */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors min-w-[160px]"
          >
            <option value="all">All Types</option>
            <option value="artwork">Artwork</option>
            <option value="commission">Commission</option>
            <option value="private_viewing">Private Viewing</option>
            <option value="general">General</option>
            <option value="press">Press</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading inquiries...</span>
          </div>
        ) : inquiries.length > 0 ? (
          <>
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Contact
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Type
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Artwork
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inquiries.map((inquiry) => {
                    const status = statusConfig[inquiry.status] || statusConfig.new;
                    const type = typeConfig[inquiry.type] || typeConfig.general;
                    const nextStatus = statusWorkflow[inquiry.status];
                    return (
                      <tr
                        key={inquiry.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        {/* Contact */}
                        <td className="px-5 py-3.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {inquiry.status === 'new' && (
                                <Circle className="w-2 h-2 fill-blue-500 text-blue-500 flex-shrink-0" />
                              )}
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                                {inquiry.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                              {inquiry.email}
                            </p>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span
                            className={cn(
                              'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                              type.className
                            )}
                          >
                            {type.label}
                          </span>
                        </td>

                        {/* Artwork */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          {inquiry.artworkTitle ? (
                            <div className="flex items-center gap-1.5">
                              <Image className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-600 truncate max-w-[140px]">
                                {inquiry.artworkTitle}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        {/* Status with quick change */}
                        <td className="px-5 py-3.5">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setStatusDropdown(statusDropdown === inquiry.id ? null : inquiry.id)
                              }
                              className={cn(
                                'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer',
                                status.className
                              )}
                            >
                              {status.label}
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {statusDropdown === inquiry.id && (
                              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                                {(['new', 'contacted', 'in_progress', 'closed'] as const).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(inquiry.id, s)}
                                    className={cn(
                                      'w-full text-left px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg',
                                      inquiry.status === s
                                        ? 'bg-gray-50 font-medium text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    )}
                                  >
                                    {statusConfig[s].label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-sm text-gray-500">
                            {formatDate(inquiry.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {nextStatus && (
                              <button
                                onClick={() => advanceStatus(inquiry)}
                                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors hidden sm:inline-flex"
                              >
                                Mark {statusConfig[nextStatus]?.label}
                              </button>
                            )}
                            <button
                              onClick={() => setDetailModal(inquiry)}
                              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="View details"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
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
                Showing{' '}
                <span className="font-medium text-gray-700">{(page - 1) * ITEMS_PER_PAGE + 1}</span>{' '}
                to{' '}
                <span className="font-medium text-gray-700">{Math.min(page * ITEMS_PER_PAGE, total)}</span>{' '}
                of <span className="font-medium text-gray-700">{total}</span> results
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                        pageNum === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No inquiries found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {search
                ? 'Try adjusting your search or filter.'
                : 'Inquiries will appear here when customers reach out.'}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setDetailModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Inquiry Details</h2>
                <button
                  onClick={() => setDetailModal(null)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{detailModal.name}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(detailModal.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                        typeConfig[detailModal.type]?.className || typeConfig.general.className
                      )}
                    >
                      {typeConfig[detailModal.type]?.label || detailModal.type}
                    </span>
                    <span
                      className={cn(
                        'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                        statusConfig[detailModal.status]?.className || statusConfig.new.className
                      )}
                    >
                      {statusConfig[detailModal.status]?.label || detailModal.status}
                    </span>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${detailModal.email}`} className="text-sm text-blue-600 hover:underline">
                      {detailModal.email}
                    </a>
                  </div>
                  {detailModal.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${detailModal.phone}`} className="text-sm text-blue-600 hover:underline">
                        {detailModal.phone}
                      </a>
                    </div>
                  )}
                  {detailModal.artworkTitle && (
                    <div className="flex items-center gap-2.5">
                      <Image className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{detailModal.artworkTitle}</span>
                    </div>
                  )}
                  {detailModal.budget && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-medium text-gray-400 w-4 text-center">$</span>
                      <span className="text-sm text-gray-700">Budget: {detailModal.budget}</span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Message</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {detailModal.message}
                    </p>
                  </div>
                </div>

                {/* Status Workflow */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['new', 'contacted', 'in_progress', 'closed'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(detailModal.id, s)}
                        className={cn(
                          'px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors',
                          detailModal.status === s
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setDetailModal(null)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${detailModal.email}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
