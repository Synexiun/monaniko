'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { artworks as allArtworks } from '@/data/artworks';
import type { ArtworkStatus } from '@/types';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const statusConfig: Record<
  ArtworkStatus,
  { label: string; className: string }
> = {
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

const ITEMS_PER_PAGE = 10;

export default function ArtworksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredToggles, setFeaturedToggles] = useState<
    Record<string, boolean>
  >(
    Object.fromEntries(allArtworks.map((a) => [a.id, a.featured]))
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredArtworks = useMemo(() => {
    let result = [...allArtworks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.medium.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    return result;
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE)
  );
  const paginatedArtworks = filteredArtworks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleFeatured = (id: string) => {
    setFeaturedToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artworks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your artwork catalog ({allArtworks.length} total)
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors self-start sm:self-auto">
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
        </div>

        {/* Data Table */}
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
              {paginatedArtworks.map((artwork) => {
                const status = statusConfig[artwork.status];
                return (
                  <tr
                    key={artwork.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Image + Title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {artwork.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {artwork.year} &middot;{' '}
                            {artwork.dimensions.width}&times;{artwork.dimensions.height}{' '}
                            {artwork.dimensions.unit}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {formatCategory(artwork.category)}
                      </span>
                    </td>

                    {/* Medium */}
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">
                        {formatMedium(artwork.medium)}
                      </span>
                    </td>

                    {/* Status */}
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

                    {/* Price */}
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {artwork.price
                          ? formatPrice(artwork.price)
                          : 'On Inquiry'}
                      </span>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <button
                        onClick={() => toggleFeatured(artwork.id)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          featuredToggles[artwork.id]
                            ? 'text-[#C4A265] hover:bg-amber-50'
                            : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                        )}
                        aria-label={
                          featuredToggles[artwork.id]
                            ? 'Remove from featured'
                            : 'Add to featured'
                        }
                      >
                        {featuredToggles[artwork.id] ? (
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
                          className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Edit artwork"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
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

              {paginatedArtworks.length === 0 && (
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-gray-700">
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredArtworks.length
              )}
            </span>{' '}
            of{' '}
            <span className="font-medium text-gray-700">
              {filteredArtworks.length}
            </span>{' '}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
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
              )
            )}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
