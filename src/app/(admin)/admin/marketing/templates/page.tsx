'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const CATEGORIES = ['newsletter', 'collection', 'workshop', 'promo', 'custom'];

interface Template {
  id: string;
  name: string;
  subject: string;
  html: string;
  previewText: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
  _count?: { blasts: number };
}

const defaultForm = { name: '', subject: '', html: '', previewText: '', category: 'newsletter' };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: '100' });
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await fetch(`/api/marketing/templates?${params}`);
      if (!res.ok) throw new Error('Failed to load templates');
      const data = await res.json();
      setTemplates(data.templates);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormError(null);
    setPanelOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ name: t.name, subject: t.subject, html: t.html, previewText: t.previewText || '', category: t.category });
    setFormError(null);
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.html.trim()) {
      setFormError('Name, subject, and HTML are required');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const url = editing ? `/api/marketing/templates/${editing.id}` : '/api/marketing/templates';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }
      closePanel();
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Template) => {
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/marketing/templates/${t.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setConfirmDelete(null);
      load();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const previewInWindow = (t: Template) => {
    const w = window.open('', '_blank', 'width=700,height=700');
    if (!w) return;
    w.document.write(t.html);
    w.document.close();
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">{total} template{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={load} className="text-sm text-gray-600 underline">Retry</button>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No templates yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{t.name}</p>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{t.subject}</p>
                </div>
                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {t.category}
                </span>
              </div>
              {t.previewText && (
                <p className="text-xs text-gray-400 line-clamp-2 italic">{t.previewText}</p>
              )}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {t._count?.blasts ?? 0} blast{(t._count?.blasts ?? 0) !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => previewInWindow(t)}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Preview HTML"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(t)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-in Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={closePanel}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[680px] bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">
                  {editing ? 'Edit Template' : 'New Template'}
                </h2>
                <button onClick={closePanel} className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Template Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Monthly Newsletter"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject Line *</label>
                    <input
                      value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. New Works from Mona Niko"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preview Text</label>
                    <input
                      value={form.previewText}
                      onChange={(e) => setForm((p) => ({ ...p, previewText: e.target.value }))}
                      placeholder="Short summary shown in inbox"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">HTML Content *</label>
                    <textarea
                      value={form.html}
                      onChange={(e) => setForm((p) => ({ ...p, html: e.target.value }))}
                      rows={18}
                      placeholder="Paste your full HTML email here..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={closePanel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Delete Template</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Delete <strong>{confirmDelete.name}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    disabled={deletingId === confirmDelete.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === confirmDelete.id && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
