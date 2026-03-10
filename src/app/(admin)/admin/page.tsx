'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Megaphone,
  PenLine,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Activity,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DashboardData {
  stats: {
    revenue: { value: number; trend: number };
    orders: { value: number; trend: number };
    inquiries: { value: number; trend: number };
    subscribers: { value: number; trend: number };
  };
  recentOrders: any[];
  recentInquiries: any[];
  upcomingWorkshops: any[];
  lowStockVariants: any[];
  recentActivity: any[];
}

const quickActions = [
  { label: 'Add Artwork', icon: Plus, href: '/admin/artworks', color: 'bg-black text-white hover:bg-gray-800' },
  { label: 'Create Campaign', icon: Megaphone, href: '/admin/campaigns', color: 'bg-blue-600 text-white hover:bg-blue-700' },
  { label: 'Write Post', icon: PenLine, href: '/admin/journal', color: 'bg-[#C4A265] text-white hover:bg-[#B3934F]' },
  { label: 'View Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  CONTACTED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-gray-200" />
        <div className="w-14 h-6 rounded-full bg-gray-200" />
      </div>
      <div className="mt-4 w-20 h-7 bg-gray-200 rounded" />
      <div className="mt-2 w-24 h-4 bg-gray-100 rounded" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="w-32 h-5 bg-gray-200 rounded" />
      </div>
      <div className="p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-full h-4 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <motion.div {...fadeIn} className="space-y-6">
        <div>
          <div className="w-48 h-7 bg-gray-200 rounded animate-pulse" />
          <div className="w-64 h-4 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <SkeletonTable />
          </div>
          <SkeletonTable />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div {...fadeIn} className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  if (!data) return null;

  const { stats } = data;

  const statsCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats.revenue.value),
      trend: stats.revenue.trend,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Orders',
      value: stats.orders.value.toString(),
      trend: stats.orders.trend,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Inquiries',
      value: stats.inquiries.value.toString(),
      trend: stats.inquiries.trend,
      icon: MessageSquare,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Subscribers',
      value: stats.subscribers.value.toLocaleString(),
      trend: stats.subscribers.trend,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, Mona
        </h1>
        <p className="text-sm text-gray-500 mt-1">{formatDate()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const trendUp = stat.trend >= 0;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    stat.color
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                    trendUp
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-700 bg-red-50'
                  )}
                >
                  {trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {trendUp ? '+' : ''}{stat.trend}%
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                action.color
              )}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Order
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                    Items
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Total
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {order.customerName || order.customerEmail}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 hidden sm:table-cell max-w-[200px] truncate">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 text-right">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={cn(
                          'inline-block text-xs font-medium px-2.5 py-1 rounded-full border capitalize',
                          statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'
                        )}
                      >
                        {(order.status || '').replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Inquiries
            </h2>
            <span className="text-xs font-medium text-[#C4A265] bg-[#C4A265]/10 px-2 py-1 rounded-full">
              {stats.inquiries.value} active
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentInquiries.map((inquiry: any) => (
              <div key={inquiry.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {inquiry.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(inquiry.type || '').replace(/_/g, ' ').toLowerCase()}
                      {inquiry.artwork?.title && ` · ${inquiry.artwork.title}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full border capitalize whitespace-nowrap ml-3',
                      statusColors[inquiry.status] || 'bg-gray-100 text-gray-600 border-gray-200'
                    )}
                  >
                    {(inquiry.status || '').replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formatShortDate(inquiry.createdAt)}
                </p>
              </div>
            ))}
            {data.recentInquiries.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No recent inquiries
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Workshops & Low Stock Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Workshops */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Upcoming Workshops
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.upcomingWorkshops.map((workshop: any) => (
              <div key={workshop.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {workshop.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatShortDate(workshop.date)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-3">
                    {workshop.spotsLeft}/{workshop.capacity} spots
                  </span>
                </div>
              </div>
            ))}
            {data.upcomingWorkshops.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No upcoming workshops
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.lowStockVariants.map((variant: any) => (
              <div key={variant.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {variant.product?.title || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {variant.name}
                    </p>
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-3',
                    variant.stock === 0
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  )}>
                    {variant.stock === 0 ? 'Out of stock' : `${variant.stock} left`}
                  </span>
                </div>
              </div>
            ))}
            {data.lowStockVariants.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No low stock alerts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      {data.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentActivity.map((entry: any) => (
              <div key={entry.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium capitalize">{entry.action}</span>
                      <span className="text-gray-500"> {entry.entityType}</span>
                      {entry.details && (() => {
                        try {
                          const d = JSON.parse(entry.details);
                          return d.title ? <span className="text-gray-500"> &mdash; {d.title}</span> : null;
                        } catch {
                          return <span className="text-gray-500"> &mdash; {entry.details}</span>;
                        }
                      })()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-3">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
