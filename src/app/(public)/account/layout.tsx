'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Package, Heart, User, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/profile', label: 'Profile', icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, clearUser } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Allow /account (login) and /account/register without auth
  const isAuthPage = pathname === '/account';

  useEffect(() => {
    if (isAuthPage) { setChecking(false); return; }

    fetch('/api/account/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setUser(data);
          setChecking(false);
        } else {
          router.replace('/account');
        }
      })
      .catch(() => router.replace('/account'));
  }, [isAuthPage, router, setUser]);

  if (isAuthPage) return <>{children}</>;

  if (checking) {
    return (
      <div className="pt-[var(--header-height)] min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#C4A265]" />
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/account/logout', { method: 'POST' });
    clearUser();
    router.push('/account');
  };

  return (
    <div className="pt-[var(--header-height)] min-h-screen bg-[#FAFAF8]">
      <div className="container-gallery py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-[#E8E5E0] p-6">
              <div className="mb-6 pb-6 border-b border-[#E8E5E0]">
                <p className="font-serif text-lg text-black">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-[#6B6560] mt-0.5">{user?.email}</p>
              </div>
              <nav className="space-y-1">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                      pathname.startsWith(href)
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#4A4A4A] hover:text-black hover:bg-[#F5F3F0]'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
