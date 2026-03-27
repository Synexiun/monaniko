"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  artworkTitle: string;
  artworkImage: string;
  artworkId: string;
  artworkYear?: number;
  artworkMedium?: string;
}

export default function InquiryModal({
  isOpen,
  onClose,
  artworkTitle,
  artworkImage,
  artworkId,
  artworkYear,
  artworkMedium,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I am interested in "${artworkTitle}" by Mona Niko and would like to learn more about this piece — including availability, pricing, and shipping options. Please get in touch with me at your earliest convenience.`,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "artwork",
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          artworkId,
          artworkTitle,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setSuccess(false);
      setError("");
      setForm((f) => ({ ...f, name: "", email: "", phone: "" }));
    }, 300);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C4A265]">
                    Artwork Inquiry
                  </p>
                  <h2 className="font-serif text-xl text-gray-900 mt-0.5">
                    {artworkTitle}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                /* ── Success State ── */
                <div className="px-6 py-16 text-center">
                  <div className="flex justify-center mb-5">
                    <CheckCircle className="w-14 h-14 text-[#C4A265]" />
                  </div>
                  <h3 className="font-serif text-2xl text-gray-900 mb-3">
                    Inquiry Sent
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
                    Thank you for your interest in <em>{artworkTitle}</em>. We
                    will be in touch within 24 hours.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-8 py-2.5 bg-gray-900 text-white text-sm font-medium tracking-wide hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit}>
                  {/* Artwork preview strip */}
                  <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden">
                      <Image
                        src={artworkImage}
                        alt={artworkTitle}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {artworkTitle}
                      </p>
                      {(artworkYear || artworkMedium) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {artworkYear}
                          {artworkYear && artworkMedium && " · "}
                          {artworkMedium}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-6 space-y-5">
                    {/* Name + Phone row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-500 mb-1.5">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          placeholder="Your name"
                          className="w-full px-3.5 py-2.5 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-500 mb-1.5">
                          Phone Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3.5 py-2.5 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-500 mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3.5 py-2.5 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-500 mb-1.5">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors resize-none"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        We typically respond within 24 hours.
                        <br />All inquiries are handled confidentially.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-7 py-3 bg-gray-900 text-white text-sm font-medium tracking-wide hover:bg-[#C4A265] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {submitting ? "Sending…" : "Send Inquiry"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
