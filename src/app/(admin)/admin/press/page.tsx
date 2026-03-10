'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
  X,
  Newspaper,
  Loader2,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface PressItem {
  id: string;
  title: string;
  publication: string;
  date: string;
  url?: string;
  excerpt: string;
  image?: string;
  featured: boolean;
  createdAt?: string;
}

const ITEMS_PER_PAGE = 20;

const emptyFormData = {
  title: '',
  publication: '',
  date: '',
  url: '',
  excerpt: '',
  image: '',
  featured: false,
};

export default function PressPage() {
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PressItem | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set('search', search);
      if (featuredOnly) params.set('featured', 'true');
      const res = await fetch(`/api/press?${params}`);
      const json = await res.json();
      setPressItems(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch press items:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, featuredOnly]);

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

  const openEdit = (item: PressItem) => {
    setEditing(item);
    setFormData({
      title: item.title,
      publication: item.publication,
      date: item.date ? item.date.split('T')[0] : '',
      url: item.url || '',
      excerpt: item.excerpt,
      image: item.image || '',
      featured: item.featured,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormData(emptyFormData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        title: formData.title,
        publication: formData.publication,
        date: formData.date,
        url: formData.url || undefined,
        excerpt: formData.excerpt,
        image: formData.image || undefined,
        featured: formData.featured,
      };
      const url = editing ? `/api/press/${editing.id}` : '/api/press';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save press item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/press/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete press item:', err);
    }
  };

  const toggleFeatured = async (item: PressItem) => {
    try {
      await fetch(`/api/press/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured }),
      });
      setPressItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, featured: !p.featured } : p))
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
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

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Press</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage press coverage and media mentions ({total} total)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Press Item
        </button>
      </div>

      {/* Data Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Search + Featured Filter */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search press by title or publication..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
          <button
            onClick={() => {
              setFeaturedOnly(!featuredOnly);
              setPage(1);
            }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
              featuredOnly
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            )}
          >
            <Star className={cn('w-4 h-4', featuredOnly ? 'fill-amber-400 text-amber-400' : '')} />
            Featured Only
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading press items...</span>
          </div>
        ) : pressItems.length > 0 ? (
          <>
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Title
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Publication
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Featured
                    </th>
                    <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Link
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pressItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Title */}
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[250px]">
                            {item.excerpt}
                          </p>
                        </div>
                      </td>

                      {/* Publication */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-gray-600 font-medium">
                          {item.publication}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {formatDate(item.date)}
                          </span>
                        </div>
                      </td>

                      {/* Featured */}
                      <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                        <button
                          onClick={() => toggleFeatured(item)}
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            item.featured
                              ? 'text-[#C4A265] hover:bg-amber-50'
                              : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                          )}
                        >
                          {item.featured ? (
                            <Star className="w-4 h-4 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* External URL */}
                      <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            aria-label="Open external URL"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              <Newspaper className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No press items found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {search
                ? 'Try adjusting your search.'
                : 'Add your first press mention to get started.'}
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
                  {editing ? 'Edit Press Item' : 'New Press Item'}
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
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Article or feature title"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Publication + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Publication</label>
                    <input
                      type="text"
                      value={formData.publication}
                      onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                      placeholder="Vogue, Art News..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">External URL (optional)</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={4}
                    placeholder="Brief excerpt or summary of the coverage..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL (optional)</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Featured */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors',
                      formData.featured ? 'bg-[#C4A265]' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        formData.featured ? 'left-[18px]' : 'left-0.5'
                      )}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Featured press item</span>
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
                  disabled={saving || !formData.title.trim() || !formData.publication.trim()}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Press Item</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this press item? This action cannot be undone.
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
