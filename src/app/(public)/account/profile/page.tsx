'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

function Field({ label, value, onChange, type = 'text', autoComplete }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.12em] uppercase text-[#6B6560] font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full border border-[#E8E5E0] bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#C5C0B8] focus:outline-none focus:border-[#1A1A1A] transition-colors"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { setUser } = useAuthStore();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/account/me')
      .then((r) => r.json())
      .then((d) => setProfile({ firstName: d.firstName, lastName: d.lastName, email: d.email }))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setUser({ ...data, avatar: data.avatar });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (e) {
      setProfileMsg({ type: 'error', text: e instanceof Error ? e.message : 'Update failed' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/account/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
    } catch (e) {
      setPasswordMsg({ type: 'error', text: e instanceof Error ? e.message : 'Password change failed' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[#C4A265]" />
    </div>
  );

  return (
    <motion.div {...fadeIn} className="space-y-8">
      <h1 className="font-serif text-2xl md:text-3xl text-black font-medium">Profile Settings</h1>

      {/* Profile */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-[#E8E5E0] p-6 space-y-5">
        <h2 className="font-serif text-lg text-black">Personal Information</h2>

        {profileMsg && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 ${
            profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {profileMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" value={profile.firstName} onChange={(v) => setProfile((p) => ({ ...p, firstName: v }))} autoComplete="given-name" />
          <Field label="Last Name" value={profile.lastName} onChange={(v) => setProfile((p) => ({ ...p, lastName: v }))} autoComplete="family-name" />
        </div>
        <Field label="Email Address" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} autoComplete="email" />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white text-[11px] tracking-[0.12em] uppercase hover:bg-[#C4A265] disabled:opacity-50 transition-colors"
          >
            {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handleSavePassword} className="bg-white border border-[#E8E5E0] p-6 space-y-5">
        <h2 className="font-serif text-lg text-black">Change Password</h2>

        {passwordMsg && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 ${
            passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {passwordMsg.text}
          </div>
        )}

        <Field label="Current Password" type="password" value={passwords.currentPassword} onChange={(v) => setPasswords((p) => ({ ...p, currentPassword: v }))} autoComplete="current-password" />
        <Field label="New Password" type="password" value={passwords.newPassword} onChange={(v) => setPasswords((p) => ({ ...p, newPassword: v }))} autoComplete="new-password" />
        <Field label="Confirm New Password" type="password" value={passwords.confirmPassword} onChange={(v) => setPasswords((p) => ({ ...p, confirmPassword: v }))} autoComplete="new-password" />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white text-[11px] tracking-[0.12em] uppercase hover:bg-[#C4A265] disabled:opacity-50 transition-colors"
          >
            {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </motion.div>
  );
}
