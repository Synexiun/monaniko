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
  BookOpen,
  Loader2,
  ExternalLink,
  FileText,
  Clock,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledAt?: string;
  seo?: {
    title: string;
    description: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = 'all' | 'draft' | 'published' | 'scheduled';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  published: { label: 'Published', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const ITEMS_PER_PAGE = 20;

const emptyFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Mona Niko',
  category: '',
  tags: '',
  status: 'draft' as JournalPost['status'],
  publishedAt: '',
  scheduledAt: '',
  seoTitle: '',
  seoDescription: '',
  seoImage: '',
};

export default function JournalPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [statusCounts, setStatusCounts] = useState({ all: 0, draft: 0, published: 0, scheduled: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/journal?${params}`);
      const json = await res.json();
      setPosts(json.data || []);
      setTotal(json.pagination?.total || 0);
      if (json.counts) {
        setStatusCounts(json.counts);
      }
    } catch (err) {
      console.error('Failed to fetch journal posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

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

  const openEdit = (post: JournalPost) => {
    setEditing(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      author: post.author,
      category: post.category,
      tags: post.tags.join(', '),
      status: post.status,
      publishedAt: post.publishedAt ? post.publishedAt.split('T')[0] : '',
      scheduledAt: post.scheduledAt ? post.scheduledAt.split('T')[0] : '',
      seoTitle: post.seo?.title || '',
      seoDescription: post.seo?.description || '',
      seoImage: post.seo?.ogImage || '',
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
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        author: formData.author,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: formData.status,
        publishedAt: formData.publishedAt || undefined,
        scheduledAt: formData.scheduledAt || undefined,
        seo: {
          title: formData.seoTitle,
          description: formData.seoDescription,
          ogImage: formData.seoImage || undefined,
        },
      };
      const url = editing ? `/api/journal/${editing.id}` : '/api/journal';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save journal post:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete journal post:', err);
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

  const tabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: statusCounts.all || total },
    { value: 'draft', label: 'Draft', count: statusCounts.draft },
    { value: 'published', label: 'Published', count: statusCounts.published },
    { value: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled },
  ];

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage blog posts and articles ({total} total)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
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

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts by title, author, or category..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading posts...</span>
          </div>
        ) : posts.length > 0 ? (
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
                      Author
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Category
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Published
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => {
                    const status = statusConfig[post.status] || statusConfig.draft;
                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        {/* Title */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {post.coverImage ? (
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                                {post.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{post.author}</span>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{post.category || '-'}</span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
                              status.className
                            )}
                          >
                            {post.status === 'scheduled' && <Clock className="w-3 h-3" />}
                            {status.label}
                          </span>
                        </td>

                        {/* Published Date */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-sm text-gray-500">
                            {post.status === 'scheduled'
                              ? formatDate(post.scheduledAt || '')
                              : formatDate(post.publishedAt || '')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {post.status === 'published' && (
                              <a
                                href={`/journal/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                aria-label="Preview post"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => openEdit(post)}
                              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="Edit post"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(post.id)}
                              className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Delete post"
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
              <BookOpen className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No posts found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {search
                ? 'Try adjusting your search or filter.'
                : 'Create your first journal post to get started.'}
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
              className="fixed inset-4 sm:inset-auto sm:top-[3%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl sm:max-h-[94vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editing ? 'Edit Post' : 'New Post'}
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
                      placeholder="Post title"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="post-slug"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Short preview of the post..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    placeholder="Full post content..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-y"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image URL</label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Author + Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Art, Studio, Events..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="art, studio-life, exhibition"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Status + Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as JournalPost['status'] })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Published At</label>
                    <input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheduled At</label>
                    <input
                      type="date"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* SEO Section */}
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Title</label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="Custom title for search engines"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Description</label>
                      <textarea
                        value={formData.seoDescription}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                        rows={2}
                        placeholder="Meta description for search engines (150-160 characters recommended)"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {formData.seoDescription.length}/160 characters
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Image URL</label>
                      <input
                        type="text"
                        value={formData.seoImage}
                        onChange={(e) => setFormData({ ...formData, seoImage: e.target.value })}
                        placeholder="Open Graph image URL"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                      />
                    </div>
                  </div>
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
                  {editing ? 'Update Post' : 'Create Post'}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this post? This action cannot be undone.
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
