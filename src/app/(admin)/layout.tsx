'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Image,
  FolderOpen,
  ShoppingCart,
  Megaphone,
  FileText,
  Users,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  LogOut,
  Package,
  GraduationCap,
  BookOpen,
  Newspaper,
  MessageSquare,
  Quote,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ToastProvider from '@/components/admin/ToastProvider';

interface SidebarSection {
  title: string;
  links: { href: string; label: string; icon: React.ElementType }[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    links: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Content',
    links: [
      { href: '/admin/artworks', label: 'Artworks', icon: Image },
      { href: '/admin/collections', label: 'Collections', icon: FolderOpen },
      { href: '/admin/journal', label: 'Journal', icon: BookOpen },
      { href: '/admin/press', label: 'Press', icon: Newspaper },
    ],
  },
  {
    title: 'Shop',
    links: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/workshops', label: 'Workshops', icon: GraduationCap },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
    ],
  },
  {
    title: 'Marketing',
    links: [
      { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
      { href: '/admin/content', label: 'Content Scheduler', icon: FileText },
      { href: '/admin/audience', label: 'Audience', icon: Users },
    ],
  },
  {
    title: 'Engagement',
    links: [
      { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
      { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
    ],
  },
  {
    title: 'System',
    links: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Skip admin shell for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
          <span className="text-white font-bold text-sm">MN</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Mona Niko</p>
          <p className="text-xs text-gray-400">Gallery Admin</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-3">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>{link.label}</span>
                    {active && (
                      <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="w-[18px] h-[18px] flex-shrink-0" />
          <span>View Live Site</span>
        </a>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-white border-r border-gray-200 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 lg:hidden flex flex-col shadow-xl"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                Mona Niko Admin
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C4A265] to-[#8B7340] flex items-center justify-center ml-1">
                <span className="text-white text-xs font-semibold">MN</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <ToastProvider />
    </div>
  );
}
