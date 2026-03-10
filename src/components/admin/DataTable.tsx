'use client';

import { useState, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (item: T) => void;
  getId: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  bulkActions?: {
    label: string;
    onClick: (ids: string[]) => void;
    variant?: 'danger' | 'default';
  }[];
}

export default function DataTable<T>({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
  onSort,
  sortKey,
  sortOrder,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  getId,
  loading = false,
  emptyMessage = 'No results found.',
  bulkActions = [],
}: DataTableProps<T>) {
  const [hoveredSort, setHoveredSort] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const allSelected =
    data.length > 0 && data.every((item) => selectedIds.includes(getId(item)));
  const someSelected =
    data.some((item) => selectedIds.includes(getId(item))) && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const currentIds = data.map(getId);
      onSelectionChange(
        selectedIds.filter((id) => !currentIds.includes(id))
      );
    } else {
      const currentIds = data.map(getId);
      const newIds = [...new Set([...selectedIds, ...currentIds])];
      onSelectionChange(newIds);
    }
  }, [allSelected, data, getId, onSelectionChange, selectedIds]);

  const handleSelectRow = useCallback(
    (item: T) => {
      if (!onSelectionChange) return;
      const id = getId(item);
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    },
    [getId, onSelectionChange, selectedIds]
  );

  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) return;
      const newOrder =
        sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(key, newOrder);
    },
    [onSort, sortKey, sortOrder]
  );

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) {
        pages.push('start-ellipsis');
      }
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) {
        pages.push('end-ellipsis');
      }
      pages.push(totalPages);
    }

    return pages.map((p) => {
      if (typeof p === 'string') {
        return (
          <span
            key={p}
            className="w-8 h-8 flex items-center justify-center text-sm text-gray-400"
          >
            ...
          </span>
        );
      }
      return (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            'w-8 h-8 rounded-md text-sm font-medium transition-colors',
            p === page
              ? 'bg-gray-900 text-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          )}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Bulk Actions Bar */}
      {selectable && selectedIds.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {selectedIds.length}
            </span>{' '}
            {selectedIds.length === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                onClick={() => action.onClick(selectedIds)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  action.variant === 'danger'
                    ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                    : 'text-gray-700 bg-white hover:bg-gray-100 border border-gray-200'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {selectable && (
                <th className="w-12 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/10 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3',
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.sortable && 'cursor-pointer select-none',
                    col.className
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  onMouseEnter={
                    col.sortable ? () => setHoveredSort(col.key) : undefined
                  }
                  onMouseLeave={
                    col.sortable ? () => setHoveredSort(null) : undefined
                  }
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span
                        className={cn(
                          'inline-flex flex-col transition-opacity',
                          sortKey === col.key || hoveredSort === col.key
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      >
                        <ChevronUp
                          className={cn(
                            'w-3 h-3 -mb-0.5',
                            sortKey === col.key && sortOrder === 'asc'
                              ? 'text-gray-900'
                              : 'text-gray-300'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-3 h-3 -mt-0.5',
                            sortKey === col.key && sortOrder === 'desc'
                              ? 'text-gray-900'
                              : 'text-gray-300'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-5 py-12 text-center text-sm text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = getId(item);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr
                    key={id}
                    className={cn(
                      'hover:bg-gray-50/50 transition-colors group',
                      isSelected && 'bg-gray-50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="w-12 px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(item);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/10 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-5 py-3.5',
                          col.hideOnMobile && 'hidden md:table-cell',
                          col.className
                        )}
                      >
                        {col.render ? (
                          col.render(item)
                        ) : (
                          <span className="text-sm text-gray-600">
                            {String(
                              (item as Record<string, unknown>)[col.key] ?? ''
                            )}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">{startItem}</span> to{' '}
            <span className="font-medium text-gray-700">{endItem}</span> of{' '}
            <span className="font-medium text-gray-700">{total}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
