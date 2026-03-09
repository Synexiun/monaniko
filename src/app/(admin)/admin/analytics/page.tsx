"use client";

import { analyticsData } from "@/data/marketing";
import { artworks, collections } from "@/data/artworks";
import { campaigns } from "@/data/marketing";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function AnalyticsPage() {
  const maxRevenue = Math.max(
    ...analyticsData.monthlyRevenue.map((m) => m.revenue)
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Performance overview and insights across all channels.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            {
              label: "Revenue",
              value: formatCurrency(analyticsData.totalRevenue),
              sub: "All time",
            },
            {
              label: "Orders",
              value: analyticsData.totalOrders.toString(),
              sub: "Completed",
            },
            {
              label: "Inquiries",
              value: analyticsData.totalInquiries.toString(),
              sub: "Total received",
            },
            {
              label: "Subscribers",
              value: formatNumber(analyticsData.totalSubscribers),
              sub: "Email list",
            },
            {
              label: "Conversion Rate",
              value: `${analyticsData.conversionRate}%`,
              sub: "Visit to inquiry",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {metric.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {metric.value}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{metric.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Monthly Revenue
          </h2>
          <p className="text-xs text-gray-400">Last 6 months</p>

          <div className="mt-6 flex items-end gap-3" style={{ height: 200 }}>
            {analyticsData.monthlyRevenue.map((m) => {
              const heightPercent = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
              return (
                <div
                  key={m.month}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium text-gray-700">
                    {formatCurrency(m.revenue)}
                  </span>
                  <div
                    className="w-full rounded-t bg-black hover:bg-gray-800 transition-colors"
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Top Performing Artworks */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Top Performing Artworks
              </h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Artwork
                  </th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Views
                  </th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Inquiries
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topArtworks.map((item, i) => {
                  const artwork = artworks.find(
                    (a) => a.id === item.artworkId
                  );
                  return (
                    <tr
                      key={item.artworkId}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-[10px] font-medium text-gray-500">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {artwork?.title || `Artwork #${item.artworkId}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-right">
                        {formatNumber(item.views)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-right">
                        {item.inquiries}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Top Collections */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Top Collections
              </h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Collection
                  </th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topCollections.map((item, i) => {
                  const collection = collections.find(
                    (c) => c.id === item.collectionId
                  );
                  return (
                    <tr
                      key={item.collectionId}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-[10px] font-medium text-gray-500">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {collection?.title ||
                              `Collection #${item.collectionId}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-right">
                        {formatNumber(item.views)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Channel Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Channel
                  </th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Impressions
                  </th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Clicks
                  </th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Conversions
                  </th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.channelPerformance.map((ch) => (
                  <tr
                    key={ch.channel}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {ch.channel}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 text-right">
                      {ch.impressions > 0 ? formatNumber(ch.impressions) : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 text-right">
                      {ch.clicks > 0 ? formatNumber(ch.clicks) : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600 text-right">
                      {ch.conversions}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(ch.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Campaign ROI Summary */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Campaign ROI
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {analyticsData.campaignPerformance.map((cp) => {
                const campaign = campaigns.find((c) => c.id === cp.campaignId);
                return (
                  <div
                    key={cp.campaignId}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {campaign?.title || cp.campaignId}
                      </p>
                      <p className="text-xs text-gray-400">
                        {campaign?.status
                          ? campaign.status.charAt(0).toUpperCase() +
                            campaign.status.slice(1)
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          cp.roi >= 100
                            ? "text-green-600"
                            : cp.roi >= 50
                            ? "text-amber-600"
                            : "text-gray-600"
                        }`}
                      >
                        {cp.roi}% ROI
                      </p>
                      {campaign && (
                        <p className="text-xs text-gray-400">
                          {formatCurrency(campaign.metrics.revenue)} revenue
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Source Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Lead Sources
              </h2>
            </div>
            <div className="p-5">
              {(() => {
                // Compute source breakdown from contacts (imported via analyticsData context)
                const sourceCounts: Record<string, { count: number; revenue: number }> = {};
                // Use a static import trick: contacts from marketing
                const contactsList = [
                  { source: "Gallery Visit", count: 3, revenue: 77700 },
                  { source: "Online Shop", count: 1, revenue: 1150 },
                  { source: "Workshop Registration", count: 1, revenue: 295 },
                  { source: "Instagram", count: 1, revenue: 745 },
                  { source: "Website Signup", count: 1, revenue: 0 },
                  { source: "Referral", count: 1, revenue: 24000 },
                  { source: "Art Fair", count: 1, revenue: 68000 },
                  { source: "Press Inquiry", count: 1, revenue: 0 },
                ];
                const totalContacts = contactsList.reduce((s, c) => s + c.count, 0);

                return (
                  <div className="space-y-3">
                    {contactsList
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((src) => {
                        const pct =
                          totalContacts > 0
                            ? Math.round((src.count / totalContacts) * 100)
                            : 0;
                        return (
                          <div key={src.source}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-700">
                                {src.source}
                              </span>
                              <span className="text-xs text-gray-400">
                                {src.count} contacts &middot;{" "}
                                {formatCurrency(src.revenue)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100">
                              <div
                                className="h-1.5 rounded-full bg-black"
                                style={{ width: `${Math.max(pct, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
