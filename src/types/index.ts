// ─── Artwork ───────────────────────────────────────────────
export type ArtworkStatus = "available" | "sold" | "on_exhibition" | "commissioned";
export type ArtworkCategory = "painting" | "mixed_media" | "print" | "sculpture" | "drawing";
export type ArtworkMedium = "oil" | "acrylic" | "watercolor" | "mixed_media" | "ink" | "pastel" | "digital";

export interface Artwork {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  category: ArtworkCategory;
  medium: ArtworkMedium;
  dimensions: {
    width: number;
    height: number;
    unit: "in" | "cm";
    depth?: number;
  };
  year: number;
  status: ArtworkStatus;
  price?: number;
  priceOnInquiry: boolean;
  collectionId?: string;
  tags: string[];
  featured: boolean;
  framing?: string;
  certificate: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Collection ────────────────────────────────────────────
export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  artworkIds: string[];
  featured: boolean;
  year?: number;
  createdAt: string;
}

// ─── Product (Prints / Merch) ──────────────────────────────
export type ProductType = "print" | "original" | "merchandise";

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  dimensions?: string;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  type: ProductType;
  variants: ProductVariant[];
  basePrice: number;
  artworkId?: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
}

// ─── Workshop ──────────────────────────────────────────────
export interface Workshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  images: string[];
  date: string;
  endDate?: string;
  time: string;
  duration: string;
  location: string;
  isOnline: boolean;
  price: number;
  capacity: number;
  spotsLeft: number;
  instructor: string;
  level: "beginner" | "intermediate" | "advanced" | "all_levels";
  materials?: string[];
  featured: boolean;
  createdAt: string;
}

// ─── Journal / Blog ────────────────────────────────────────
export type PostStatus = "draft" | "scheduled" | "published";

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: PostStatus;
  publishedAt?: string;
  scheduledAt?: string;
  seo: SEOMetadata;
  createdAt: string;
  updatedAt: string;
}

// ─── Press ─────────────────────────────────────────────────
export interface PressItem {
  id: string;
  title: string;
  publication: string;
  date: string;
  url?: string;
  excerpt: string;
  image?: string;
  featured: boolean;
}

// ─── Testimonial ───────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  text: string;
  image?: string;
  rating?: number;
  featured: boolean;
}

// ─── Cart ──────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  type: ProductType | "workshop";
}

// ─── Marketing / CRM ──────────────────────────────────────
export type AudienceSegment =
  | "collector"
  | "print_buyer"
  | "workshop_attendee"
  | "commission_lead"
  | "press"
  | "newsletter"
  | "vip";

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  segments: AudienceSegment[];
  source: string;
  createdAt: string;
  lastActivity?: string;
  totalPurchases: number;
  totalSpent: number;
  notes?: string;
}

// ─── Campaign ──────────────────────────────────────────────
export type CampaignStatus = "draft" | "scheduled" | "active" | "completed" | "paused";
export type CampaignChannel = "email" | "instagram" | "facebook" | "pinterest" | "x" | "blog";
export type CampaignObjective = "sales" | "launch" | "awareness" | "event_booking" | "engagement";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  objective: CampaignObjective;
  channels: CampaignChannel[];
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  targetSegments: AudienceSegment[];
  content: CampaignContent[];
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignContent {
  id: string;
  channel: CampaignChannel;
  caption: string;
  images: string[];
  link?: string;
  cta?: string;
  tags: string[];
  scheduledAt?: string;
  status: "draft" | "scheduled" | "published" | "failed";
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  inquiries: number;
  revenue: number;
  openRate?: number;
  clickRate?: number;
}

// ─── Inquiry ───────────────────────────────────────────────
export type InquiryType = "artwork" | "commission" | "private_viewing" | "general" | "press";

export interface Inquiry {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  message: string;
  artworkId?: string;
  budget?: string;
  status: "new" | "contacted" | "in_progress" | "closed";
  createdAt: string;
}

// ─── SEO ───────────────────────────────────────────────────
export interface SEOMetadata {
  title: string;
  description: string;
  ogImage?: string;
  keywords?: string[];
}

// ─── Content Scheduler ─────────────────────────────────────
export interface ScheduledContent {
  id: string;
  title: string;
  type: "journal_post" | "campaign_post" | "email_blast" | "social_post";
  scheduledAt: string;
  status: "scheduled" | "published" | "failed" | "cancelled";
  channel?: CampaignChannel;
  contentRef?: string;
  createdAt: string;
}

// ─── Analytics ─────────────────────────────────────────────
export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalInquiries: number;
  totalSubscribers: number;
  conversionRate: number;
  topArtworks: { artworkId: string; views: number; inquiries: number }[];
  topCollections: { collectionId: string; views: number }[];
  recentLeads: Contact[];
  campaignPerformance: { campaignId: string; roi: number }[];
}
