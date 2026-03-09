"use client";

import { useState } from "react";
import type { CampaignStatus, CampaignObjective, CampaignChannel, AudienceSegment } from "@/types";
import { campaigns } from "@/data/marketing";

const statusTabs: { label: string; value: CampaignStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

const statusColor: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-50 text-blue-700",
  active: "bg-green-50 text-green-700",
  completed: "bg-gray-200 text-gray-800",
  paused: "bg-yellow-50 text-yellow-700",
};

const objectiveColor: Record<CampaignObjective, string> = {
  sales: "bg-emerald-50 text-emerald-700",
  launch: "bg-purple-50 text-purple-700",
  awareness: "bg-sky-50 text-sky-700",
  event_booking: "bg-orange-50 text-orange-700",
  engagement: "bg-pink-50 text-pink-700",
};

const objectiveLabel: Record<CampaignObjective, string> = {
  sales: "Sales",
  launch: "Launch",
  awareness: "Awareness",
  event_booking: "Event Booking",
  engagement: "Engagement",
};

const channelBadge: Record<CampaignChannel, { bg: string; label: string }> = {
  email: { bg: "bg-blue-100 text-blue-700", label: "Email" },
  instagram: { bg: "bg-pink-100 text-pink-700", label: "IG" },
  facebook: { bg: "bg-blue-100 text-blue-800", label: "FB" },
  pinterest: { bg: "bg-red-100 text-red-700", label: "Pin" },
  x: { bg: "bg-gray-100 text-gray-700", label: "X" },
  blog: { bg: "bg-green-100 text-green-700", label: "Blog" },
};

const segmentLabel: Record<AudienceSegment, string> = {
  collector: "Collectors",
  print_buyer: "Print Buyers",
  workshop_attendee: "Workshop",
  commission_lead: "Commission",
  press: "Press",
  newsletter: "Newsletter",
  vip: "VIP",
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<CampaignStatus | "all">("all");

  const filtered =
    activeTab === "all"
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
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
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
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">
                {tab.value === "all"
                  ? campaigns.length
                  : campaigns.filter((c) => c.status === tab.value).length}
              </span>
            </button>
          ))}
        </div>

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
                    {campaign.status.charAt(0).toUpperCase() +
                      campaign.status.slice(1)}
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
                  {campaign.startDate}
                  {campaign.endDate ? ` — ${campaign.endDate}` : ""}
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
                    Revenue:{" "}
                    <span className="font-medium text-gray-800">
                      {formatCurrency(campaign.metrics.revenue)}
                    </span>
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  <button className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                    Duplicate
                  </button>
                  {(campaign.status === "active" ||
                    campaign.status === "paused") && (
                    <button className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                      {campaign.status === "active" ? "Pause" : "Resume"}
                    </button>
                  )}
                  <button className="ml-auto rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors">
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
      </div>
    </div>
  );
}
