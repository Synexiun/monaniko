'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  Loader2,
  Zap,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt?: string;
}

const ITEMS_PER_PAGE = 20;

const emptyFormData = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE' as PromoCode['discountType'],
  discountValue: 10,
  minPurchase: 0,
  maxUses: 0,
  validFrom: '',
  validUntil: '',
  isActive: true,
};

function generatePromoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MONA${suffix}`;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set('search', search);
      if (activeOnly) params.set('active', 'true');
      const res = await fetch(`/api/promo-codes?${params}`);
      const json = await res.json();
      setPromoCodes(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch promo codes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeOnly]);

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

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyFormData);
    setModalOpen(true);
  };

  const openEdit = (promo: PromoCode) => {
    setEditing(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minPurchase: promo.minPurchase || 0,
      maxUses: promo.maxUses || 0,
      validFrom: promo.validFrom ? promo.validFrom.split('T')[0] : '',
      validUntil: promo.validUntil ? promo.validUntil.split('T')[0] : '',
      isActive: promo.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormData(emptyFormData);
  };

  const handleAutoGenerate = () => {
    setFormData({ ...formData, code: generatePromoCode() });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minPurchase: formData.minPurchase || undefined,
        maxUses: formData.maxUses || undefined,
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
        isActive: formData.isActive,
      };
      const url = editing ? `/api/promo-codes/${editing.id}` : '/api/promo-codes';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save promo code:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/promo-codes/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete promo code:', err);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    try {
      await fetch(`/api/promo-codes/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      setPromoCodes((prev) =>
        prev.map((p) =>
          p.id === promo.id ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle active:', err);
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

  const formatDiscount = (promo: PromoCode) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `${promo.discountValue}%`;
    }
    return formatPrice(promo.discountValue);
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage discount codes and promotions ({total} total)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Promo Code
        </button>
      </div>

      {/* Data Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Search + Active Filter */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or description..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
          <button
            onClick={() => {
              setActiveOnly(!activeOnly);
              setPage(1);
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
              activeOnly
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            )}
          >
            {activeOnly ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            Active Only
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading promo codes...</span>
          </div>
        ) : promoCodes.length > 0 ? (
          <>
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Code
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Type
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Value
                    </th>
                    <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Usage
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Valid Period
                    </th>
                    <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Active
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {promoCodes.map((promo) => {
                    const usagePercent = promo.maxUses
                      ? Math.min(100, (promo.usedCount / promo.maxUses) * 100)
                      : 0;
                    return (
                      <tr
                        key={promo.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        {/* Code */}
                        <td className="px-5 py-3.5">
                          <code className="px-2.5 py-1 bg-gray-100 rounded text-sm font-mono font-medium text-gray-900">
                            {promo.code}
                          </code>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600 truncate block max-w-[200px]">
                            {promo.description || '-'}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span
                            className={cn(
                              'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                              promo.discountType === 'PERCENTAGE'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            )}
                          >
                            {promo.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}
                          </span>
                        </td>

                        {/* Value */}
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDiscount(promo)}
                          </span>
                        </td>

                        {/* Usage */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {promo.usedCount}/{promo.maxUses || 'Unlimited'}
                            </span>
                            {promo.maxUses ? (
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all',
                                    usagePercent >= 90
                                      ? 'bg-red-500'
                                      : usagePercent >= 60
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  )}
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {/* Valid Period */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {promo.validFrom
                                ? `${formatDate(promo.validFrom)} - ${formatDate(promo.validUntil || '')}`
                                : 'No expiration'}
                            </span>
                          </div>
                        </td>

                        {/* Active Toggle */}
                        <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                          <button
                            onClick={() => toggleActive(promo)}
                            className={cn(
                              'relative w-10 h-6 rounded-full transition-colors',
                              promo.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                            )}
                          >
                            <span
                              className={cn(
                                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                                promo.isActive ? 'left-[18px]' : 'left-0.5'
                              )}
                            />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(promo)}
                              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(promo.id)}
                              className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <Tag className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No promo codes found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {search
                ? 'Try adjusting your search.'
                : 'Create your first promo code to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={closeModal}
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
                <h2 className="text-lg font-semibold text-gray-900">
                  {editing ? 'Edit Promo Code' : 'New Promo Code'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Code + Auto-generate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="MONASPRING25"
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAutoGenerate}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Spring sale 25% off"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Discount Type + Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as PromoCode['discountType'] })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      min={0}
                      max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Min Purchase + Max Uses */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Purchase ($)</label>
                    <input
                      type="number"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                      min={0}
                      placeholder="0 = no minimum"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Uses</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                      min={0}
                      placeholder="0 = unlimited"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Valid From + Valid Until */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid From</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors',
                      formData.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        formData.isActive ? 'left-[18px]' : 'left-0.5'
                      )}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.code.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-2xl z-50 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Delete Promo Code</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this promo code? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
