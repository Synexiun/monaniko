'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-indigo-50 text-indigo-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { id: string; title: string; image: string | null; price: number; quantity: number }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account/orders')
      .then((r) => r.ok ? r.json() : Promise.reject('Failed'))
      .then((d) => setOrders(d.orders))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[#C4A265]" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center py-20 gap-3">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <h1 className="font-serif text-2xl md:text-3xl text-black font-medium">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E8E5E0] p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-[#C4A265] opacity-40" />
          <p className="font-serif text-lg text-black mb-2">No orders yet</p>
          <p className="text-sm text-[#6B6560] mb-6">When you make a purchase, your orders will appear here.</p>
          <Link href="/shop" className="inline-block px-6 py-2.5 bg-[#1A1A1A] text-white text-[11px] tracking-[0.12em] uppercase hover:bg-[#C4A265] transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white border border-[#E8E5E0] p-5 hover:border-[#C4A265] transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium text-black text-sm">{order.orderNumber}</p>
                    <span className={`text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6560]">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-[#6B6560] mt-0.5">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    {' · '}
                    {order.items.slice(0, 2).map((i) => i.title).join(', ')}
                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-serif text-lg text-black">{formatPrice(order.total)}</p>
                  <ChevronRight className="w-4 h-4 text-[#6B6560] group-hover:text-[#C4A265] transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
