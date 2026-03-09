"use client";

import { useState, useMemo } from "react";
import type { AudienceSegment } from "@/types";
import { contacts } from "@/data/marketing";

type SegmentFilter = AudienceSegment | "all";

const segmentFilters: { label: string; value: SegmentFilter }[] = [
  { label: "All", value: "all" },
  { label: "Collectors", value: "collector" },
  { label: "Print Buyers", value: "print_buyer" },
  { label: "Workshop Attendees", value: "workshop_attendee" },
  { label: "Commission Leads", value: "commission_lead" },
  { label: "Press", value: "press" },
  { label: "Newsletter", value: "newsletter" },
  { label: "VIP", value: "vip" },
];

const segmentBadge: Record<AudienceSegment, { bg: string; label: string }> = {
  collector: { bg: "bg-purple-50 text-purple-700", label: "Collector" },
  print_buyer: { bg: "bg-blue-50 text-blue-700", label: "Print Buyer" },
  workshop_attendee: { bg: "bg-green-50 text-green-700", label: "Workshop" },
  commission_lead: { bg: "bg-orange-50 text-orange-700", label: "Commission" },
  press: { bg: "bg-pink-50 text-pink-700", label: "Press" },
  newsletter: { bg: "bg-gray-100 text-gray-600", label: "Newsletter" },
  vip: { bg: "bg-amber-50 text-amber-700", label: "VIP" },
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AudiencePage() {
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = contacts;
    if (segmentFilter !== "all") {
      result = result.filter((c) => c.segments.includes(segmentFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.firstName?.toLowerCase() || "").includes(q) ||
          (c.lastName?.toLowerCase() || "").includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [segmentFilter, search]);

  // Stats
  const totalContacts = contacts.length;
  const newThisMonth = contacts.filter((c) => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const vipCount = contacts.filter((c) => c.segments.includes("vip")).length;
  const emailOpenRate = 38.4; // Mocked

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Audience</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage contacts, segments, and relationships.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Export
            </button>
            <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
              + Add Contact
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Contacts", value: totalContacts.toString() },
            { label: "New This Month", value: newThisMonth.toString() },
            { label: "VIP Collectors", value: vipCount.toString() },
            { label: "Email Open Rate", value: `${emailOpenRate}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Segment Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {segmentFilters.map((seg) => (
            <button
              key={seg.value}
              onClick={() => setSegmentFilter(seg.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                segmentFilter === seg.value
                  ? "bg-black text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        {/* Contacts Table */}
        <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Segments
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Source
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Last Activity
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                          {(contact.firstName?.[0] || "")}{(contact.lastName?.[0] || "")}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {contact.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {contact.segments.map((seg) => (
                          <span
                            key={seg}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${segmentBadge[seg].bg}`}
                          >
                            {segmentBadge[seg].label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {contact.source}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(contact.lastActivity)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {contact.totalSpent > 0
                        ? formatCurrency(contact.totalSpent)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                          View
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">
              No contacts found.
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Showing {filtered.length} of {totalContacts} contacts
        </p>
      </div>
    </div>
  );
}
