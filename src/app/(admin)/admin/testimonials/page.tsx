'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Quote,
  Loader2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  text: string;
  image?: string;
  rating?: number;
  featured: boolean;
  createdAt?: string;
}

const ITEMS_PER_PAGE = 12;

const emptyFormData = {
  name: '',
  role: '',
  text: '',
  image: '',
  rating: 5,
  featured: false,
};

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={cn(
            'transition-colors',
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            className={cn(
              sizeClass,
              star <= value
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
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
      const res = await fetch(`/api/testimonials?${params}`);
      const json = await res.json();
      setTestimonials(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
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

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      text: testimonial.text,
      image: testimonial.image || '',
      rating: testimonial.rating || 5,
      featured: testimonial.featured,
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
        name: formData.name,
        role: formData.role || undefined,
        text: formData.text,
        image: formData.image || undefined,
        rating: formData.rating,
        featured: formData.featured,
      };
      const url = editing ? `/api/testimonials/${editing.id}` : '/api/testimonials';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save testimonial:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      await fetch(`/api/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !testimonial.featured }),
      });
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === testimonial.id ? { ...t, featured: !t.featured } : t
        )
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer testimonials and reviews ({total} total)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search testimonials by name or content..."
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
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-3 text-sm text-gray-500">Loading testimonials...</span>
        </div>
      ) : testimonials.length > 0 ? (
        <>
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col"
              >
                {/* Quote */}
                <div className="flex-1 mb-4">
                  <Quote className="w-5 h-5 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                    {testimonial.text}
                  </p>
                </div>

                {/* Rating */}
                {testimonial.rating !== undefined && testimonial.rating > 0 && (
                  <div className="mb-3">
                    <StarRating value={testimonial.rating} readOnly size="sm" />
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="text-xs text-gray-400 truncate">{testimonial.role}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => toggleFeatured(testimonial)}
                      className={cn(
                        'p-1.5 rounded-md transition-colors',
                        testimonial.featured
                          ? 'text-[#C4A265] hover:bg-amber-50'
                          : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                      )}
                      aria-label={testimonial.featured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <Star className={cn('w-4 h-4', testimonial.featured && 'fill-current')} />
                    </button>
                    <button
                      onClick={() => openEdit(testimonial)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(testimonial.id)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-700">{(page - 1) * ITEMS_PER_PAGE + 1}</span>{' '}
              to{' '}
              <span className="font-medium text-gray-700">{Math.min(page * ITEMS_PER_PAGE, total)}</span>{' '}
              of <span className="font-medium text-gray-700">{total}</span> testimonials
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Quote className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No testimonials found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {search
                ? 'Try adjusting your search.'
                : 'Add your first testimonial to get started.'}
            </p>
          </div>
        </div>
      )}

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
                  {editing ? 'Edit Testimonial' : 'New Testimonial'}
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
                {/* Name + Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Customer name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role / Title</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Art Collector, Designer..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Testimonial Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Testimonial</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={5}
                    placeholder="What did the customer say..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <StarRating
                    value={formData.rating}
                    onChange={(v) => setFormData({ ...formData, rating: v })}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo URL (optional)</label>
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
                  <span className="text-sm font-medium text-gray-700">Featured testimonial</span>
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
                  disabled={saving || !formData.name.trim() || !formData.text.trim()}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Testimonial</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this testimonial? This action cannot be undone.
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
