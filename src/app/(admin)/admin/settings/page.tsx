'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Clock, Share2, Search as SearchIcon } from 'lucide-react';
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

const initialSettings: SettingsState = {
  gallery: {
    name: 'Mona Niko Gallery',
    email: 'info@monaniko.com',
    phone: '(949) 555-0127',
    addressLine1: '27001 La Paz Road',
    addressLine2: 'Suite 248',
    city: 'Mission Viejo',
    state: 'CA',
    zip: '92691',
  },
  hours: {
    monday: '10:00 AM - 6:00 PM',
    tuesday: '10:00 AM - 6:00 PM',
    wednesday: '10:00 AM - 6:00 PM',
    thursday: '10:00 AM - 8:00 PM',
    friday: '10:00 AM - 6:00 PM',
    saturday: '11:00 AM - 5:00 PM',
    sunday: 'Closed',
  },
  social: {
    instagram: 'https://instagram.com/monaniko',
    facebook: 'https://facebook.com/monaniko',
    pinterest: 'https://pinterest.com/monaniko',
    x: 'https://x.com/monaniko',
    youtube: '',
  },
  seo: {
    defaultTitle: 'Mona Niko — Contemporary Fine Art Gallery',
    defaultDescription:
      'Discover original paintings, limited edition prints, and immersive art workshops by Mona Niko. Contemporary fine art gallery in Mission Viejo, California.',
  },
};

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
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
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  helpText?: string;
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
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors resize-none"
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
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [saved, setSaved] = useState(false);

  const updateGallery = (
    key: keyof SettingsState['gallery'],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, [key]: value },
    }));
    setSaved(false);
  };

  const updateHours = (
    key: keyof SettingsState['hours'],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      hours: { ...prev.hours, [key]: value },
    }));
    setSaved(false);
  };

  const updateSocial = (
    key: keyof SettingsState['social'],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: value },
    }));
    setSaved(false);
  };

  const updateSeo = (key: keyof SettingsState['seo'], value: string) => {
    setSettings((prev) => ({
      ...prev,
      seo: { ...prev.seo, [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, this would persist to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all',
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-black text-white hover:bg-gray-800'
          )}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

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
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Email"
              type="email"
              value={settings.gallery.email}
              onChange={(v) => updateGallery('email', v)}
            />
            <InputField
              label="Phone"
              type="tel"
              value={settings.gallery.phone}
              onChange={(v) => updateGallery('phone', v)}
            />
          </div>
          <InputField
            label="Address Line 1"
            value={settings.gallery.addressLine1}
            onChange={(v) => updateGallery('addressLine1', v)}
          />
          <InputField
            label="Address Line 2"
            value={settings.gallery.addressLine2}
            onChange={(v) => updateGallery('addressLine2', v)}
            placeholder="Suite, unit, building, etc."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField
              label="City"
              value={settings.gallery.city}
              onChange={(v) => updateGallery('city', v)}
            />
            <InputField
              label="State"
              value={settings.gallery.state}
              onChange={(v) => updateGallery('state', v)}
            />
            <InputField
              label="ZIP Code"
              value={settings.gallery.zip}
              onChange={(v) => updateGallery('zip', v)}
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
                  className="flex-1 max-w-xs px-3.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
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
          />
          <InputField
            label="Facebook"
            value={settings.social.facebook}
            onChange={(v) => updateSocial('facebook', v)}
            placeholder="https://facebook.com/yourpage"
          />
          <InputField
            label="Pinterest"
            value={settings.social.pinterest}
            onChange={(v) => updateSocial('pinterest', v)}
            placeholder="https://pinterest.com/yourusername"
          />
          <InputField
            label="X (Twitter)"
            value={settings.social.x}
            onChange={(v) => updateSocial('x', v)}
            placeholder="https://x.com/yourusername"
          />
          <InputField
            label="YouTube"
            value={settings.social.youtube}
            onChange={(v) => updateSocial('youtube', v)}
            placeholder="https://youtube.com/@yourchannel"
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
          />
          <TextAreaField
            label="Default Meta Description"
            value={settings.seo.defaultDescription}
            onChange={(v) => updateSeo('defaultDescription', v)}
            rows={3}
            placeholder="A brief description of your gallery for search engines..."
            helpText="Recommended: 150-160 characters for optimal display in search results."
          />
        </div>
      </section>

      {/* Bottom Save Button */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all',
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-black text-white hover:bg-gray-800'
          )}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </motion.div>
  );
}
