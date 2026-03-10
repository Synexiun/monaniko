'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Star,
  StarOff,
  Pencil,
  Trash2,
  Image,
  X,
  Loader2,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn, slugify } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface CollectionRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  featured: boolean;
  year: number | null;
  artworkCount: number;
  _count?: { artworks: number };
  createdAt: string;
}

interface CollectionFormState {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  year: string;
  featured: boolean;
}

const emptyForm: CollectionFormState = {
  title: '',
  slug: '',
  description: '',
  coverImage: '',
  year: '',
  featured: false,
};

const ITEMS_PER_PAGE = 12;

export default function CollectionsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CollectionFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleting, setDeleting] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search
  useEffect(() => {
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/collections?${params}`);
      if (!res.ok) throw new Error('Failed to load collections');
      const json = await res.json();
      const items = (json.collections || json.data || []).map((c: CollectionRow) => ({
        ...c,
        artworkCount: c._count?.artworks ?? c.artworkCount ?? 0,
      }));
      setCollections(items);
      setTotalCount(json.total || json.totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Toggle featured
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, featured: !currentFeatured } : c))
      );
    } catch {
      // Silently fail
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (collection: CollectionRow) => {
    setEditingId(collection.id);
    setForm({
      title: collection.title,
      slug: collection.slug,
      description: collection.description,
      coverImage: collection.coverImage || '',
      year: collection.year?.toString() || '',
      featured: collection.featured,
    });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const body = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        coverImage: form.coverImage || null,
        year: form.year ? parseInt(form.year) : null,
        featured: form.featured,
      };

      const url = editingId ? `/api/collections/${editingId}` : '/api/collections';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save collection');
      }

      closeModal();
      fetchCollections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save collection');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete collection
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/collections/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteId(null);
      setDeleteTitle('');
      fetchCollections();
    } catch {
      alert('Failed to delete collection');
    } finally {
      setDeleting(false);
    }
  };

  // Escape key handler
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
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize artworks into curated collections ({totalCount} total)
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-700'
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:text-gray-700'
              )}
            >
              Table
            </button>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Collection
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-400 ml-3">Loading collections...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchCollections}
            className="mt-2 text-sm text-gray-600 underline hover:text-gray-800"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                    {collection.coverImage ? (
                      <img
                        src={collection.coverImage}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    {collection.featured && (
                      <div className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-md">
                        <Star className="w-4 h-4 text-[#C4A265] fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {collection.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {collection.year || 'Ongoing'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Image className="w-4 h-4" />
                        <span>
                          {collection.artworkCount} artwork{collection.artworkCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFeatured(collection.id, collection.featured)}
                          className={cn(
                            'p-2 rounded-md transition-colors',
                            collection.featured
                              ? 'text-[#C4A265] hover:bg-amber-50'
                              : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                          )}
                          aria-label={collection.featured ? 'Unfeature' : 'Feature'}
                        >
                          {collection.featured ? (
                            <Star className="w-4 h-4 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(collection)}
                          className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Edit collection"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(collection.id);
                            setDeleteTitle(collection.title);
                          }}
                          className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Collection Card */}
              <button
                onClick={openCreateModal}
                className="bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center min-h-[280px] transition-colors group/add"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover/add:bg-gray-200 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 mt-3">
                  Create New Collection
                </p>
              </button>
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                        Collection
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                        Artworks
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                        Year
                      </th>
                      <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                        Featured
                      </th>
                      <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {collections.map((collection) => (
                      <tr
                        key={collection.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {collection.coverImage ? (
                                <img
                                  src={collection.coverImage}
                                  alt={collection.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {collection.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[250px]">
                                {collection.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Image className="w-4 h-4 text-gray-400" />
                            {collection.artworkCount}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">
                            {collection.year || '--'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => toggleFeatured(collection.id, collection.featured)}
                            className={cn(
                              'p-1 rounded-md transition-colors inline-flex',
                              collection.featured
                                ? 'text-[#C4A265] hover:bg-amber-50'
                                : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                            )}
                          >
                            {collection.featured ? (
                              <Star className="w-4 h-4 fill-current" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(collection)}
                              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="Edit collection"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(collection.id);
                                setDeleteTitle(collection.title);
                              }}
                              className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Delete collection"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {collections.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                          No collections found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev !== undefined && page - prev > 1;
                    return (
                      <span key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                            page === currentPage
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
                  {editingId ? 'Edit Collection' : 'Create Collection'}
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
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title,
                        slug: editingId ? prev.slug : slugify(title),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="Collection title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="collection-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                    placeholder="Describe the collection..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image URL</label>
                  <input
                    type="text"
                    value={form.coverImage}
                    onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="/images/collections/cover.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={form.year}
                      onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                      placeholder="2024"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/10"
                      />
                      Featured
                    </label>
                  </div>
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
                    {editingId ? 'Save Changes' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
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
                  <h3 className="text-base font-semibold text-gray-900">Delete Collection</h3>
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
    </motion.div>
  );
}
