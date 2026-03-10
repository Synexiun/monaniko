'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, AlertTriangle, Package } from 'lucide-react';
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

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

interface OrderItem {
  id: string;
  title: string;
  image: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/account/orders/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject('Not found'))
      .then(setOrder)
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[#C4A265]" />
    </div>
  );

  if (error || !order) return (
    <div className="flex flex-col items-center py-20 gap-3">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error ?? 'Order not found'}</p>
      <Link href="/account/orders" className="text-sm text-[#C4A265] underline">Back to orders</Link>
    </div>
  );

  const address = order.shippingAddress ? (() => {
    try { return JSON.parse(order.shippingAddress!); } catch { return null; }
  })() : null;

  const activeStep = STATUS_STEPS.indexOf(order.status);

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="flex items-center gap-1 text-sm text-[#6B6560] hover:text-black transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Orders
        </Link>
        <span className="text-[#E8E5E0]">/</span>
        <span className="text-sm text-black font-medium">{order.orderNumber}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-black font-medium">{order.orderNumber}</h1>
        <span className={`text-[10px] tracking-[0.1em] uppercase px-3 py-1 font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Status tracker */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white border border-[#E8E5E0] p-5">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div className={`flex-1 h-0.5 transition-colors ${i <= activeStep ? 'bg-[#C4A265]' : 'bg-[#E8E5E0]'}`} />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                    i < activeStep ? 'bg-[#C4A265] text-white' :
                    i === activeStep ? 'bg-[#1A1A1A] text-white' :
                    'bg-[#F5F3F0] text-[#6B6560]'
                  }`}>
                    {i < activeStep ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 transition-colors ${i < activeStep ? 'bg-[#C4A265]' : 'bg-[#E8E5E0]'}`} />
                  )}
                </div>
                <p className={`text-[9px] tracking-[0.08em] uppercase mt-2 text-center ${i === activeStep ? 'text-black font-medium' : 'text-[#6B6560]'}`}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="bg-white border border-[#E8E5E0] p-5 md:col-span-2">
          <h2 className="font-serif text-base text-black mb-4">Items Ordered</h2>
          <div className="divide-y divide-[#F5F3F0]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-16 h-16 bg-[#F5F3F0] flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.title} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 m-5 text-[#6B6560]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{item.title}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-[#6B6560] mt-0.5">Qty: {item.quantity}</p>
                  )}
                </div>
                <p className="text-sm font-medium text-black shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E8E5E0] mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-[#6B6560]">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6B6560]">
              <span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-sm text-[#6B6560]">
                <span>Tax</span><span>{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-black border-t border-[#E8E5E0] pt-2 mt-2">
              <span className="font-serif">Total</span>
              <span className="font-serif text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        {address && (
          <div className="bg-white border border-[#E8E5E0] p-5">
            <h2 className="font-serif text-base text-black mb-3">Shipping Address</h2>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">
              {order.customerName}<br />
              {address.line1}<br />
              {address.line2 && <>{address.line2}<br /></>}
              {address.city}, {address.state} {address.zip}<br />
              {address.country}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="bg-white border border-[#E8E5E0] p-5">
          <h2 className="font-serif text-base text-black mb-3">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B6560]">Order date</span>
              <span className="text-black">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6560]">Email</span>
              <span className="text-black">{order.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6560]">Payment</span>
              <span className={order.paymentStatus === 'PAID' ? 'text-emerald-600 font-medium' : 'text-[#6B6560]'}>
                {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
