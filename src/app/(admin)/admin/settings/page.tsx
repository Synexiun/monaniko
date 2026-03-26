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
  Plug,
  CreditCard,
  Cloud,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
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

interface IntegrationField {
  value: string;
  masked: string;
  isSet: boolean;
}

type IntegrationKeys =
  | 'STRIPE_SECRET_KEY'
  | 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  | 'STRIPE_WEBHOOK_SECRET'
  | 'CLOUDINARY_CLOUD_NAME'
  | 'CLOUDINARY_API_KEY'
  | 'CLOUDINARY_API_SECRET'
  | 'RESEND_API_KEY'
  | 'ADMIN_EMAIL'
  | 'FROM_EMAIL'
  | 'FROM_NAME';

type IntegrationsState = Record<IntegrationKeys, IntegrationField>;

const integrationGroups = [
  {
    title: 'Stripe (Payments)',
    icon: CreditCard,
    description: 'Accept payments through Stripe. Get your keys from the Stripe Dashboard under Developers > API keys.',
    fields: [
      { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' as IntegrationKeys, label: 'Publishable Key', placeholder: 'pk_test_...', sensitive: false },
      { key: 'STRIPE_SECRET_KEY' as IntegrationKeys, label: 'Secret Key', placeholder: 'sk_test_...', sensitive: true },
      { key: 'STRIPE_WEBHOOK_SECRET' as IntegrationKeys, label: 'Webhook Secret', placeholder: 'whsec_...', sensitive: true },
    ],
  },
  {
    title: 'Cloudinary (Image Uploads)',
    icon: Cloud,
    description: 'Upload and serve artwork images via Cloudinary CDN. Find your credentials in the Cloudinary Dashboard.',
    fields: [
      { key: 'CLOUDINARY_CLOUD_NAME' as IntegrationKeys, label: 'Cloud Name', placeholder: 'your-cloud-name', sensitive: false },
      { key: 'CLOUDINARY_API_KEY' as IntegrationKeys, label: 'API Key', placeholder: '123456789012345', sensitive: false },
      { key: 'CLOUDINARY_API_SECRET' as IntegrationKeys, label: 'API Secret', placeholder: 'your-api-secret', sensitive: true },
    ],
  },
  {
    title: 'Resend (Email)',
    icon: Mail,
    description: 'Send transactional emails (order confirmations, inquiries, blasts). Get your API key from resend.com.',
    fields: [
      { key: 'RESEND_API_KEY' as IntegrationKeys, label: 'API Key', placeholder: 're_...', sensitive: true },
      { key: 'ADMIN_EMAIL' as IntegrationKeys, label: 'Admin Email', placeholder: 'admin@yourdomain.com', sensitive: false },
      { key: 'FROM_EMAIL' as IntegrationKeys, label: 'From Email', placeholder: 'noreply@yourdomain.com', sensitive: false },
      { key: 'FROM_NAME' as IntegrationKeys, label: 'From Name', placeholder: 'Mona Niko Gallery', sensitive: false },
    ],
  },
];

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

  // Integrations state
  const [integrations, setIntegrations] = useState<IntegrationsState | null>(null);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);
  const [integrationsSaving, setIntegrationsSaving] = useState(false);
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

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

  const fetchIntegrations = useCallback(async () => {
    try {
      setIntegrationsLoading(true);
      const res = await fetch('/api/settings/integrations');
      if (!res.ok) throw new Error('Failed to fetch integrations');
      const data: IntegrationsState = await res.json();
      setIntegrations(data);
    } catch (err) {
      showFeedback('error',
        err instanceof Error ? err.message : 'Failed to load integrations'
      );
    } finally {
      setIntegrationsLoading(false);
    }
  }, [showFeedback]);

  const handleSaveIntegrations = async () => {
    if (Object.keys(editingKeys).length === 0) {
      showFeedback('error', 'No changes to save');
      return;
    }
    try {
      setIntegrationsSaving(true);
      const res = await fetch('/api/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingKeys),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to save integrations');
      }
      const data: IntegrationsState = await res.json();
      setIntegrations(data);
      setEditingKeys({});
      setRevealedKeys(new Set());
      showFeedback('success', 'Integrations saved. Restart the dev server for changes to take effect.');
    } catch (err) {
      showFeedback('error',
        err instanceof Error ? err.message : 'Failed to save integrations'
      );
    } finally {
      setIntegrationsSaving(false);
    }
  };

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const startEditing = (key: string, currentValue: string) => {
    setEditingKeys((prev) => ({ ...prev, [key]: currentValue }));
    setRevealedKeys((prev) => new Set(prev).add(key));
  };

  const updateEditingKey = (key: string, value: string) => {
    setEditingKeys((prev) => ({ ...prev, [key]: value }));
  };

  const cancelEditing = (key: string) => {
    setEditingKeys((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  useEffect(() => {
    fetchSettings();
    fetchIntegrations();
  }, [fetchSettings, fetchIntegrations]);

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

      {/* Integrations */}
      <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Plug className="w-5 h-5 text-gray-400" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Integrations
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                API keys and credentials for third-party services
              </p>
            </div>
          </div>
          {Object.keys(editingKeys).length > 0 && (
            <button
              onClick={handleSaveIntegrations}
              disabled={integrationsSaving}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                integrationsSaving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              )}
            >
              {integrationsSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {integrationsSaving ? 'Saving...' : 'Save Keys'}
            </button>
          )}
        </div>

        {integrationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {integrationGroups.map((group) => {
              const GroupIcon = group.icon;
              const allSet = group.fields.every(
                (f) => integrations?.[f.key]?.isSet
              );
              const someSet = group.fields.some(
                (f) => integrations?.[f.key]?.isSet
              );

              return (
                <div key={group.title} className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      allSet ? 'bg-emerald-50' : someSet ? 'bg-amber-50' : 'bg-gray-50'
                    )}>
                      <GroupIcon className={cn(
                        'w-5 h-5',
                        allSet ? 'text-emerald-600' : someSet ? 'text-amber-600' : 'text-gray-400'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {group.title}
                        </h3>
                        {allSet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-500">
                            <XCircle className="w-3 h-3" />
                            Not configured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 ml-[52px]">
                    {group.fields.map((field) => {
                      const data = integrations?.[field.key];
                      const isEditing = field.key in editingKeys;
                      const isRevealed = revealedKeys.has(field.key);

                      return (
                        <div key={field.key} className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600">
                            {field.label}
                          </label>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input
                                type={field.sensitive && !isRevealed ? 'password' : 'text'}
                                value={editingKeys[field.key]}
                                onChange={(e) => updateEditingKey(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
                              />
                              {field.sensitive && (
                                <button
                                  type="button"
                                  onClick={() => toggleReveal(field.key)}
                                  className="px-2.5 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                  title={isRevealed ? 'Hide' : 'Reveal'}
                                >
                                  {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => cancelEditing(field.key)}
                                className="px-3 py-2 text-sm text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'flex-1 px-3 py-2 rounded-lg border text-sm font-mono',
                                data?.isSet
                                  ? 'bg-gray-50 border-gray-200 text-gray-600'
                                  : 'bg-red-50/50 border-red-200 text-red-400'
                              )}>
                                {data?.isSet
                                  ? (field.sensitive ? data.masked : data.value)
                                  : (data?.value?.includes('REPLACE_WITH') ? 'Not configured' : (data?.value || 'Not set'))
                                }
                              </div>
                              <button
                                type="button"
                                onClick={() => startEditing(field.key, data?.isSet ? data.value : '')}
                                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors flex-shrink-0"
                              >
                                {data?.isSet ? 'Change' : 'Set'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {Object.keys(editingKeys).length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-200">
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
              <span>After saving, restart the dev server for changes to take effect.</span>
            </div>
          </div>
        )}
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
