'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Image,
  FolderOpen,
  BookOpen,
  Newspaper,
  Package,
  GraduationCap,
  ShoppingCart,
  Tag,
  Megaphone,
  Send,
  LayoutTemplate,
  FileText,
  Users,
  MessageSquare,
  Paintbrush,
  Quote,
  Crown,
  Award,
  Gavel,
  Receipt,
  BarChart3,
  Settings,
  Search,
  HelpCircle,
  Ticket,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageDoc {
  icon: React.ElementType;
  title: string;
  href: string;
  description: string;
  features: string[];
  tip?: string;
  color: string;
}

interface Section {
  title: string;
  pages: PageDoc[];
}

const sections: Section[] = [
  {
    title: 'Overview',
    pages: [
      {
        icon: LayoutDashboard,
        title: 'Dashboard',
        href: '/admin',
        description: 'Your command center. A real-time snapshot of gallery activity, revenue, recent orders, and key performance metrics.',
        features: [
          'Revenue summary with trend indicators',
          'Recent orders and inquiries feed',
          'Quick-access action buttons',
          'Activity log of recent admin actions',
        ],
        tip: 'Check the dashboard every morning to catch new inquiries before they go cold.',
        color: 'bg-slate-100 text-slate-600',
      },
    ],
  },
  {
    title: 'Content',
    pages: [
      {
        icon: Image,
        title: 'Artworks',
        href: '/admin/artworks',
        description: 'Manage your entire artwork catalog — upload new pieces, edit details, update availability, and control pricing.',
        features: [
          'Upload artwork images via Cloudinary',
          'Set medium, dimensions, year, and edition info',
          'Toggle availability: Available / Sold / On Hold',
          'Assign artworks to collections',
        ],
        tip: 'Always fill in the SEO description field — it\'s used for Google image search.',
        color: 'bg-amber-100 text-amber-700',
      },
      {
        icon: FolderOpen,
        title: 'Collections',
        href: '/admin/collections',
        description: 'Group artworks into thematic collections. Collections appear in the gallery navigation and have their own detail pages.',
        features: [
          'Create named collections with cover images',
          'Add a description and year',
          'Collections are linked from artwork entries',
          'Control which collections appear in the public nav',
        ],
        color: 'bg-orange-100 text-orange-700',
      },
      {
        icon: BookOpen,
        title: 'Journal',
        href: '/admin/journal',
        description: 'Write and publish journal posts — artist statements, process notes, behind-the-scenes stories, and announcements.',
        features: [
          'Rich text posts with featured images',
          'Draft / Published workflow',
          'Tags and category support',
          'Posts appear at /journal with SEO metadata',
        ],
        tip: 'Regular journal posts improve SEO and keep collectors engaged.',
        color: 'bg-emerald-100 text-emerald-700',
      },
      {
        icon: Newspaper,
        title: 'Press',
        href: '/admin/press',
        description: 'Curate press mentions, reviews, and media coverage. These appear on the public Press page to build credibility.',
        features: [
          'Add publication name, date, and excerpt',
          'Link to external articles',
          'Upload publication logos',
          'Mark featured items for homepage display',
        ],
        color: 'bg-blue-100 text-blue-700',
      },
    ],
  },
  {
    title: 'Shop',
    pages: [
      {
        icon: Package,
        title: 'Products',
        href: '/admin/products',
        description: 'Manage prints, merchandise, and other purchasable products in the shop. Separate from original artworks.',
        features: [
          'Multiple variants per product (size, paper type)',
          'Stock tracking and low-inventory alerts',
          'Product images and detailed descriptions',
          'Stripe-connected pricing',
        ],
        color: 'bg-violet-100 text-violet-700',
      },
      {
        icon: GraduationCap,
        title: 'Workshops',
        href: '/admin/workshops',
        description: 'Create and manage art workshops. Set dates, capacity, pricing, and location for each session.',
        features: [
          'Set workshop date, duration, and location',
          'Define max capacity and track enrollments',
          'Online or in-person format',
          'Booking confirmation emails sent automatically',
        ],
        tip: 'Workshops with limited seats (e.g. 8) create urgency and sell faster.',
        color: 'bg-pink-100 text-pink-700',
      },
      {
        icon: ShoppingCart,
        title: 'Orders',
        href: '/admin/orders',
        description: 'View and manage all customer orders. Track fulfillment status, access payment details, and contact buyers.',
        features: [
          'Filter by status: Pending / Processing / Shipped / Delivered',
          'View line items, shipping address, and Stripe payment ID',
          'Update order status with one click',
          'Automatic order confirmation emails via Resend',
        ],
        color: 'bg-teal-100 text-teal-700',
      },
      {
        icon: Tag,
        title: 'Promo Codes',
        href: '/admin/promo-codes',
        description: 'Create discount codes for collectors, events, or email campaigns. Supports percentage and fixed-amount discounts.',
        features: [
          'Percentage or fixed-dollar discounts',
          'Set usage limits and expiry dates',
          'Enable/disable codes without deleting',
          'Codes are validated at checkout in real time',
        ],
        color: 'bg-rose-100 text-rose-700',
      },
    ],
  },
  {
    title: 'Marketing',
    pages: [
      {
        icon: Megaphone,
        title: 'Campaigns',
        href: '/admin/campaigns',
        description: 'Plan and track marketing campaigns across channels (email, social, events). Measure performance and ROI.',
        features: [
          'Multi-channel campaign tracking',
          'Set budget, target audience, and date range',
          'Track metrics: opens, clicks, conversions',
          'Campaign status: Draft / Active / Completed',
        ],
        color: 'bg-yellow-100 text-yellow-700',
      },
      {
        icon: Send,
        title: 'Email Blasts',
        href: '/admin/marketing/blasts',
        description: 'Send bulk email newsletters to your subscriber list. Uses pre-built templates for consistent branding.',
        features: [
          'Select a template and customize content',
          'Send to full list or filtered segments',
          'Preview before sending',
          'Powered by Resend batch API (100/call)',
        ],
        tip: 'Always preview and send a test to yourself before blasting to your full list.',
        color: 'bg-indigo-100 text-indigo-700',
      },
      {
        icon: LayoutTemplate,
        title: 'Email Templates',
        href: '/admin/marketing/templates',
        description: 'Create reusable HTML/text email templates for newsletters, announcements, and promotions.',
        features: [
          'HTML and plain text versions',
          'Template variables for personalization',
          'Templates used by Email Blasts',
          'Preview renders in the editor',
        ],
        color: 'bg-purple-100 text-purple-700',
      },
      {
        icon: FileText,
        title: 'Content Scheduler',
        href: '/admin/content',
        description: 'Schedule future content drops — journal posts, product launches, and announcements — to publish automatically.',
        features: [
          'Schedule any content type with a publish date',
          'Draft → Scheduled → Published workflow',
          'Calendar view of upcoming content',
          'Syncs with journal and product pages',
        ],
        color: 'bg-cyan-100 text-cyan-700',
      },
      {
        icon: Users,
        title: 'Audience',
        href: '/admin/audience',
        description: 'View and manage your subscriber list and customer accounts. Export data for external marketing tools.',
        features: [
          'Newsletter subscriber list with signup dates',
          'Filter by source (website, checkout, events)',
          'Export CSV for Mailchimp or other tools',
          'Unsubscribe management',
        ],
        color: 'bg-sky-100 text-sky-700',
      },
    ],
  },
  {
    title: 'Engagement',
    pages: [
      {
        icon: MessageSquare,
        title: 'Inquiries',
        href: '/admin/inquiries',
        description: 'Manage all inbound inquiries from collectors — artwork questions, private viewings, press, and general contact.',
        features: [
          'Status pipeline: New → Contacted → In Progress → Closed',
          'Filter by inquiry type and status',
          'View full message and reply via email',
          'Advance status with one click',
        ],
        tip: 'Respond to "New" inquiries within 24 hours — collectors value responsiveness.',
        color: 'bg-blue-100 text-blue-700',
      },
      {
        icon: Paintbrush,
        title: 'Commissions',
        href: '/admin/commissions',
        description: 'Track custom commission projects through 8 workflow stages from initial inquiry to final delivery.',
        features: [
          '8-stage pipeline: Inquiry → Concept → Deposit → In Progress → Review → Final Payment → Shipped → Completed',
          'Client details and budget tracking',
          'Notes and internal comments per stage',
          'Certificates auto-generated on completion',
        ],
        color: 'bg-rose-100 text-rose-700',
      },
      {
        icon: Quote,
        title: 'Testimonials',
        href: '/admin/testimonials',
        description: 'Curate collector testimonials and reviews. Approved testimonials appear on the homepage and shop pages.',
        features: [
          'Add testimonials manually or approve from submissions',
          'Star rating display',
          'Featured toggle for homepage placement',
          'Name, role, and location fields',
        ],
        color: 'bg-amber-100 text-amber-700',
      },
    ],
  },
  {
    title: 'Collector',
    pages: [
      {
        icon: Crown,
        title: 'Collector Club',
        href: '/admin/collector-club',
        description: 'Manage your Collector\'s Circle membership program. View member applications, tiers, and benefits.',
        features: [
          'View membership applications and approvals',
          'Bronze / Silver / Gold tier management',
          'Member KPI cards: total, active, by tier',
          'Email members directly from the panel',
        ],
        color: 'bg-yellow-100 text-yellow-700',
      },
      {
        icon: Award,
        title: 'Certificates',
        href: '/admin/certificates',
        description: 'Issue and manage Certificates of Authenticity for original artworks. Auto-numbered as MN-YYYY-NNNN.',
        features: [
          'Auto-generated unique certificate numbers',
          'Link certificates to specific artworks',
          'Print-to-PDF for physical delivery',
          'Collector name and purchase date recorded',
        ],
        color: 'bg-emerald-100 text-emerald-700',
      },
      {
        icon: Gavel,
        title: 'Auctions',
        href: '/admin/auctions',
        description: 'Run live art auctions with real-time bidding. Set reserve prices, manage bids, and end auctions.',
        features: [
          'Create auction with reserve price and end time',
          'Live countdown and bid history drawer',
          'Go-live and End Auction controls',
          'Outbid/Won/New Bid notification emails sent automatically',
        ],
        tip: 'Set a compelling starting bid around 60% of your usual price to drive initial interest.',
        color: 'bg-orange-100 text-orange-700',
      },
    ],
  },
  {
    title: 'Finance',
    pages: [
      {
        icon: Receipt,
        title: 'Accounting',
        href: '/admin/accounting',
        description: 'Profit & Loss overview with revenue vs. expenses. Monthly breakdown of gallery income and costs.',
        features: [
          'Revenue from orders, commissions, workshops',
          'Expense tracking by category',
          'Monthly P&L chart',
          'Net profit calculation',
        ],
        color: 'bg-green-100 text-green-700',
      },
      {
        icon: Tag,
        title: 'Expenses',
        href: '/admin/accounting/expenses',
        description: 'Log and track all business expenses — materials, shipping, marketing, studio costs, and more.',
        features: [
          'Categorized expense entries',
          'Date, amount, vendor, and notes',
          'Filter by category and date range',
          'Feeds into P&L automatically',
        ],
        color: 'bg-red-100 text-red-700',
      },
      {
        icon: FileText,
        title: 'Invoices',
        href: '/admin/accounting/invoices',
        description: 'Create and send professional invoices for commissions, wholesale, and other non-shop transactions.',
        features: [
          'Client name, address, and tax details',
          'Line items with quantities and amounts',
          'Invoice status: Draft / Sent / Paid / Overdue',
          'Print to PDF for sending or filing',
        ],
        color: 'bg-blue-100 text-blue-700',
      },
    ],
  },
  {
    title: 'System',
    pages: [
      {
        icon: BarChart3,
        title: 'Analytics',
        href: '/admin/analytics',
        description: 'Gallery performance analytics — page views, top artworks, traffic sources, and conversion metrics.',
        features: [
          'Page view trends over time',
          'Top viewed artworks and collections',
          'Conversion funnel (views → inquiries → orders)',
          'Date range filtering',
        ],
        color: 'bg-violet-100 text-violet-700',
      },
      {
        icon: Settings,
        title: 'Settings',
        href: '/admin/settings',
        description: 'Configure global gallery settings — studio hours, contact details, social links, and system preferences.',
        features: [
          'Studio address and contact information',
          'Social media profile links',
          'Gallery open hours',
          'Notification preferences',
        ],
        color: 'bg-slate-100 text-slate-600',
      },
      {
        icon: Ticket,
        title: 'Support Tickets',
        href: '/admin/tickets',
        description: 'Log, track, and resolve internal support requests and issues. Use this to report bugs, request features, or track tasks.',
        features: [
          'Create tickets with priority and category',
          'Status pipeline: Open → In Progress → Resolved → Closed',
          'Resolution notes and history',
          'Report view: breakdown by status, category, and priority',
        ],
        color: 'bg-pink-100 text-pink-700',
      },
    ],
  },
];

const allPages = sections.flatMap(s => s.pages.map(p => ({ ...p, section: s.title })));

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export default function HelpPage() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? allPages.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.features.some(f => f.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  return (
    <motion.div {...fadeIn} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete guide to every page in your admin dashboard
          </p>
        </div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Ticket className="w-4 h-4" />
          Support Tickets
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documentation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors shadow-sm"
        />
      </div>

      {/* Search Results */}
      {filtered ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((page, i) => (
              <PageCard key={i} page={page} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      ) : (
        /* Sectioned grid */
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{section.title}</h2>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {section.pages.map((page, i) => (
                  <PageCard key={i} page={page} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PageCard({ page }: { page: PageDoc }) {
  const Icon = page.icon;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Card Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', page.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <Link
            href={page.href}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            title={`Go to ${page.title}`}
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 mt-3">{page.title}</h3>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{page.description}</p>
      </div>

      {/* Features */}
      <div className="p-5 pt-4">
        <ul className="space-y-1.5">
          {page.features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
              {feat}
            </li>
          ))}
        </ul>

        {page.tip && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-3">
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">Tip: </span>{page.tip}
            </p>
          </div>
        )}

        <Link
          href={page.href}
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors group/link"
        >
          Open {page.title}
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
