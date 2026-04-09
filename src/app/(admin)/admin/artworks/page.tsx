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
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { cn, formatPrice, slugify } from '@/lib/utils';
import type { ArtworkStatus, ArtworkCategory, ArtworkMedium } from '@/types';
import FileUpload from '@/components/admin/FileUpload';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const statusConfig: Record<ArtworkStatus, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  sold: {
    label: 'Sold',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  on_exhibition: {
    label: 'On Exhibition',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  commissioned: {
    label: 'Commissioned',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

const statusFilterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'on_exhibition', label: 'On Exhibition' },
  { value: 'commissioned', label: 'Commissioned' },
];

const categoryOptions: { value: ArtworkCategory; label: string }[] = [
  { value: 'painting', label: 'Painting' },
  { value: 'celebrity', label: 'Celebrity' },
];

const mediumOptions: { value: ArtworkMedium; label: string }[] = [
  { value: 'oil', label: 'Oil' },
  { value: 'acrylic', label: 'Acrylic' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'mixed_media', label: 'Mixed Media' },
  { value: 'ink', label: 'Ink' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'digital', label: 'Digital' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'ceramic', label: 'Ceramic' },
];

const ITEMS_PER_PAGE = 10;

interface ArtworkRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ArtworkCategory;
  medium: ArtworkMedium;
  dimensions: { width: number; height: number; unit: 'in' | 'cm'; depth?: number };
  year: number;
  status: ArtworkStatus;
  price: number | null;
  priceOnInquiry: boolean;
  collectionId: string | null;
  tags: string[];
  featured: boolean;
  framing: string | null;
  certificate: boolean;
  images: string[];
}

interface CollectionOption {
  id: string;
  title: string;
}

interface ArtworkFormState {
  title: string;
  slug: string;
  description: string;
  images: string[];
  category: ArtworkCategory;
  medium: ArtworkMedium;
  dimensionWidth: number;
  dimensionHeight: number;
  dimensionUnit: 'in' | 'cm';
  year: number;
  status: ArtworkStatus;
  price: string;
  priceOnInquiry: boolean;
  collectionId: string;
  tags: string;
  featured: boolean;
  framing: string;
  certificate: boolean;
}

