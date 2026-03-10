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
  GraduationCap,
  Loader2,
  MapPin,
  Monitor,
  Calendar,
  Users,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface Workshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  images: string[];
  date: string;
  endDate?: string;
  time: string;
  duration: string;
  location: string;
  isOnline: boolean;
  price: number;
  capacity: number;
  spotsLeft: number;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  materials?: string[];
  featured: boolean;
  createdAt: string;
}

type TimeframeFilter = 'all' | 'upcoming' | 'past';

const timeframeTabs: { value: TimeframeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

const levelConfig: Record<string, { label: string; className: string }> = {
  beginner: { label: 'Beginner', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  intermediate: { label: 'Intermediate', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  advanced: { label: 'Advanced', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  all_levels: { label: 'All Levels', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const ITEMS_PER_PAGE = 20;

const emptyFormData = {
  title: '',
  slug: '',
  description: '',
  longDescription: '',
  date: '',
  endDate: '',
  time: '',
  duration: '',
  location: '',
  isOnline: false,
  price: 0,
  capacity: 20,
  spotsLeft: 20,
  instructor: 'Mona Niko',
  level: 'all_levels' as Workshop['level'],
  materials: '',
  featured: false,
};

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set('search', search);
      if (timeframe !== 'all') params.set('timeframe', timeframe);
      if (levelFilter !== 'all') params.set('level', levelFilter);
      const res = await fetch(`/api/workshops?${params}`);
      const json = await res.json();
      setWorkshops(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch workshops:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, timeframe, levelFilter]);

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

  const openEdit = (workshop: Workshop) => {
    setEditing(workshop);
    setFormData({
      title: workshop.title,
      slug: workshop.slug,
      description: workshop.description,
      longDescription: workshop.longDescription || '',
      date: workshop.date ? workshop.date.split('T')[0] : '',
      endDate: workshop.endDate ? workshop.endDate.split('T')[0] : '',
      time: workshop.time,
      duration: workshop.duration,
      location: workshop.location,
      isOnline: workshop.isOnline,
      price: workshop.price,
      capacity: workshop.capacity,
      spotsLeft: workshop.spotsLeft,
      instructor: workshop.instructor,
      level: workshop.level,
      materials: workshop.materials?.join(', ') || '',
      featured: workshop.featured,
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
        ...formData,
        materials: formData.materials.split(',').map((m) => m.trim()).filter(Boolean),
      };
      const url = editing ? `/api/workshops/${editing.id}` : '/api/workshops';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save workshop:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/workshops/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete workshop:', err);
    }
  };

  const toggleFeatured = async (workshop: Workshop) => {
    try {
      await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !workshop.featured }),
      });
      setWorkshops((prev) =>
        prev.map((w) => (w.id === workshop.id ? { ...w, featured: !w.featured } : w))
      );
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
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
          <h1 className="text-2xl font-bold text-gray-900">Workshops</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage workshop listings and registrations ({total} total)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Workshop
        </button>
      </div>

      {/* Data Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Timeframe Tabs */}
        <div className="flex items-center gap-0 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
          {timeframeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setTimeframe(tab.value);
                setPage(1);
              }}
              className={cn(
                'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                timeframe === tab.value
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {timeframe === tab.value && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search + Level Filter */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops by title or instructor..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors min-w-[160px]"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all_levels">All Levels (tag)</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading workshops...</span>
          </div>
        ) : workshops.length > 0 ? (
          <>
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Workshop
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Level
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Location
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Price
                    </th>
                    <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Capacity
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
                  {workshops.map((workshop) => {
                    const level = levelConfig[workshop.level] || levelConfig.all_levels;
                    const spotsFilled = workshop.capacity - workshop.spotsLeft;
                    const fillPercent = workshop.capacity > 0 ? (spotsFilled / workshop.capacity) * 100 : 0;
                    return (
                      <tr
                        key={workshop.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        {/* Title */}
                        <td className="px-5 py-3.5">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {workshop.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {workshop.instructor}
                            </p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(workshop.date)}
                            </span>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span
                            className={cn(
                              'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                              level.className
                            )}
                          >
                            {level.label}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            {workshop.isOnline ? (
                              <Monitor className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-600 truncate max-w-[140px]">
                              {workshop.isOnline ? 'Online' : workshop.location}
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(workshop.price)}
                          </span>
                        </td>

                        {/* Capacity */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-500">
                              {spotsFilled}/{workshop.capacity}
                            </span>
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  fillPercent >= 90
                                    ? 'bg-red-500'
                                    : fillPercent >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                )}
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Featured */}
                        <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                          <button
                            onClick={() => toggleFeatured(workshop)}
                            className={cn(
                              'p-1.5 rounded-md transition-colors',
                              workshop.featured
                                ? 'text-[#C4A265] hover:bg-amber-50'
                                : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                            )}
                          >
                            {workshop.featured ? (
                              <Star className="w-4 h-4 fill-current" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(workshop)}
                              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="Edit workshop"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(workshop.id)}
                              className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Delete workshop"
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
                <span className="font-medium text-gray-700">
                  {(page - 1) * ITEMS_PER_PAGE + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-gray-700">
                  {Math.min(page * ITEMS_PER_PAGE, total)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-gray-700">{total}</span> results
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
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
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
              <GraduationCap className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No workshops found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {search
                ? 'Try adjusting your search or filter.'
                : 'Create your first workshop to get started.'}
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
              className="fixed inset-4 sm:inset-auto sm:top-[5%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl sm:max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editing ? 'Edit Workshop' : 'New Workshop'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Title + Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Workshop title"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="workshop-slug"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Short description..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Long Description</label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={4}
                    placeholder="Detailed workshop description..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>

                {/* Date, End Date, Time, Duration */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="10:00 AM"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="3 hours"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Location + Online Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Gallery studio, Zoom, etc."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                        className={cn(
                          'relative w-10 h-6 rounded-full transition-colors',
                          formData.isOnline ? 'bg-blue-500' : 'bg-gray-200'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                            formData.isOnline ? 'left-[18px]' : 'left-0.5'
                          )}
                        />
                      </button>
                      <span className="text-sm font-medium text-gray-700">Online workshop</span>
                    </div>
                  </div>
                </div>

                {/* Price, Capacity, Spots Left */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      min={1}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Spots Left</label>
                    <input
                      type="number"
                      value={formData.spotsLeft}
                      onChange={(e) => setFormData({ ...formData, spotsLeft: Number(e.target.value) })}
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Instructor + Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructor</label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Instructor name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as Workshop['level'] })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all_levels">All Levels</option>
                    </select>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Materials (comma separated)</label>
                  <input
                    type="text"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    placeholder="Canvas, brushes, paint"
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
                  <span className="text-sm font-medium text-gray-700">Featured workshop</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.title.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Update Workshop' : 'Create Workshop'}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Workshop</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this workshop? This action cannot be undone.
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
