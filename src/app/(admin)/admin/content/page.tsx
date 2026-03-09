"use client";

import { useState, useMemo } from "react";
import type { ScheduledContent } from "@/types";
import { scheduledContent } from "@/data/marketing";

type ViewMode = "calendar" | "list";

const typeColor: Record<ScheduledContent["type"], { dot: string; badge: string; label: string }> = {
  journal_post: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
    label: "Journal",
  },
  campaign_post: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
    label: "Campaign",
  },
  email_blast: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700",
    label: "Email",
  },
  social_post: {
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700",
    label: "Social",
  },
};

const statusBadge: Record<ScheduledContent["status"], string> = {
  scheduled: "bg-blue-50 text-blue-700",
  published: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ContentPage() {
  const [view, setView] = useState<ViewMode>("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);

  // Group content by day for calendar
  const contentByDay = useMemo(() => {
    const map: Record<number, ScheduledContent[]> = {};
    scheduledContent.forEach((item) => {
      const d = new Date(item.scheduledAt);
      if (
        d.getFullYear() === currentMonth.year &&
        d.getMonth() === currentMonth.month
      ) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(item);
      }
    });
    return map;
  }, [currentMonth]);

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  }

  // Calendar grid cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === currentMonth.year &&
    today.getMonth() === currentMonth.month &&
    today.getDate() === day;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Content Scheduler
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Plan and schedule content across all channels.
            </p>
          </div>
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            + Schedule Content
          </button>
        </div>

        {/* View Toggle & Month Nav */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <button
              onClick={prevMonth}
              className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Previous month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </span>
            <button
              onClick={nextMonth}
              className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Next month"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "calendar"
                  ? "bg-black text-white rounded-l-lg"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-black text-white rounded-r-lg"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          {(Object.entries(typeColor) as [ScheduledContent["type"], typeof typeColor[ScheduledContent["type"]]][]).map(
            ([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                <span className="text-xs text-gray-500">{val.label}</span>
              </div>
            )
          )}
        </div>

        {/* Calendar View */}
        {view === "calendar" && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="px-2 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {calendarCells.map((day, i) => (
                <div
                  key={i}
                  className={`min-h-[90px] border-b border-r border-gray-50 p-1.5 ${
                    day === null ? "bg-gray-50/50" : ""
                  } ${isToday(day ?? 0) ? "bg-blue-50/40" : ""}`}
                >
                  {day !== null && (
                    <>
                      <span
                        className={`inline-block text-xs font-medium mb-1 ${
                          isToday(day)
                            ? "bg-black text-white rounded-full w-5 h-5 flex items-center justify-center"
                            : "text-gray-600"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {(contentByDay[day] || []).map((item) => (
                          <div
                            key={item.id}
                            className={`rounded px-1 py-0.5 text-[10px] leading-tight truncate cursor-pointer ${
                              typeColor[item.type].badge
                            }`}
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Title
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Scheduled
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...scheduledContent]
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledAt).getTime() -
                      new Date(b.scheduledAt).getTime()
                  )
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {item.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                            typeColor[item.type].badge
                          }`}
                        >
                          {typeColor[item.type].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        {item.channel || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.scheduledAt)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTime(item.scheduledAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                            statusBadge[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                            Edit
                          </button>
                          <button className="text-xs text-red-500 hover:text-red-700 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {scheduledContent.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">
                No content scheduled.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
