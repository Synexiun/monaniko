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
  Package,
  Inbox,
  Loader2,
  ImageIcon,
  Copy,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  dimensions?: string;
  sku?: string;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  type: string;
  basePrice: number;
  artworkId?: string;
  featured: boolean;
  tags: string[];
  variants: ProductVariant[];
  createdAt: string;
}

type ProductType = 'all' | 'print' | 'merchandise' | 'designers_collection';

const typeTabs: { value: ProductType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'print', label: 'Prints' },
  { value: 'merchandise', label: 'Merch' },
  { value: 'designers_collection', label: 'Designers' },
];

const typeConfig: Record<string, { label: string; className: string }> = {
  print: { label: 'Print', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  original: { label: 'Original', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  merchandise: { label: 'Merch', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  designers_collection: { label: 'Designers', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  workshop: { label: 'Workshop', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const ITEMS_PER_PAGE = 20;

const emptyFormData = {
  title: '',
  slug: '',
  description: '',
  type: 'print',
  basePrice: 0,
  artworkId: '',
  featured: false,
  tags: '',
};

const emptyVariant: Omit<ProductVariant, 'id'> = {
  name: '',
  price: 0,
  dimensions: '',
  sku: '',
  stock: 0,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<ProductType>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_PAGE) });
      if (search) params.set('search', search);
      if (activeType !== 'all') params.set('type', activeType);
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      setProducts(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeType]);

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
    setVariants([]);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormData({
      title: product.title,
      slug: product.slug,
      description: product.description,
      type: product.type,
      basePrice: product.basePrice,
      artworkId: product.artworkId || '',
      featured: product.featured,
      tags: product.tags.join(', '),
    });
    setVariants(product.variants || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormData(emptyFormData);
    setVariants([]);
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, ...emptyVariant },
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        variants,
      };
      const url = editing ? `/api/products/${editing.id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p))
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage prints, merchandise, and designer collections ({total} total)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Data Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Type Tabs */}
        <div className="flex items-center gap-0 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveType(tab.value);
                setPage(1);
              }}
              className={cn(
                'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                activeType === tab.value
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {activeType === tab.value && (
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
              placeholder="Search products by title or tag..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading products...</span>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Product
                    </th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Type
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                      Base Price
                    </th>
                    <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Variants
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
                  {products.map((product) => {
                    const typeInfo = typeConfig[product.type] || {
                      label: product.type,
                      className: 'bg-gray-50 text-gray-600 border-gray-200',
                    };
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        {/* Image + Title */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {product.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span
                            className={cn(
                              'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                              typeInfo.className
                            )}
                          >
                            {typeInfo.label}
                          </span>
                        </td>

                        {/* Base Price */}
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(product.basePrice)}
                          </span>
                        </td>

                        {/* Variants Count */}
                        <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                            {product.variants?.length || 0}
                          </span>
                        </td>

                        {/* Featured Toggle */}
                        <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                          <button
                            onClick={() => toggleFeatured(product)}
                            className={cn(
                              'p-1.5 rounded-md transition-colors',
                              product.featured
                                ? 'text-[#C4A265] hover:bg-amber-50'
                                : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                            )}
                            aria-label={product.featured ? 'Remove from featured' : 'Add to featured'}
                          >
                            {product.featured ? (
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
                              onClick={() => openEdit(product)}
                              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label="Edit product"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Delete product"
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
                  aria-label="Previous page"
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
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No products found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {search
                ? 'Try adjusting your search or filter.'
                : 'Create your first product to get started.'}
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
                  {editing ? 'Edit Product' : 'New Product'}
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
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Product title"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="product-slug"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Product description..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                  />
                </div>

                {/* Type + Base Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      <option value="print">Print</option>
                      <option value="original">Original</option>
                      <option value="merchandise">Merchandise</option>
                      <option value="designers_collection">Designers Collection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price ($)</label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                {/* Artwork ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Artwork ID (optional)</label>
                  <input
                    type="text"
                    value={formData.artworkId}
                    onChange={(e) => setFormData({ ...formData, artworkId: e.target.value })}
                    placeholder="Link to artwork ID"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="abstract, floral, gold"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                  />
                </div>

                {/* Featured Toggle */}
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
                  <span className="text-sm font-medium text-gray-700">Featured product</span>
                </div>

                {/* Variants Section */}
                <div className="border-t border-gray-200 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Variants ({variants.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Variant
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No variants yet. Add one to define sizes, options, or editions.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {variants.map((variant, idx) => (
                        <div
                          key={variant.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              Variant {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="col-span-2 sm:col-span-1">
                              <label className="block text-xs text-gray-500 mb-1">Name</label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                placeholder="e.g. 24x32"
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Price ($)</label>
                              <input
                                type="number"
                                value={variant.price}
                                onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                                min={0}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Dimensions</label>
                              <input
                                type="text"
                                value={variant.dimensions || ''}
                                onChange={(e) => updateVariant(idx, 'dimensions', e.target.value)}
                                placeholder="24x32 in"
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">SKU</label>
                              <input
                                type="text"
                                value={variant.sku || ''}
                                onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                placeholder="SKU-001"
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Stock</label>
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                                min={0}
                                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this product? This action cannot be undone.
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
