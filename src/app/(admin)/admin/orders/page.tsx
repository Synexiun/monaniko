'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  MoreHorizontal,
  Package,
  Inbox,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

interface MockOrder {
  id: string;
  date: string;
  customer: string;
  email: string;
  items: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
}

const mockOrders: MockOrder[] = [
  {
    id: 'ORD-1042',
    date: '2026-03-07',
    customer: 'Sarah Mitchell',
    email: 'sarah.m@email.com',
    items: 'Ethereal Bloom (Print 24"x32")',
    itemCount: 1,
    total: 450,
    status: 'delivered',
  },
  {
    id: 'ORD-1041',
    date: '2026-03-06',
    customer: 'James Thornton',
    email: 'j.thornton@email.com',
    items: 'Whispers of Gold (Original)',
    itemCount: 1,
    total: 12000,
    status: 'shipped',
  },
  {
    id: 'ORD-1040',
    date: '2026-03-05',
    customer: 'Lisa Park',
    email: 'lisa.park@email.com',
    items: 'Mask of Metamorphosis (Print 20"x20")',
    itemCount: 1,
    total: 280,
    status: 'confirmed',
  },
  {
    id: 'ORD-1039',
    date: '2026-03-04',
    customer: 'Robert Avila',
    email: 'ravila@email.com',
    items: 'Velvet Dusk (Print 16"x20") x2',
    itemCount: 2,
    total: 900,
    status: 'pending',
  },
  {
    id: 'ORD-1038',
    date: '2026-03-03',
    customer: 'Emily Chen',
    email: 'emily.c@email.com',
    items: 'Garden of Silence (Original)',
    itemCount: 1,
    total: 7200,
    status: 'delivered',
  },
  {
    id: 'ORD-1037',
    date: '2026-03-02',
    customer: 'David Williams',
    email: 'd.williams@email.com',
    items: 'Ethereal Bloom (Print 30"x40")',
    itemCount: 1,
    total: 750,
    status: 'shipped',
  },
  {
    id: 'ORD-1036',
    date: '2026-03-01',
    customer: 'Maria Garcia',
    email: 'mgarcia@email.com',
    items: 'Whispers of Gold (Print 30"x30")',
    itemCount: 1,
    total: 650,
    status: 'delivered',
  },
  {
    id: 'ORD-1035',
    date: '2026-02-28',
    customer: 'Alex Turner',
    email: 'a.turner@email.com',
    items: 'Fragments of Memory (Original)',
    itemCount: 1,
    total: 6500,
    status: 'confirmed',
  },
  {
    id: 'ORD-1034',
    date: '2026-02-27',
    customer: 'Jessica Liu',
    email: 'jliu@email.com',
    items: 'Mask of Metamorphosis (Print 12"x12") x3',
    itemCount: 3,
    total: 360,
    status: 'pending',
  },
  {
    id: 'ORD-1033',
    date: '2026-02-25',
    customer: 'Michael Torres',
    email: 'm.torres@email.com',
    items: 'Ethereal Bloom (Original)',
    itemCount: 1,
    total: 8500,
    status: 'delivered',
  },
];

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
};

const tabs: { value: string; label: string; count?: number }[] = [
  { value: 'all', label: 'All', count: 10 },
  { value: 'pending', label: 'Pending', count: 2 },
  { value: 'confirmed', label: 'Confirmed', count: 2 },
  { value: 'shipped', label: 'Shipped', count: 2 },
  { value: 'delivered', label: 'Delivered', count: 4 },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    let result = [...mockOrders];

    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.items.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeTab, searchQuery]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage customer orders
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-0 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
              }}
              className={cn(
                'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.value
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full',
                      activeTab === tab.value
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
              {activeTab === tab.value && (
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
              placeholder="Search orders by ID, customer, or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                    Items
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Total
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {order.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-gray-500">
                          {formatDate(order.date)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.customer}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-gray-600 truncate block max-w-[220px]">
                          {order.items}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={cn(
                            'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No orders found</p>
            <p className="text-sm text-gray-500 mt-1 text-center">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'No orders match the selected filter.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
