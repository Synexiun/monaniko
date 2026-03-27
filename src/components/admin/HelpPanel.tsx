"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, HelpCircle, Zap, GitBranch, Code2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminHelp, type HelpItem } from "@/data/admin-help";

type Tab = "workflow" | "logic" | "technical";

const tabs: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "workflow", label: "Workflow", icon: Zap, color: "text-amber-600" },
  { id: "logic", label: "Logic", icon: GitBranch, color: "text-blue-600" },
  { id: "technical", label: "Technical", icon: Code2, color: "text-emerald-600" },
];

function AccordionItem({ item }: { item: HelpItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-[12px] font-semibold text-gray-800 leading-snug pr-2">{item.heading}</span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-3.5 pb-3 pt-1 text-[11.5px] leading-relaxed text-gray-600 bg-gray-50/70 border-t border-gray-100">
              {item.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HelpPanelProps {
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpPanel({ pathname, isOpen, onClose }: HelpPanelProps) {
  const [tab, setTab] = useState<Tab>("workflow");

  // Find best matching help entry (exact match first, then prefix match)
  const helpData =
    adminHelp[pathname] ||
    Object.entries(adminHelp)
      .filter(([key]) => pathname.startsWith(key) && key !== "/admin")
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    adminHelp["/admin"];

  const items: HelpItem[] = helpData[tab];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 xl:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[340px] bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white/60 uppercase tracking-widest leading-none mb-0.5">Help Center</p>
                  <p className="text-[13px] font-semibold text-white leading-none">{helpData.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close help panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-[11.5px] text-gray-600 leading-relaxed">{helpData.description}</p>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-gray-100 bg-white">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors border-b-2",
                      active
                        ? `${t.color} border-current bg-gray-50`
                        : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Level Badge */}
            <div className="px-4 pt-3 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                  tab === "workflow" && "bg-amber-100 text-amber-700",
                  tab === "logic" && "bg-blue-100 text-blue-700",
                  tab === "technical" && "bg-emerald-100 text-emerald-700",
                )}>
                  {tab === "workflow" && <Zap className="w-2.5 h-2.5" />}
                  {tab === "logic" && <GitBranch className="w-2.5 h-2.5" />}
                  {tab === "technical" && <Code2 className="w-2.5 h-2.5" />}
                  {tab === "workflow" ? "Day-to-day usage" : tab === "logic" ? "Business rules" : "APIs & data"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 space-y-2">
              {items.map((item, i) => (
                <AccordionItem key={i} item={item} />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <a
                href="/admin/help"
                className="flex items-center gap-2 text-[11px] text-gray-500 hover:text-gray-900 transition-colors group"
              >
                <span>Full Help Center & Support Tickets</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
