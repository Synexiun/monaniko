'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Globe,
  Clock,
  Share2,
  Search as SearchIcon,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface SettingsState {
  gallery: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
  };
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  social: {
    instagram: string;
    facebook: string;
    pinterest: string;
    x: string;
    youtube: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
  };
}

const defaultSettings: SettingsState = {
  gallery: {
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  },
  hours: {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  },
  social: {
    instagram: '',
    facebook: '',
    pinterest: '',
    x: '',
    youtube: '',
  },
  seo: {
    defaultTitle: '',
    defaultDescription: '',
  },
};

/** Convert a flat key-value map from the API into nested SettingsState */
function apiToState(data: Record<string, string>): SettingsState {
  const state: SettingsState = JSON.parse(JSON.stringify(defaultSettings));

  for (const [key, value] of Object.entries(data)) {
    const parts = key.split('.');
    if (parts.length !== 2) continue;
    const [section, field] = parts;

    if (section === 'gallery' && field in state.gallery) {
      (state.gallery as Record<string, string>)[field] = value;
    } else if (section === 'hours' && field in state.hours) {
      (state.hours as Record<string, string>)[field] = value;
    } else if (section === 'social' && field in state.social) {
      (state.social as Record<string, string>)[field] = value;
    } else if (section === 'seo' && field in state.seo) {
      (state.seo as Record<string, string>)[field] = value;
    }
  }

  return state;
}

/** Convert nested SettingsState to flat key-value map for the API */
function stateToApi(state: SettingsState): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [section, fields] of Object.entries(state)) {
    for (const [field, value] of Object.entries(fields as Record<string, string>)) {
      result[`${section}.${field}`] = value;
    }
  }

  return result;
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  helpText,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {helpText && (
        <p className="text-xs text-gray-400 mt-1.5">{helpText}</p>
      )}
    </div>
  );
}

