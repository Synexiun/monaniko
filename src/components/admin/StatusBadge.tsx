'use client';

import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'artwork' | 'inquiry' | 'journal' | 'campaign' | 'content';
}

const statusColorMap: Record<string, string> = {
  // Green: available, delivered, published, completed, active
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Yellow: pending, scheduled, contacted
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  scheduled: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',

  // Blue: confirmed, new, draft
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  draft: 'bg-blue-50 text-blue-700 border-blue-200',

  // Purple: processing, in_progress, on_exhibition, shipped
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  on_exhibition: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',

  // Red: cancelled, failed
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  failed: 'bg-red-50 text-red-700 border-red-200',

  // Gray: sold, closed, paused, commissioned
  sold: 'bg-gray-100 text-gray-600 border-gray-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  paused: 'bg-gray-100 text-gray-600 border-gray-200',
  commissioned: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass =
    statusColorMap[status.toLowerCase()] ||
    'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span
      className={cn(
        'inline-block text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap',
        colorClass
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
