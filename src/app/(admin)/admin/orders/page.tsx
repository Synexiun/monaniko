'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Package,
  Inbox,
  X,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  variantName?: string;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  itemsSummary: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  shippingAddress?: string;
  notes?: string;
  timeline?: { status: string; date: string; note?: string }[];
}

interface StatusCounts {
  all: number;
  PENDING: number;
  CONFIRMED: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  SHIPPED: {
    label: 'Shipped',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
};

const statusFlow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    all: 0,
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search
  useEffect(() => {
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (activeTab !== 'all') params.set('status', activeTab);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error('Failed to load orders');
      const json = await res.json();
      setOrders(json.orders || json.data || []);
      setTotalCount(json.total || json.totalCount || 0);
      if (json.statusCounts) {
        setStatusCounts(json.statusCounts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder, status: newStatus } : o))
      );
      if (detailOrder && detailOrder.id === orderId) {
        setDetailOrder({ ...detailOrder, ...updatedOrder, status: newStatus });
      }
      fetchOrders();
    } catch {
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && detailOrder) {
        setDetailOrder(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [detailOrder]);

  const tabs: { value: string; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: statusCounts.all },
    { value: 'PENDING', label: 'Pending', count: statusCounts.PENDING },
    { value: 'CONFIRMED', label: 'Confirmed', count: statusCounts.CONFIRMED },
    { value: 'PROCESSING', label: 'Processing', count: statusCounts.PROCESSING },
    { value: 'SHIPPED', label: 'Shipped', count: statusCounts.SHIPPED },
    { value: 'DELIVERED', label: 'Delivered', count: statusCounts.DELIVERED },
  ];

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
                setCurrentPage(1);
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-400 ml-3">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 text-sm text-gray-600 underline hover:text-gray-800"
            >
              Retry
            </button>
          </div>
        ) : orders.length > 0 ? (
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
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.PENDING;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-gray-600 truncate block max-w-[220px]">
                          {order.itemsSummary}
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
                            onClick={() => setDetailOrder(order)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            disabled={updatingStatus}
                            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50"
                          >
                            {statusFlow.map((s) => (
                              <option key={s} value={s}>
                                {statusConfig[s].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
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

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} ({totalCount} total)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev !== undefined && page - prev > 1;
                  return (
                    <span key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">...</span>
                      )}
                      <button
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
                    </span>
                  );
                })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {detailOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setDetailOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl z-10 my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order {detailOrder.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDateTime(detailOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setDetailOrder(null)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Status & Payment */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={cn(
                      'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                      (statusConfig[detailOrder.status] || statusConfig.PENDING).className
                    )}
                  >
                    {(statusConfig[detailOrder.status] || statusConfig.PENDING).label}
                  </span>
                  {detailOrder.paymentStatus && (
                    <span className={cn(
                      'inline-block text-xs font-medium px-2.5 py-1 rounded-full border',
                      detailOrder.paymentStatus === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : detailOrder.paymentStatus === 'refunded'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    )}>
                      Payment: {detailOrder.paymentStatus}
                    </span>
                  )}
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Update Status
                  </label>
                  <select
                    value={detailOrder.status}
                    onChange={(e) => updateOrderStatus(detailOrder.id, e.target.value as OrderStatus)}
                    disabled={updatingStatus}
                    className="px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors disabled:opacity-50"
                  >
                    {statusFlow.map((s) => (
                      <option key={s} value={s}>
                        {statusConfig[s].label}
                      </option>
                    ))}
                  </select>
                  {updatingStatus && (
                    <span className="ml-2 inline-flex items-center text-xs text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Updating...
                    </span>
                  )}
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer</h3>
                  <p className="text-sm text-gray-700">{detailOrder.customerName}</p>
                  <p className="text-sm text-gray-500">{detailOrder.customerEmail}</p>
                  {detailOrder.shippingAddress && (
                    <p className="text-sm text-gray-500 mt-1">{detailOrder.shippingAddress}</p>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
                  {detailOrder.items && detailOrder.items.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-2">Item</th>
                            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-2">Qty</th>
                            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-2">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {detailOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2.5 text-sm text-gray-900">
                                {item.title}
                                {item.variantName && (
                                  <span className="text-xs text-gray-400 ml-1">({item.variantName})</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-sm text-gray-600 text-right">{item.quantity}</td>
                              <td className="px-4 py-2.5 text-sm font-medium text-gray-900 text-right">{formatPrice(item.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-200 bg-gray-50">
                            <td colSpan={2} className="px-4 py-2.5 text-sm font-semibold text-gray-900 text-right">Total</td>
                            <td className="px-4 py-2.5 text-sm font-bold text-gray-900 text-right">{formatPrice(detailOrder.total)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{detailOrder.itemsSummary}</p>
                  )}
                </div>

                {/* Order Timeline */}
                {detailOrder.timeline && detailOrder.timeline.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
                    <div className="space-y-3">
                      {detailOrder.timeline.map((entry, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-900 capitalize">{entry.status.toLowerCase().replace('_', ' ')}</p>
                            <p className="text-xs text-gray-400">{formatDateTime(entry.date)}</p>
                            {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {detailOrder.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{detailOrder.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
