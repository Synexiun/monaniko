'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Search, X, Loader2, AlertTriangle,
  Receipt, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const CATEGORIES = [
  'RENT', 'SUPPLIES', 'MARKETING', 'SOFTWARE', 'SHIPPING',
  'UTILITIES', 'SALARIES', 'INSURANCE', 'EQUIPMENT', 'OTHER',
];

const CATEGORY_COLORS: Record<string, string> = {
  RENT: 'bg-blue-50 text-blue-700 border-blue-200',
  SUPPLIES: 'bg-amber-50 text-amber-700 border-amber-200',
  MARKETING: 'bg-purple-50 text-purple-700 border-purple-200',
  SOFTWARE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPING: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  UTILITIES: 'bg-orange-50 text-orange-700 border-orange-200',
  SALARIES: 'bg-green-50 text-green-700 border-green-200',
  INSURANCE: 'bg-rose-50 text-rose-700 border-rose-200',
  EQUIPMENT: 'bg-teal-50 text-teal-700 border-teal-200',
  OTHER: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface Expense {
  id: string;
  date: string;
  vendor: string;
  category: string;
  description?: string;
  amount: number;
  receiptUrl?: string;
  notes?: string;
}

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  vendor: '',
  category: 'OTHER',
  description: '',
  amount: '',
  receiptUrl: '',
  notes: '',
};

const ITEMS_PER_PAGE = 15;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: page.toString(), limit: ITEMS_PER_PAGE.toString() });
      if (categoryFilter) params.set('category', categoryFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const res = await fetch(`/api/accounting/expenses?${params}`);
      if (!res.ok) throw new Error('Failed to load expenses');
      const json = await res.json();
      const allExpenses: Expense[] = json.expenses ?? [];
      // Client-side search filter
      const filtered = search
        ? allExpenses.filter((e) =>
            e.vendor.toLowerCase().includes(search.toLowerCase()) ||
            (e.description ?? '').toLowerCase().includes(search.toLowerCase())
          )
        : allExpenses;
      setExpenses(filtered);
      setTotal(json.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, fromDate, toDate, search]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchExpenses, search ? 300 : 0);
  }, [fetchExpenses, search]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const openAdd = () => {
    setEditingExpense(null);
    setForm(emptyForm);
    setFormError('');
    setPanelOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setForm({
      date: exp.date.slice(0, 10),
      vendor: exp.vendor,
      category: exp.category,
      description: exp.description ?? '',
      amount: exp.amount.toString(),
      receiptUrl: exp.receiptUrl ?? '',
      notes: exp.notes ?? '',
    });
    setFormError('');
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.vendor.trim() || !form.amount || !form.date) {
      setFormError('Date, vendor, and amount are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const url = editingExpense
        ? `/api/accounting/expenses/${editingExpense.id}`
        : '/api/accounting/expenses';
      const method = editingExpense ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }
      setPanelOpen(false);
      fetchExpenses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/accounting/expenses/${id}`, { method: 'DELETE' });
      fetchExpenses();
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors';
  const labelClass = 'block text-xs font-medium text-gray-700 mb-1.5';

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage business expenses</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendor or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
        />
        {(categoryFilter || fromDate || toDate) && (
          <button
            onClick={() => { setCategoryFilter(''); setFromDate(''); setToDate(''); setPage(1); }}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={fetchExpenses} className="mt-2 text-sm text-gray-500 underline">Retry</button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Receipt className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">No expenses found</p>
            <p className="text-sm text-gray-500 mt-1">Add your first business expense to get started.</p>
            <button onClick={openAdd} className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              Add Expense
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Vendor</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Description</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Category</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Amount</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatDate(exp.date)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{exp.vendor}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 hidden md:table-cell max-w-[200px] truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          'inline-block text-xs font-medium px-2.5 py-1 rounded-full border capitalize',
                          CATEGORY_COLORS[exp.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'
                        )}>
                          {exp.category.toLowerCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">
                        {formatPrice(exp.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(exp)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            disabled={deletingId === exp.id}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === exp.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with total + pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing {expenses.length} expense{expenses.length !== 1 ? 's' : ''} ·{' '}
                <span className="font-semibold text-gray-900">Total: {formatPrice(totalAmount)}</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => !saving && setPanelOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button
                  onClick={() => !saving && setPanelOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Amount *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Vendor *</label>
                  <input
                    type="text"
                    placeholder="Vendor or payee name"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase().replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Receipt URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.receiptUrl}
                    onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    placeholder="Additional notes..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className={inputClass}
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}
              </div>

              {/* Panel Footer */}
              <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => !saving && setPanelOpen(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
