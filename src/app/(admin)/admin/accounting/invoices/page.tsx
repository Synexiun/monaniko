'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Loader2, AlertTriangle, FileText, Printer,
  Trash2, Pencil, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  SENT: { label: 'Sent', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  PAID: { label: 'Paid', className: 'bg-green-50 text-green-700 border-green-200' },
  OVERDUE: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  lineItems: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  status: string;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  notes?: string;
}

const emptyLineItem: LineItem = { description: '', qty: 1, unitPrice: 0, amount: 0 };
const emptyForm = {
  clientName: '',
  clientEmail: '',
  clientAddressLine1: '',
  clientCity: '',
  clientState: '',
  clientZip: '',
  taxRate: '0',
  notes: '',
  dueAt: '',
};

const ITEMS_PER_PAGE = 10;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...emptyLineItem }]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: page.toString(), limit: ITEMS_PER_PAGE.toString() });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/accounting/invoices?${params}`);
      if (!res.ok) throw new Error('Failed to load invoices');
      const json = await res.json();
      setInvoices(json.invoices ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const recalcLineItem = (item: LineItem): LineItem => ({
    ...item,
    amount: Math.round(item.qty * item.unitPrice * 100) / 100,
  });

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = prev.map((item, i) =>
        i === index ? recalcLineItem({ ...item, [field]: value }) : item
      );
      return updated;
    });
  };

  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const taxRate = parseFloat(form.taxRate || '0');
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const invoiceTotal = subtotal + tax;

  const openAdd = () => {
    setEditingInvoice(null);
    setForm(emptyForm);
    setLineItems([{ ...emptyLineItem }]);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    let items: LineItem[] = [];
    try { items = JSON.parse(inv.lineItems); } catch { items = [{ ...emptyLineItem }]; }
    setLineItems(items.length ? items : [{ ...emptyLineItem }]);
    let addr = { line1: '', city: '', state: '', zip: '' };
    try { if (inv.clientAddress) addr = JSON.parse(inv.clientAddress); } catch { /* empty */ }
    setForm({
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      clientAddressLine1: addr.line1 ?? '',
      clientCity: addr.city ?? '',
      clientState: addr.state ?? '',
      clientZip: addr.zip ?? '',
      taxRate: inv.taxRate.toString(),
      notes: inv.notes ?? '',
      dueAt: inv.dueAt ? inv.dueAt.slice(0, 10) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.clientEmail.trim()) {
      setFormError('Client name and email are required.');
      return;
    }
    if (lineItems.every((i) => !i.description.trim())) {
      setFormError('Add at least one line item.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const body = {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientAddress: form.clientAddressLine1
          ? { line1: form.clientAddressLine1, city: form.clientCity, state: form.clientState, zip: form.clientZip }
          : null,
        lineItems: lineItems.filter((i) => i.description.trim()),
        taxRate: form.taxRate,
        notes: form.notes || null,
        dueAt: form.dueAt || null,
      };
      const url = editingInvoice ? `/api/accounting/invoices/${editingInvoice.id}` : '/api/accounting/invoices';
      const res = await fetch(url, {
        method: editingInvoice ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }
      setModalOpen(false);
      fetchInvoices();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/accounting/invoices/${id}`, { method: 'DELETE' });
      fetchInvoices();
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatus(id);
    try {
      await fetch(`/api/accounting/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchInvoices();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const printInvoice = (inv: Invoice) => {
    let items: LineItem[] = [];
    try { items = JSON.parse(inv.lineItems); } catch { /* empty */ }
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${inv.invoiceNumber}</title>
<style>
  body { font-family: Georgia, serif; color: #1A1A1A; max-width: 700px; margin: 40px auto; padding: 0 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .brand { font-size: 22px; letter-spacing: 0.1em; color: #C4A265; }
  .invoice-meta { text-align: right; font-size: 13px; color: #4A4A4A; }
  .invoice-number { font-size: 28px; font-weight: 400; color: #1A1A1A; margin: 0; }
  .divider { border: none; border-top: 2px solid #C4A265; margin: 0 0 30px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
  .label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #4A4A4A; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { text-align: left; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #4A4A4A; padding: 8px 0; border-bottom: 1px solid #E0DDD8; }
  td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #F0EDE8; }
  .text-right { text-align: right; }
  .totals { max-width: 280px; margin-left: auto; }
  .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #4A4A4A; }
  .grand-total { font-size: 20px; font-weight: 600; color: #1A1A1A; border-top: 2px solid #C4A265; padding-top: 12px; margin-top: 8px; display: flex; justify-content: space-between; }
  .notes { margin-top: 40px; font-size: 13px; color: #4A4A4A; line-height: 1.7; }
  .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #E0DDD8; font-size: 11px; color: #888; text-align: center; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="header">
  <div>
    <div class="brand">MONA NIKO GALLERY</div>
    <div style="font-size:12px;color:#4A4A4A;margin-top:4px;">668B Mission Viejo Mall · Mission Viejo, CA 92691</div>
  </div>
  <div class="invoice-meta">
    <p class="invoice-number">Invoice</p>
    <p style="margin:4px 0;font-size:16px;color:#C4A265;">${inv.invoiceNumber}</p>
    <p style="margin:4px 0;">Issued: ${new Date(inv.issuedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
    ${inv.dueAt ? `<p style="margin:4px 0;">Due: ${new Date(inv.dueAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>` : ''}
    <p style="margin-top:8px;padding:4px 10px;border-radius:4px;background:${inv.status === 'PAID' ? '#f0fdf4' : '#fef9f0'};color:${inv.status === 'PAID' ? '#166534' : '#92400e'};font-size:12px;display:inline-block;">${inv.status}</p>
  </div>
</div>
<hr class="divider">
<div class="parties">
  <div>
    <p class="label">Bill To</p>
    <p style="font-size:16px;margin:0 0 4px;">${inv.clientName}</p>
    <p style="font-size:13px;color:#4A4A4A;margin:0;">${inv.clientEmail}</p>
  </div>
</div>
<table>
  <thead><tr>
    <th>Description</th>
    <th class="text-right">Qty</th>
    <th class="text-right">Unit Price</th>
    <th class="text-right">Amount</th>
  </tr></thead>
  <tbody>
    ${items.map((i) => `<tr>
      <td>${i.description}</td>
      <td class="text-right">${i.qty}</td>
      <td class="text-right">$${i.unitPrice.toFixed(2)}</td>
      <td class="text-right">$${i.amount.toFixed(2)}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>$${inv.subtotal.toFixed(2)}</span></div>
  ${inv.tax > 0 ? `<div class="total-row"><span>Tax (${inv.taxRate}%)</span><span>$${inv.tax.toFixed(2)}</span></div>` : ''}
  <div class="grand-total"><span>Total</span><span>$${inv.total.toFixed(2)}</span></div>
  ${inv.status === 'PAID' && inv.paidAt ? `<div class="total-row" style="color:#166534;margin-top:8px;"><span>Paid on</span><span>${new Date(inv.paidAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span></div>` : ''}
</div>
${inv.notes ? `<div class="notes"><p class="label">Notes</p><p>${inv.notes}</p></div>` : ''}
<div class="footer">Mona Niko Gallery · monaniko.com · Thank you for your business</div>
<script>window.onload = () => window.print();</script>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors';
  const labelClass = 'block text-xs font-medium text-gray-700 mb-1.5';

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage client invoices</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-0 px-4 pt-3 border-b border-gray-100 overflow-x-auto">
          {['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === s ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {s === '' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
              {statusFilter === s && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900">No invoices yet</p>
            <button onClick={openAdd} className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              Create Invoice
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Invoice #</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Client</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Issued</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Due</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Total</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv) => {
                    const sc = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.DRAFT;
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{inv.clientName}</p>
                          <p className="text-xs text-gray-400">{inv.clientEmail}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 hidden md:table-cell">{formatDate(inv.issuedAt)}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 hidden sm:table-cell">{formatDate(inv.dueAt)}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">{formatPrice(inv.total)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <select
                            value={inv.status}
                            onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                            disabled={updatingStatus === inv.id}
                            className={cn(
                              'text-xs font-medium px-2.5 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none disabled:opacity-50',
                              sc.className
                            )}
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => printInvoice(inv)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                              title="Print invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEdit(inv)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id)}
                              disabled={deletingId === inv.id}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {deletingId === inv.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Page {page} of {totalPages} ({total} total)</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto"
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => !saving && setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl z-10 my-8"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingInvoice ? `Edit ${editingInvoice.invoiceNumber}` : 'New Invoice'}
                </h2>
                <button onClick={() => !saving && setModalOpen(false)} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Client Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Client Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Name *</label>
                      <input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email *</label>
                      <input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} placeholder="client@email.com" className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Address (optional)</label>
                      <input type="text" value={form.clientAddressLine1} onChange={(e) => setForm({ ...form, clientAddressLine1: e.target.value })} placeholder="Street address" className={inputClass} />
                    </div>
                    <div>
                      <input type="text" value={form.clientCity} onChange={(e) => setForm({ ...form, clientCity: e.target.value })} placeholder="City" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={form.clientState} onChange={(e) => setForm({ ...form, clientState: e.target.value })} placeholder="State" className={inputClass} />
                      <input type="text" value={form.clientZip} onChange={(e) => setForm({ ...form, clientZip: e.target.value })} placeholder="ZIP" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Line Items</h3>
                    <button
                      onClick={() => setLineItems((prev) => [...prev, { ...emptyLineItem }])}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add line
                    </button>
                  </div>
                  <div className="space-y-2">
                    {lineItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Qty"
                            value={item.qty}
                            onChange={(e) => updateLineItem(idx, 'qty', parseFloat(e.target.value) || 0)}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <div className={cn(inputClass, 'bg-gray-50 text-gray-600')}>
                            {formatPrice(item.amount)}
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {lineItems.length > 1 && (
                            <button
                              onClick={() => setLineItems((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 max-w-xs ml-auto text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Tax %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={form.taxRate}
                        onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                        className="w-20 px-2 py-1 rounded border border-gray-200 text-sm text-right focus:outline-none focus:ring-1 focus:ring-gray-300"
                      />
                      <span className="text-gray-600 ml-auto">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                      <span>Total</span><span>{formatPrice(invoiceTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Due Date</label>
                    <input type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Payment terms, thank you note, etc."
                    rows={3}
                    className={inputClass}
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
                )}
              </div>

              <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => !saving && setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingInvoice ? 'Save Changes' : 'Create Invoice'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
