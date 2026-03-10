'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: React.ElementType;
  color: string;
  iconColor: string;
}

export default function StatsCard({
  label,
  value,
  trend,
  icon: Icon,
  color,
  iconColor,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            color
          )}
        >
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend.isPositive
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-red-700 bg-red-50'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
