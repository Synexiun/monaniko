'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const CATEGORY_COLORS: Record<string, string> = {
  RENT: 'bg-blue-500',
  SUPPLIES: 'bg-amber-500',
  MARKETING: 'bg-purple-500',
  SOFTWARE: 'bg-indigo-500',
  SHIPPING: 'bg-cyan-500',
  UTILITIES: 'bg-orange-500',
  SALARIES: 'bg-green-500',
  INSURANCE: 'bg-rose-500',
  EQUIPMENT: 'bg-teal-500',
  OTHER: 'bg-gray-400',
};

interface Summary {
  thisMonth: { revenue: number; expenses: number; profit: number };
  lastMonth: { revenue: number; expenses: number; profit: number };
  ytd: { revenue: number; expenses: number; profit: number };
  taxLiability: number;
  monthlyPL: { month: string; revenue: number; expenses: number; profit: number }[];
  expensesByCategory: { category: string; amount: number }[];
  outstandingInvoices: { count: number; total: number };
}

function pct(a: number, b: number): string {
  if (b === 0) return a > 0 ? '+100' : '0';
  return ((((a - b) / Math.abs(b)) * 100)).toFixed(0);
}

export default function AccountingPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/accounting/summary');
      if (!res.ok) throw new Error('Failed to load accounting data');
      setSummary(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </motion.div>
    );
  }

  if (error || !summary) {
    return (
      <motion.div {...fadeIn} className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={fetchSummary} className="text-sm text-gray-600 underline">Retry</button>
      </motion.div>
    );
  }

  const revenueChange = pct(summary.thisMonth.revenue, summary.lastMonth.revenue);
  const expenseChange = pct(summary.thisMonth.expenses, summary.lastMonth.expenses);
  const profitChange = pct(summary.thisMonth.profit, summary.lastMonth.profit);

  const maxPL = Math.max(...summary.monthlyPL.map((m) => Math.max(m.revenue, m.expenses)), 1);
  const totalExpensesYtd = summary.expensesByCategory.reduce((s, e) => s + e.amount, 0);

  const kpis = [
    {
      label: 'Revenue',
      value: formatPrice(summary.thisMonth.revenue),
      sub: `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}% vs last month`,
      up: Number(revenueChange) >= 0,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Expenses',
      value: formatPrice(summary.thisMonth.expenses),
      sub: `${Number(expenseChange) >= 0 ? '+' : ''}${expenseChange}% vs last month`,
      up: Number(expenseChange) <= 0,
      icon: Receipt,
      color: 'bg-red-50 text-red-500',
    },
    {
      label: 'Net Profit',
      value: formatPrice(summary.thisMonth.profit),
      sub: `${Number(profitChange) >= 0 ? '+' : ''}${profitChange}% vs last month`,
      up: Number(profitChange) >= 0,
      icon: TrendingUp,
      color: summary.thisMonth.profit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Tax Liability (YTD)',
      value: formatPrice(summary.taxLiability),
      sub: `${summary.outstandingInvoices.count} outstanding invoice${summary.outstandingInvoices.count !== 1 ? 's' : ''}`,
      up: true,
      icon: FileText,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>
          <p className="text-sm text-gray-500 mt-1">Profit & Loss overview for this month</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/accounting/expenses"
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Expenses
          </Link>
          <Link
            href="/admin/accounting/invoices"
            className="px-3 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Invoices
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', kpi.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                  kpi.up ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                )}>
                  {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* YTD Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Year-to-Date Summary</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'YTD Revenue', value: summary.ytd.revenue, color: 'text-emerald-600' },
            { label: 'YTD Expenses', value: summary.ytd.expenses, color: 'text-red-500' },
            { label: 'YTD Profit', value: summary.ytd.profit, color: summary.ytd.profit >= 0 ? 'text-blue-600' : 'text-orange-600' },
          ].map((item) => (
            <div key={item.label}>
              <p className={cn('text-2xl font-bold', item.color)}>{formatPrice(item.value)}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly P&L Table */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">6-Month P&L</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Month</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Revenue</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Expenses</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Profit</th>
                  <th className="px-5 py-3 w-32" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.monthlyPL.map((m) => (
                  <tr key={m.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{m.month}</td>
                    <td className="px-5 py-3.5 text-sm text-emerald-600 text-right">{formatPrice(m.revenue)}</td>
                    <td className="px-5 py-3.5 text-sm text-red-500 text-right">{formatPrice(m.expenses)}</td>
                    <td className={cn(
                      'px-5 py-3.5 text-sm font-semibold text-right',
                      m.profit >= 0 ? 'text-blue-600' : 'text-orange-600'
                    )}>
                      {m.profit >= 0 ? '' : '-'}{formatPrice(Math.abs(m.profit))}
                    </td>
                    <td className="px-5 py-3.5">
                      {/* Mini bar */}
                      <div className="flex gap-1 items-center">
                        <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${(m.revenue / maxPL) * 80}px` }} />
                        <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${(m.expenses / maxPL) * 80}px` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Expenses by Category</h2>
            <span className="text-xs text-gray-400">YTD</span>
          </div>
          {summary.expensesByCategory.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No expenses recorded</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {summary.expensesByCategory.map((cat) => {
                const pctWidth = totalExpensesYtd > 0 ? (cat.amount / totalExpensesYtd) * 100 : 0;
                return (
                  <div key={cat.category} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2.5 h-2.5 rounded-full', CATEGORY_COLORS[cat.category] ?? 'bg-gray-400')} />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {cat.category.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(cat.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div
                        className={cn('h-1 rounded-full transition-all', CATEGORY_COLORS[cat.category] ?? 'bg-gray-400')}
                        style={{ width: `${pctWidth}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{pctWidth.toFixed(1)}% of total</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="px-5 py-4 border-t border-gray-100">
            <Link
              href="/admin/accounting/expenses"
              className="flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>View all expenses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Outstanding Invoices Banner */}
      {summary.outstandingInvoices.count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {summary.outstandingInvoices.count} outstanding invoice{summary.outstandingInvoices.count !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700">
                {formatPrice(summary.outstandingInvoices.total)} awaiting payment
              </p>
            </div>
          </div>
          <Link
            href="/admin/accounting/invoices"
            className="flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors"
          >
            View invoices
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}