const dayLabels: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data: Record<string, string> = await res.json();
      setSettings(apiToState(data));
    } catch (err) {
      showFeedback('error',
        err instanceof Error ? err.message : 'Failed to load settings'
      );
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateGallery = (
    key: keyof SettingsState['gallery'],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, [key]: value },
    }));
  };

  const updateHours = (
    key: keyof SettingsState['hours'],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      hours: { ...prev.hours, [key]: value },
    }));
  };

  const updateSocial = (
    key: keyof SettingsState['social'],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: value },
    }));
  };

  const updateSeo = (key: keyof SettingsState['seo'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      seo: { ...prev.seo, [key]: value },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = stateToApi(settings);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to save settings');
      }
      const data: Record<string, string> = await res.json();
      setSettings(apiToState(data));
      showFeedback('success', 'Settings saved successfully');
    } catch (err) {
      showFeedback('error',
        err instanceof Error ? err.message : 'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    try {
      setResetting(true);
      const res = await fetch('/api/settings/reset', { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to reset database');
      }
      showFeedback('success', 'Database has been reset successfully');
      setConfirmReset(false);
      await fetchSettings();
    } catch (err) {
      showFeedback('error',
        err instanceof Error ? err.message : 'Failed to reset database'
      );
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <motion.div {...fadeIn} className="flex flex-col items-center justify-center py-32 max-w-3xl">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading settings...</p>
      </motion.div>
    );
  }

  const isFormDisabled = saving;

  return (
    <motion.div {...fadeIn} className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your gallery configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all',
            saving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          )}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium',
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          )}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-current opacity-60 hover:opacity-100 ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Gallery Information */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Globe className="w-5 h-5 text-gray-400" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Gallery Information
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Basic information about your gallery
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <InputField
            label="Gallery Name"
            value={settings.gallery.name}
            onChange={(v) => updateGallery('name', v)}
            disabled={isFormDisabled}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Email"
              type="email"
              value={settings.gallery.email}
              onChange={(v) => updateGallery('email', v)}
              disabled={isFormDisabled}
            />
            <InputField
              label="Phone"
              type="tel"
              value={settings.gallery.phone}
              onChange={(v) => updateGallery('phone', v)}
              disabled={isFormDisabled}
            />
          </div>
          <InputField
            label="Address Line 1"
            value={settings.gallery.addressLine1}
            onChange={(v) => updateGallery('addressLine1', v)}
            disabled={isFormDisabled}
          />
          <InputField
            label="Address Line 2"
            value={settings.gallery.addressLine2}
            onChange={(v) => updateGallery('addressLine2', v)}
            placeholder="Suite, unit, building, etc."
            disabled={isFormDisabled}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField
              label="City"
              value={settings.gallery.city}
              onChange={(v) => updateGallery('city', v)}
              disabled={isFormDisabled}
            />
            <InputField
              label="State"
              value={settings.gallery.state}
              onChange={(v) => updateGallery('state', v)}
              disabled={isFormDisabled}
            />
            <InputField
              label="ZIP Code"
              value={settings.gallery.zip}
              onChange={(v) => updateGallery('zip', v)}
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Business Hours
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Set your gallery opening hours
            </p>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {(Object.keys(settings.hours) as (keyof SettingsState['hours'])[]).map(
            (day) => (
              <div
                key={day}
                className="flex items-center gap-4"
              >
                <label className="text-sm font-medium text-gray-700 w-28 flex-shrink-0">
                  {dayLabels[day]}
                </label>
                <input
                  type="text"
                  value={settings.hours[day]}
                  onChange={(e) => updateHours(day, e.target.value)}
                  disabled={isFormDisabled}
                  className="flex-1 max-w-xs px-3.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., 10:00 AM - 6:00 PM"
                />
              </div>
            )
          )}
        </div>
      </section>

      {/* Social Media */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Share2 className="w-5 h-5 text-gray-400" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Social Media
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Links to your social media profiles
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <InputField
            label="Instagram"
            value={settings.social.instagram}
            onChange={(v) => updateSocial('instagram', v)}
            placeholder="https://instagram.com/yourusername"
            disabled={isFormDisabled}
          />
          <InputField
            label="Facebook"
            value={settings.social.facebook}
            onChange={(v) => updateSocial('facebook', v)}
            placeholder="https://facebook.com/yourpage"
            disabled={isFormDisabled}
          />
          <InputField
            label="Pinterest"
            value={settings.social.pinterest}
            onChange={(v) => updateSocial('pinterest', v)}
            placeholder="https://pinterest.com/yourusername"
            disabled={isFormDisabled}
          />
          <InputField
            label="X (Twitter)"
            value={settings.social.x}
            onChange={(v) => updateSocial('x', v)}
            placeholder="https://x.com/yourusername"
            disabled={isFormDisabled}
          />
          <InputField
            label="YouTube"
            value={settings.social.youtube}
            onChange={(v) => updateSocial('youtube', v)}
            placeholder="https://youtube.com/@yourchannel"
            disabled={isFormDisabled}
          />
        </div>
      </section>

      {/* SEO Defaults */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <SearchIcon className="w-5 h-5 text-gray-400" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              SEO Defaults
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Default meta information for search engines
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <InputField
            label="Default Meta Title"
            value={settings.seo.defaultTitle}
            onChange={(v) => updateSeo('defaultTitle', v)}
            placeholder="Your gallery name — tagline"
            disabled={isFormDisabled}
          />
          <TextAreaField
            label="Default Meta Description"
            value={settings.seo.defaultDescription}
            onChange={(v) => updateSeo('defaultDescription', v)}
            rows={3}
            placeholder="A brief description of your gallery for search engines..."
            helpText="Recommended: 150-160 characters for optimal display in search results."
            disabled={isFormDisabled}
          />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-lg border border-red-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <h2 className="text-base font-semibold text-red-900">
              Danger Zone
            </h2>
            <p className="text-xs text-red-500 mt-0.5">
              Irreversible actions that affect your entire database
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Reset Database
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                This will wipe all data and restore the database to its initial
                state. This action cannot be undone.
              </p>
            </div>
            {confirmReset ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setConfirmReset(false)}
                  disabled={resetting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {resetting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  {resetting ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Database
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Save Button */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all',
            saving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          )}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  );
}
