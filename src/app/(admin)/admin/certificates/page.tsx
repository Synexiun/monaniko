'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Plus, Printer, Pencil, Trash2, X, Loader2, AlertTriangle, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

interface Certificate {
  id: string;
  certificateNumber: string;
  artworkTitle: string;
  artworkDescription: string | null;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  edition: string | null;
  artistName: string;
  recipientName: string;
  orderId: string | null;
  artworkId: string | null;
  notes: string | null;
  issuedAt: string;
}

const defaultForm = {
  artworkTitle: '', artworkDescription: '', medium: '',
  dimensions: '', year: '', edition: '', artistName: 'Mona Niko',
  recipientName: '', orderId: '', artworkId: '', notes: '',
};

function printCertificate(cert: Certificate) {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate of Authenticity — ${cert.certificateNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #fff; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    .page {
      width: 860px; min-height: 600px; margin: 0 auto; padding: 60px 80px;
      border: 2px solid #1A1A1A; position: relative;
    }
    .gold-line { height: 3px; background: #C4A265; margin-bottom: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .brand { font-family: 'Playfair Display', serif; font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase; color: #C4A265; margin-bottom: 12px; }
    .title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; color: #1A1A1A; margin-bottom: 6px; }
    .subtitle { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #6B6560; }
    .cert-number { position: absolute; top: 60px; right: 80px; font-size: 11px; color: #6B6560; letter-spacing: 0.1em; text-align: right; }
    .divider { border: none; border-top: 1px solid #E8E5E0; margin: 32px 0; }
    .artwork-section { margin-bottom: 32px; }
    .artwork-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; color: #1A1A1A; margin-bottom: 8px; font-style: italic; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px; margin-bottom: 24px; }
    .detail-item label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6B6560; display: block; margin-bottom: 3px; }
    .detail-item span { font-size: 14px; color: #1A1A1A; }
    .description { font-size: 13px; color: #4A4A4A; line-height: 1.7; margin-bottom: 32px; font-style: italic; }
    .statement { font-size: 12px; color: #4A4A4A; line-height: 1.8; margin-bottom: 40px; text-align: center; }
    .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
    .sig-line { border-top: 1px solid #1A1A1A; padding-top: 8px; }
    .sig-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #6B6560; }
    .sig-name { font-family: 'Playfair Display', serif; font-size: 15px; color: #1A1A1A; margin-top: 2px; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #6B6560; letter-spacing: 0.1em; }
    .bottom-gold { height: 3px; background: #C4A265; margin-top: 40px; }
  </style>
</head>
<body>
<div class="page">
  <div class="cert-number">Certificate No. ${cert.certificateNumber}</div>
  <div class="gold-line"></div>
  <div class="header">
    <p class="brand">Mona Niko Gallery</p>
    <h1 class="title">Certificate of Authenticity</h1>
    <p class="subtitle">Original Work of Art</p>
  </div>
  <hr class="divider">
  <div class="artwork-section">
    <p class="artwork-title">${cert.artworkTitle}</p>
    ${cert.artworkDescription ? `<p class="description">${cert.artworkDescription}</p>` : ''}
    <div class="details-grid">
      <div class="detail-item"><label>Artist</label><span>${cert.artistName}</span></div>
      ${cert.year ? `<div class="detail-item"><label>Year Created</label><span>${cert.year}</span></div>` : ''}
      ${cert.medium ? `<div class="detail-item"><label>Medium</label><span>${cert.medium}</span></div>` : ''}
      ${cert.dimensions ? `<div class="detail-item"><label>Dimensions</label><span>${cert.dimensions}</span></div>` : ''}
      ${cert.edition ? `<div class="detail-item"><label>Edition</label><span>${cert.edition}</span></div>` : ''}
      <div class="detail-item"><label>Collector</label><span>${cert.recipientName}</span></div>
      <div class="detail-item"><label>Date Issued</label><span>${new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
    </div>
  </div>
  <p class="statement">
    This certifies that the above-described work is an original creation by ${cert.artistName}
    and is authentic in all respects. This certificate accompanies the work and confirms its
    provenance and authenticity as part of the permanent record of the Mona Niko Gallery.
  </p>
  <div class="signature-section">
    <div>
      <div class="sig-line">
        <p class="sig-label">Artist's Signature</p>
        <p class="sig-name">${cert.artistName}</p>
      </div>
    </div>
    <div>
      <div class="sig-line">
        <p class="sig-label">Gallery Director</p>
        <p class="sig-name">Mona Niko Gallery</p>
      </div>
    </div>
  </div>
  <p class="footer">Mona Niko Gallery · 668B The Shops at Mission Viejo Mall · Mission Viejo, CA 92691 · monaniko.com</p>
  <div class="bottom-gold"></div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
  w.document.write(html);
  w.document.close();
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Certificate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch('/api/certificates?limit=100');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCerts(data.certificates); setTotal(data.total);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(defaultForm); setFormError(null); setPanelOpen(true); };
  const openEdit = (c: Certificate) => {
    setEditing(c);
    setForm({
      artworkTitle: c.artworkTitle, artworkDescription: c.artworkDescription || '',
      medium: c.medium || '', dimensions: c.dimensions || '',
      year: c.year?.toString() || '', edition: c.edition || '',
      artistName: c.artistName, recipientName: c.recipientName,
      orderId: c.orderId || '', artworkId: c.artworkId || '', notes: c.notes || '',
    });
    setFormError(null); setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.artworkTitle.trim() || !form.recipientName.trim()) {
      setFormError('Artwork title and recipient name are required'); return;
    }
    setSaving(true); setFormError(null);
    try {
      const url = editing ? `/api/certificates/${editing.id}` : '/api/certificates';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      setPanelOpen(false); setEditing(null); load();
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c: Certificate) => {
    setDeletingId(c.id);
    await fetch(`/api/certificates/${c.id}`, { method: 'DELETE' });
    setConfirmDelete(null); setDeletingId(null); load();
  };

  const filtered = certs.filter((c) =>
    !search || c.artworkTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateNumber.toLowerCase().includes(search.toLowerCase())
  );

  const fieldClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates of Authenticity</h1>
          <p className="text-sm text-gray-500 mt-1">{total} certificate{total !== 1 ? 's' : ''} issued</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus className="w-4 h-4" /> Issue Certificate
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search certificates…"
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={load} className="text-sm text-gray-600 underline">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{search ? 'No matching certificates.' : 'No certificates issued yet.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Certificate #</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Artwork</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Collector</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Details</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">Issued</th>
                <th className="px-5 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">{c.certificateNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900 italic">{c.artworkTitle}</p>
                    {c.year && <p className="text-xs text-gray-400 mt-0.5">{c.year}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-700">{c.recipientName}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 space-y-0.5">
                    {c.medium && <p>{c.medium}</p>}
                    {c.dimensions && <p>{c.dimensions}</p>}
                    {c.edition && <p>Ed. {c.edition}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                    {new Date(c.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => printCertificate(c)} className="p-1.5 rounded text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors" title="Print PDF">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(c)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-in Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40" onClick={() => setPanelOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">{editing ? 'Edit Certificate' : 'Issue Certificate'}</h2>
                <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {formError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{formError}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>Artwork Title *</label>
                    <input value={form.artworkTitle} onChange={(e) => setForm((p) => ({ ...p, artworkTitle: e.target.value }))} className={fieldClass} placeholder="Title of the artwork" />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Artwork Description</label>
                    <textarea value={form.artworkDescription} onChange={(e) => setForm((p) => ({ ...p, artworkDescription: e.target.value }))} rows={2} className={`${fieldClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Medium</label>
                    <input value={form.medium} onChange={(e) => setForm((p) => ({ ...p, medium: e.target.value }))} className={fieldClass} placeholder="Oil on canvas" />
                  </div>
                  <div>
                    <label className={labelClass}>Dimensions</label>
                    <input value={form.dimensions} onChange={(e) => setForm((p) => ({ ...p, dimensions: e.target.value }))} className={fieldClass} placeholder='24" × 36"' />
                  </div>
                  <div>
                    <label className={labelClass}>Year Created</label>
                    <input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} className={fieldClass} placeholder="2024" />
                  </div>
                  <div>
                    <label className={labelClass}>Edition / Series</label>
                    <input value={form.edition} onChange={(e) => setForm((p) => ({ ...p, edition: e.target.value }))} className={fieldClass} placeholder="1/1 or 3/50" />
                  </div>
                  <div>
                    <label className={labelClass}>Artist Name</label>
                    <input value={form.artistName} onChange={(e) => setForm((p) => ({ ...p, artistName: e.target.value }))} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Collector Name *</label>
                    <input value={form.recipientName} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} className={fieldClass} placeholder="Full name" />
                  </div>
                  <div>
                    <label className={labelClass}>Order ID (optional)</label>
                    <input value={form.orderId} onChange={(e) => setForm((p) => ({ ...p, orderId: e.target.value }))} className={fieldClass} placeholder="Link to order" />
                  </div>
                  <div>
                    <label className={labelClass}>Artwork ID (optional)</label>
                    <input value={form.artworkId} onChange={(e) => setForm((p) => ({ ...p, artworkId: e.target.value }))} className={fieldClass} placeholder="Link to artwork record" />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className={`${fieldClass} resize-none`} />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button onClick={() => setPanelOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Issue Certificate'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-500" /></div>
                  <h3 className="font-semibold text-gray-900">Delete Certificate</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Delete certificate <strong>{confirmDelete.certificateNumber}</strong>? This cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                    {deletingId === confirmDelete.id && <Loader2 className="w-4 h-4 animate-spin" />} Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
