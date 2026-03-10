'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CampaignStatus, CampaignObjective, CampaignChannel, AudienceSegment } from '@/types';

const statusTabs: { label: string; value: CampaignStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
];

const statusColor: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-50 text-blue-700',
  active: 'bg-green-50 text-green-700',
  completed: 'bg-gray-200 text-gray-800',
  paused: 'bg-yellow-50 text-yellow-700',
};

const objectiveColor: Record<CampaignObjective, string> = {
  sales: 'bg-emerald-50 text-emerald-700',
  launch: 'bg-purple-50 text-purple-700',
  awareness: 'bg-sky-50 text-sky-700',
  event_booking: 'bg-orange-50 text-orange-700',
  engagement: 'bg-pink-50 text-pink-700',
};

const objectiveLabel: Record<CampaignObjective, string> = {
  sales: 'Sales',
  launch: 'Launch',
  awareness: 'Awareness',
  event_booking: 'Event Booking',
  engagement: 'Engagement',
};

const objectiveOptions: { value: CampaignObjective; label: string }[] = [
  { value: 'sales', label: 'Sales' },
  { value: 'launch', label: 'Launch' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'event_booking', label: 'Event Booking' },
  { value: 'engagement', label: 'Engagement' },
];

const channelOptions: { value: CampaignChannel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'x', label: 'X' },
  { value: 'blog', label: 'Blog' },
];

const channelBadge: Record<CampaignChannel, { bg: string; label: string }> = {
  email: { bg: 'bg-blue-100 text-blue-700', label: 'Email' },
  instagram: { bg: 'bg-pink-100 text-pink-700', label: 'IG' },
  facebook: { bg: 'bg-blue-100 text-blue-800', label: 'FB' },
  pinterest: { bg: 'bg-red-100 text-red-700', label: 'Pin' },
  x: { bg: 'bg-gray-100 text-gray-700', label: 'X' },
  blog: { bg: 'bg-green-100 text-green-700', label: 'Blog' },
};

const segmentOptions: { value: AudienceSegment; label: string }[] = [
  { value: 'collector', label: 'Collectors' },
  { value: 'print_buyer', label: 'Print Buyers' },
  { value: 'workshop_attendee', label: 'Workshop Attendees' },
  { value: 'commission_lead', label: 'Commission Leads' },
  { value: 'press', label: 'Press' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'vip', label: 'VIP' },
];

