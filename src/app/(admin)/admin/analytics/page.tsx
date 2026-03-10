"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalInquiries: number;
    totalSubscribers: number;
  };
  trends: {
    orders: { current: number; previous: number };
    revenue: { current: number; previous: number };
  };
  topArtworksByInquiries: {
    artworkId: string;
    title: string;
    inquiryCount: number;
  }[];
  campaignMetrics: {
    id: string;
    title: string;
    metrics: string;
    status: string;
  }[];
  monthlyRevenue: { month: string; revenue: number }[];
  collectionPerformance: {
    id: string;
    title: string;
    artworkCount: number;
  }[];
  inquiryTypeBreakdown: { type: string; count: number }[];
}

interface ParsedCampaignMetrics {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  spent?: number;
  spend?: number;
  roi?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

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

function computeTrend(
  current: number,
  previous: number
): { value: number; isPositive: boolean } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { value: 100, isPositive: true };
  const change = Math.round(
    ((current - previous) / previous) * 100
  );
  return { value: Math.abs(change), isPositive: change >= 0 };
}

function parseCampaignMetrics(metricsJson: string): ParsedCampaignMetrics {
  try {
    return JSON.parse(metricsJson);
  } catch {
    return {};
  }
}

function formatInquiryType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// ─── Trend Badge Component ──────────────────────────────────────────────────────

function TrendBadge({
  trend,
}: {
  trend: { value: number; isPositive: boolean } | null;
}) {
  if (!trend) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        trend.isPositive
          ? "text-emerald-700 bg-emerald-50"
          : "text-red-700 bg-red-50"
      }`}
    >
      {trend.isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {trend.isPositive ? "+" : "-"}
      {trend.value}%
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Loading performance data...</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 mb-4" />
                  <div className="h-7 w-24 rounded bg-gray-100 mb-2" />
                  <div className="h-4 w-16 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="h-5 w-36 rounded bg-gray-100 mb-1" />
              <div className="h-3 w-24 rounded bg-gray-100 mb-6" />
              <div className="flex items-end gap-3" style={{ height: 200 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className="h-3 w-10 rounded bg-gray-100" />
                    <div
                      className="w-full rounded-t bg-gray-100"
                      style={{
                        height: `${30 + ((i * 15) % 60)}%`,
                      }}
                    />
                    <div className="h-2 w-8 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            <span className="text-sm text-gray-400 ml-2">
              Fetching analytics data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </div>
          <div className="mt-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load analytics
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {error || "No data available"}
            </p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Derived Values ─────────────────────────────────────────────────────────

  const {
    overview,
    trends,
    topArtworksByInquiries,
    campaignMetrics,
    monthlyRevenue,
    collectionPerformance,
    inquiryTypeBreakdown,
  } = data;

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const revenueTrend = computeTrend(
    trends.revenue.current,
    trends.revenue.previous
  );
  const ordersTrend = computeTrend(
    trends.orders.current,
    trends.orders.previous
  );

  const totalInquiryCount = inquiryTypeBreakdown.reduce(
    (s, i) => s + i.count,
    0
  );

  // Parse campaign metrics for ROI display
  const parsedCampaigns = campaignMetrics.map((c) => {
    const m = parseCampaignMetrics(c.metrics);
    const spend = m.spent ?? m.spend ?? 0;
    const revenue = m.revenue ?? 0;
    const roi =
      m.roi != null
        ? m.roi
        : spend > 0
        ? Math.round(((revenue - spend) / spend) * 100)
        : 0;
    return { ...c, parsed: m, roi, parsedRevenue: revenue };
  });

  // ── Metric Cards Config ────────────────────────────────────────────────────

  const metricCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(overview.totalRevenue),
      icon: DollarSign,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: revenueTrend,
      sub: "All time",
    },
    {
      label: "Total Orders",
      value: formatNumber(overview.totalOrders),
      icon: ShoppingCart,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: ordersTrend,
      sub: "Completed",
    },
    {
      label: "Inquiries",
      value: formatNumber(overview.totalInquiries),
      icon: MessageSquare,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: null,
      sub: "Total received",
    },
    {
      label: "Subscribers",
      value: formatNumber(overview.totalSubscribers),
      icon: Users,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: null,
      sub: "Active email list",
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Performance overview and insights across all channels.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.color}`}
                  >
                    <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                  </div>
                  <TrendBadge trend={metric.trend} />
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{metric.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Monthly Revenue Chart */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            Monthly Revenue
          </h2>
          <p className="text-xs text-gray-400">Last 6 months</p>

          {monthlyRevenue.length > 0 ? (
            <div
              className="mt-6 flex items-end gap-3"
              style={{ height: 200 }}
            >
              {monthlyRevenue.map((m) => {
                const heightPercent =
                  maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
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
          ) : (
            <div className="mt-6 flex items-center justify-center h-[200px] text-sm text-gray-400">
              No revenue data available yet.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Top Performing Artworks (by Inquiries) */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Top Artworks by Inquiries
              </h2>
            </div>
            {topArtworksByInquiries.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 text-left">
                    <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Artwork
                    </th>
                    <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                      Inquiries
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topArtworksByInquiries.map((item, i) => (
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
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-right">
                        {item.inquiryCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No artwork inquiries recorded yet.
              </div>
            )}
          </div>

          {/* Collections */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Collections
              </h2>
            </div>
            {collectionPerformance.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 text-left">
                    <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Collection
                    </th>
                    <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                      Artworks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...collectionPerformance]
                    .sort((a, b) => b.artworkCount - a.artworkCount)
                    .map((item, i) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-[10px] font-medium text-gray-500">
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600 text-right">
                          {item.artworkCount}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No collections created yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Campaign ROI */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Campaign ROI
              </h2>
            </div>
            {parsedCampaigns.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {parsedCampaigns.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cp.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            cp.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : cp.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700"
                              : cp.status === "PAUSED"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {cp.status.charAt(0) +
                            cp.status.slice(1).toLowerCase()}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          cp.roi >= 100
                            ? "text-emerald-600"
                            : cp.roi >= 50
                            ? "text-amber-600"
                            : "text-gray-600"
                        }`}
                      >
                        {cp.roi}% ROI
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(cp.parsedRevenue)} revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No campaign data available.
              </div>
            )}
          </div>

          {/* Inquiry Type Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Inquiry Types
              </h2>
            </div>
            <div className="p-5">
              {inquiryTypeBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {inquiryTypeBreakdown.map((src) => {
                    const pct =
                      totalInquiryCount > 0
                        ? Math.round(
                            (src.count / totalInquiryCount) * 100
                          )
                        : 0;
                    return (
                      <div key={src.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">
                            {formatInquiryType(src.type)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {src.count}{" "}
                            {src.count === 1 ? "inquiry" : "inquiries"} (
                            {pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-black"
                            style={{
                              width: `${Math.max(pct, 2)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No inquiry data available yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
