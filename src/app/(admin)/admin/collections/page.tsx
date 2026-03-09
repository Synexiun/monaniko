'use client';

import { motion } from 'framer-motion';
import { Plus, Star, StarOff, Pencil, Trash2, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collections, artworks } from '@/data/artworks';
import { useState } from 'react';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function CollectionsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const getArtworkCount = (artworkIds: string[]) => {
    return artworkIds.length;
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize artworks into curated collections ({collections.length}{' '}
            total)
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
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            Add Collection
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Cover Image */}
              <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                {collection.featured && (
                  <div className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-md">
                    <Star className="w-4 h-4 text-[#C4A265] fill-current" />
                  </div>
                )}
              </div>

              {/* Details */}
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
                      {getArtworkCount(collection.artworkIds)} artwork
                      {getArtworkCount(collection.artworkIds) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      aria-label="Edit collection"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
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
          <button className="bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center min-h-[280px] transition-colors group/add">
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
                    {/* Cover + Title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
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

                    {/* Artwork Count */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Image className="w-4 h-4 text-gray-400" />
                        {getArtworkCount(collection.artworkIds)}
                      </div>
                    </td>

                    {/* Year */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {collection.year || '--'}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="px-5 py-3.5 text-center">
                      {collection.featured ? (
                        <Star className="w-4 h-4 text-[#C4A265] fill-current inline-block" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-300 inline-block" />
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Edit collection"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete collection"
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
        </div>
      )}
    </motion.div>
  );
}