const segmentLabel: Record<AudienceSegment, string> = {
  collector: 'Collectors',
  print_buyer: 'Print Buyers',
  workshop_attendee: 'Workshop',
  commission_lead: 'Commission',
  press: 'Press',
  newsletter: 'Newsletter',
  vip: 'VIP',
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

interface CampaignRow {
  id: string;
  title: string;
  description: string;
  objective: CampaignObjective;
  channels: CampaignChannel[];
  status: CampaignStatus;
  startDate: string;
  endDate: string | null;
  targetSegments: AudienceSegment[];
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  createdAt: string;
}

interface CampaignFormState {
  title: string;
  description: string;
  objective: CampaignObjective;
  channels: CampaignChannel[];
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  targetSegments: AudienceSegment[];
}

const emptyForm: CampaignFormState = {
  title: '',
  description: '',
  objective: 'sales',
  channels: [],
  status: 'draft',
  startDate: '',
  endDate: '',
  targetSegments: [],
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CampaignStatus | 'all'>('all');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);

      const res = await fetch(`/api/campaigns?${params}`);
      if (!res.ok) throw new Error('Failed to load campaigns');
      const json = await res.json();
      setCampaigns(json.campaigns || json.data || []);
      if (json.statusCounts) {
        setStatusCounts(json.statusCounts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const getTabCount = (tabValue: string) => {
    if (tabValue === 'all') return campaigns.length || statusCounts.all || 0;
    return statusCounts[tabValue] || 0;
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (campaign: CampaignRow) => {
    setEditingId(campaign.id);
    setForm({
      title: campaign.title,
      description: campaign.description,
      objective: campaign.objective,
      channels: campaign.channels,
      status: campaign.status,
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      targetSegments: campaign.targetSegments,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const body = {
        title: form.title,
        description: form.description,
        objective: form.objective,
        channels: form.channels,
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        targetSegments: form.targetSegments,
      };

      const url = editingId ? `/api/campaigns/${editingId}` : '/api/campaigns';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save campaign');
      }

      closeModal();
      fetchCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  // Duplicate campaign
  const duplicateCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'duplicate' }),
      });
      if (!res.ok) throw new Error('Failed to duplicate');
      fetchCampaigns();
    } catch {
      alert('Failed to duplicate campaign');
    }
  };

  // Pause/Resume
  const togglePauseResume = async (campaign: CampaignRow) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
      );
    } catch {
      alert('Failed to update campaign status');
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/campaigns/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteId(null);
      setDeleteTitle('');
      fetchCampaigns();
    } catch {
      alert('Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteId) {
          setDeleteId(null);
          setDeleteTitle('');
        } else if (modalOpen) {
          closeModal();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen, deleteId]);

  // Toggle multi-select helper
  const toggleChannel = (ch: CampaignChannel) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  };

  const toggleSegment = (seg: AudienceSegment) => {
    setForm((prev) => ({
      ...prev,
      targetSegments: prev.targetSegments.includes(seg)
        ? prev.targetSegments.filter((s) => s !== seg)
        : [...prev.targetSegments, seg],
    }));
  };

  const filtered = activeTab === 'all'
    ? campaigns
    : campaigns.filter((c) => c.status === activeTab);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Campaign Manager
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage marketing campaigns across all channels.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            + Create Campaign
          </button>
        </div>

        {/* Status Tabs */}
        <div className="mt-6 flex gap-1 border-b border-gray-200">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.value
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">
                {getTabCount(tab.value)}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-400 ml-3">Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="mt-12 text-center">
            <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="mt-2 text-sm text-gray-600 underline hover:text-gray-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Campaign Cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                        {campaign.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColor[campaign.status]
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>

                    {/* Objective */}
                    <div className="mt-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          objectiveColor[campaign.objective]
                        }`}
                      >
                        {objectiveLabel[campaign.objective]}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Channels */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {campaign.channels.map((ch) => (
                        <span
                          key={ch}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${channelBadge[ch].bg}`}
                        >
                          {channelBadge[ch].label}
                        </span>
                      ))}
                    </div>

                    {/* Target Segments */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {campaign.targetSegments.map((seg) => (
                        <span
                          key={seg}
                          className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500"
                        >
                          {segmentLabel[seg]}
                        </span>
                      ))}
                    </div>

                    {/* Dates */}
                    <div className="mt-3 text-xs text-gray-400">
                      {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : ''}
                      {campaign.endDate ? ` — ${new Date(campaign.endDate).toLocaleDateString()}` : ''}
                    </div>

                    {/* Metrics Summary */}
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-gray-50 p-2">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-900">
                          {formatNumber(campaign.metrics.impressions)}
                        </p>
                        <p className="text-[10px] text-gray-400">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-900">
                          {formatNumber(campaign.metrics.clicks)}
                        </p>
                        <p className="text-[10px] text-gray-400">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-900">
                          {campaign.metrics.conversions}
                        </p>
                        <p className="text-[10px] text-gray-400">Conversions</p>
                      </div>
                    </div>

                    {campaign.metrics.revenue > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        Revenue:{' '}
                        <span className="font-medium text-gray-800">
                          {formatCurrency(campaign.metrics.revenue)}
                        </span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() => openEditModal(campaign)}
                        className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => duplicateCampaign(campaign.id)}
                        className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Duplicate
                      </button>
                      {(campaign.status === 'active' || campaign.status === 'paused') && (
                        <button
                          onClick={() => togglePauseResume(campaign)}
                          className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {campaign.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDeleteId(campaign.id);
                          setDeleteTitle(campaign.title);
                        }}
                        className="ml-auto rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-12 text-center">
                <p className="text-sm text-gray-400">
                  No campaigns found with the selected filter.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-lg z-10 my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Campaign' : 'Create Campaign'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    placeholder="Campaign title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
                    placeholder="Describe the campaign..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Objective *</label>
                    <select
                      required
                      value={form.objective}
                      onChange={(e) => setForm((prev) => ({ ...prev, objective: e.target.value as CampaignObjective }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      {objectiveOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as CampaignStatus }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Channels multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Channels</label>
                  <div className="flex flex-wrap gap-2">
                    {channelOptions.map((ch) => (
                      <button
                        key={ch.value}
                        type="button"
                        onClick={() => toggleChannel(ch.value)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                          form.channels.includes(ch.value)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Segments multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Segments</label>
                  <div className="flex flex-wrap gap-2">
                    {segmentOptions.map((seg) => (
                      <button
                        key={seg.value}
                        type="button"
                        onClick={() => toggleSegment(seg.value)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                          form.targetSegments.includes(seg.value)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Save Changes' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => { setDeleteId(null); setDeleteTitle(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md z-10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Delete Campaign</h3>
                  <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium">&ldquo;{deleteTitle}&rdquo;</span>?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => { setDeleteId(null); setDeleteTitle(''); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