const emptyForm: ArtworkFormState = {
  title: '',
  slug: '',
  description: '',
  images: [],
  category: 'painting',
  medium: 'oil',
  dimensionWidth: 0,
  dimensionHeight: 0,
  dimensionUnit: 'in',
  year: new Date().getFullYear(),
  status: 'available',
  price: '',
  priceOnInquiry: false,
  collectionId: '',
  tags: '',
  featured: false,
  framing: '',
  certificate: true,
};

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<ArtworkRow[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArtworkFormState>(emptyForm);
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

  // Fetch artworks
  const fetchArtworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);

      const res = await fetch(`/api/artworks?${params}`);
      if (!res.ok) throw new Error('Failed to load artworks');
      const json = await res.json();
      setArtworks(json.artworks || json.data || []);
      setTotalCount(json.pagination?.total || json.total || json.totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, categoryFilter]);

  // Fetch collections for dropdown
  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections?limit=100');
      if (res.ok) {
        const json = await res.json();
        setCollections((json.collections || json.data || []).map((c: { id: string; title: string }) => ({
          id: c.id,
          title: c.title,
        })));
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const formatMedium = (medium: string) =>
    medium
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const formatCategory = (category: string) =>
    category
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  // Toggle featured
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setArtworks((prev) =>
        prev.map((a) => (a.id === id ? { ...a, featured: !currentFeatured } : a))
      );
    } catch {
      // Revert optimistic update not needed since we update after success
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (artwork: ArtworkRow) => {
    setEditingId(artwork.id);
    setForm({
      title: artwork.title,
      slug: artwork.slug,
      description: artwork.description,
      images: artwork.images || [],
      category: artwork.category,
      medium: artwork.medium,
      dimensionWidth: artwork.dimensions?.width ?? 0,
      dimensionHeight: artwork.dimensions?.height ?? 0,
      dimensionUnit: artwork.dimensions?.unit ?? 'in',
      year: artwork.year,
      status: artwork.status,
      price: artwork.price != null ? artwork.price.toString() : '',
      priceOnInquiry: artwork.priceOnInquiry,
      collectionId: artwork.collectionId || '',
      tags: artwork.tags.join(', '),
      featured: artwork.featured,
      framing: artwork.framing || '',
      certificate: Boolean(artwork.certificate),
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
        images: form.images,
        category: form.category,
        medium: form.medium,
        dimensions: {
          width: form.dimensionWidth,
          height: form.dimensionHeight,
          unit: form.dimensionUnit,
        },
        year: form.year,
        status: form.status,
        price: form.priceOnInquiry ? null : (form.price ? parseFloat(form.price) : null),
        priceOnInquiry: form.priceOnInquiry,
        collectionId: form.collectionId || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: form.featured,
        framing: form.framing || null,
        certificate: form.certificate,
      };

      const url = editingId ? `/api/artworks/${editingId}` : '/api/artworks';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save artwork');
      }

      closeModal();
      fetchArtworks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save artwork');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete artwork
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/artworks/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteId(null);
      setDeleteTitle('');
      fetchArtworks();
    } catch {
      alert('Failed to delete artwork');
    } finally {
      setDeleting(false);
    }
  };

  // Handle escape key for modals
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
          <h1 className="text-2xl font-bold text-gray-900">Artworks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your artwork catalog ({totalCount} total)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Artwork
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search artworks by title, category, medium, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors min-w-[160px]"
          >
            {statusFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors min-w-[160px]"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
            <p className="text-sm text-gray-400 mt-2">Loading artworks...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchArtworks}
              className="mt-2 text-sm text-gray-600 underline hover:text-gray-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Artwork
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                    Medium
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Price
                  </th>
                  <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                    Featured
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {artworks.map((artwork) => {
                  const statusKey = (artwork.status || '').toLowerCase() as ArtworkStatus;
                  const status = statusConfig[statusKey] ?? { label: artwork.status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
                  return (
                    <tr
                      key={artwork.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {artwork.images && artwork.images[0] ? (
                              <img
                                src={artwork.images[0]}
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {artwork.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {artwork.year}
                              {artwork.dimensions && (
                                <> &middot; {artwork.dimensions.width}&times;{artwork.dimensions.height}{' '}{artwork.dimensions.unit}</>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-gray-600">
                          {formatCategory(artwork.category)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {formatMedium(artwork.medium)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {artwork.priceOnInquiry
                            ? 'On Inquiry'
                            : artwork.price
                            ? formatPrice(artwork.price)
                            : 'On Inquiry'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                        <button
                          onClick={() => toggleFeatured(artwork.id, artwork.featured)}
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            artwork.featured
                              ? 'text-[#C4A265] hover:bg-amber-50'
                              : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                          )}
                          aria-label={
                            artwork.featured
                              ? 'Remove from featured'
                              : 'Add to featured'
                          }
                        >
                          {artwork.featured ? (
                            <Star className="w-4 h-4 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(artwork)}
                            className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            aria-label="Edit artwork"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(artwork.id);
                              setDeleteTitle(artwork.title);
                            }}
                            className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Delete artwork"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {artworks.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-gray-400"
                    >
                      No artworks found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-700">
                {totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium text-gray-700">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-700">{totalCount}</span>{' '}
              results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
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
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl z-10 my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Artwork' : 'Add New Artwork'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title *
                  </label>
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
                    placeholder="Artwork title"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="artwork-slug"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                    placeholder="Describe the artwork..."
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Images
                  </label>
                  <FileUpload
                    value={form.images}
                    onChange={(urls) => setForm((prev) => ({ ...prev, images: urls }))}
                    maxFiles={6}
                    folder="mona-niko-gallery/artworks"
                  />
                </div>

                {/* Category & Medium */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category *
                    </label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as ArtworkCategory }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Medium *
                    </label>
                    <select
                      required
                      value={form.medium}
                      onChange={(e) => setForm((prev) => ({ ...prev, medium: e.target.value as ArtworkMedium }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      {mediumOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Dimensions
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={form.dimensionWidth || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, dimensionWidth: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                        placeholder="Width"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={form.dimensionHeight || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, dimensionHeight: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                        placeholder="Height"
                      />
                    </div>
                    <div>
                      <select
                        value={form.dimensionUnit}
                        onChange={(e) => setForm((prev) => ({ ...prev, dimensionUnit: e.target.value as 'in' | 'cm' }))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                      >
                        <option value="in">inches</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Year & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Year
                    </label>
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={form.year}
                      onChange={(e) => setForm((prev) => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status *
                    </label>
                    <select
                      required
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ArtworkStatus }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="on_exhibition">On Exhibition</option>
                      <option value="commissioned">Commissioned</option>
                    </select>
                  </div>
                </div>

                {/* Price & Price on Inquiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      disabled={form.priceOnInquiry}
                      className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                      placeholder="0.00"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={form.priceOnInquiry}
                        onChange={(e) => setForm((prev) => ({ ...prev, priceOnInquiry: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/10"
                      />
                      Price on inquiry
                    </label>
                  </div>
                </div>

                {/* Collection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Collection
                  </label>
                  <select
                    value={form.collectionId}
                    onChange={(e) => setForm((prev) => ({ ...prev, collectionId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  >
                    <option value="">No collection</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="abstract, contemporary, blue (comma separated)"
                  />
                </div>

                {/* Framing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Framing
                  </label>
                  <input
                    type="text"
                    value={form.framing}
                    onChange={(e) => setForm((prev) => ({ ...prev, framing: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="e.g., Gallery wrapped, Framed in oak"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/10"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.certificate}
                      onChange={(e) => setForm((prev) => ({ ...prev, certificate: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/10"
                    />
                    Certificate of Authenticity
                  </label>
                </div>

                {/* Actions */}
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
                    {editingId ? 'Save Changes' : 'Create Artwork'}
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
                  <h3 className="text-base font-semibold text-gray-900">Delete Artwork</h3>
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
