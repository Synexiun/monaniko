'use client';

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
  Eye,
  ArrowRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { artworks } from '@/data/artworks';
import Link from 'next/link';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const statsCards = [
  {
    label: 'Total Revenue',
    value: '$47,500',
    trend: '+12%',
    trendUp: true,
    icon: DollarSign,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Total Orders',
    value: '23',
    trend: '+8%',
    trendUp: true,
    icon: ShoppingCart,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Active Inquiries',
    value: '8',
    trend: '+24%',
    trendUp: true,
    icon: MessageSquare,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Subscribers',
    value: '1,247',
    trend: '-2%',
    trendUp: false,
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
];

const recentOrders = [
  { id: 'ORD-1042', customer: 'Sarah Mitchell', items: 'Ethereal Bloom (Print)', total: 450, status: 'delivered' },
  { id: 'ORD-1041', customer: 'James Thornton', items: 'Whispers of Gold (Original)', total: 12000, status: 'shipped' },
  { id: 'ORD-1040', customer: 'Lisa Park', items: 'Mask of Metamorphosis (Print)', total: 280, status: 'confirmed' },
  { id: 'ORD-1039', customer: 'Robert Avila', items: 'Velvet Dusk (Print x2)', total: 900, status: 'pending' },
  { id: 'ORD-1038', customer: 'Emily Chen', items: 'Garden of Silence (Original)', total: 7200, status: 'delivered' },
];

const recentInquiries = [
  { name: 'Michael Torres', type: 'Commission', artwork: 'Custom 48x60', date: 'Mar 7, 2026', status: 'new' },
  { name: 'Diana Ross', type: 'Artwork', artwork: 'Crimson Passage', date: 'Mar 5, 2026', status: 'contacted' },
  { name: 'Alan Wright', type: 'Private Viewing', artwork: 'Luminous Collection', date: 'Mar 4, 2026', status: 'in_progress' },
];

const quickActions = [
  { label: 'Add Artwork', icon: Plus, href: '/admin/artworks', color: 'bg-black text-white hover:bg-gray-800' },
  { label: 'Create Campaign', icon: Megaphone, href: '/admin/campaigns', color: 'bg-blue-600 text-white hover:bg-blue-700' },
  { label: 'Write Post', icon: PenLine, href: '/admin/content', color: 'bg-[#C4A265] text-white hover:bg-[#B3934F]' },
  { label: 'View Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
};

const topArtworks = artworks
  .filter((a) => a.featured)
  .slice(0, 4)
  .map((a, i) => ({
    ...a,
    views: [1240, 980, 870, 650][i],
    inquiries: [5, 3, 4, 2][i],
  }));

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AdminDashboardPage() {
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
                    stat.trendUp
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-700 bg-red-50'
                  )}
                >
                  {stat.trendUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.trend}
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
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {order.customer}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 hidden sm:table-cell max-w-[200px] truncate">
                      {order.items}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900 text-right">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={cn(
                          'inline-block text-xs font-medium px-2.5 py-1 rounded-full border capitalize',
                          statusColors[order.status]
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
              8 active
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInquiries.map((inquiry, i) => (
              <div key={i} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {inquiry.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inquiry.type} &middot; {inquiry.artwork}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full border capitalize whitespace-nowrap ml-3',
                      statusColors[inquiry.status]
                    )}
                  >
                    {inquiry.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{inquiry.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Artworks */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Top Performing Artworks
          </h2>
          <Link
            href="/admin/analytics"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            View analytics
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {topArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {artwork.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {artwork.category} &middot;{' '}
                  {artwork.price ? formatPrice(artwork.price) : 'Price on inquiry'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {artwork.views.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <Eye className="w-3 h-3" />
                    views
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {artwork.inquiries}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <MessageSquare className="w-3 h-3" />
                    inquiries
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
