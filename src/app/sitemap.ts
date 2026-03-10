import { MetadataRoute } from 'next'
import { artworks, collections, products, workshops, journalPosts } from '@/data/artworks'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monaniko.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/gallery`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/collections`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/shop`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/shop/originals`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/shop/prints`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/shop/merch`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/shop/designers`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/workshops`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/journal`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/press`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/commissions`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/kids-club`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const artworkPages: MetadataRoute.Sitemap = artworks.map((a) => ({
    url: `${BASE_URL}/gallery/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly',
    priority: a.featured ? 0.9 : 0.7,
  }))

  const collectionPages: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${BASE_URL}/collections/${c.slug}`,
    lastModified: new Date(c.createdAt),
    changeFrequency: 'monthly',
    priority: c.featured ? 0.85 : 0.7,
  }))

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'monthly',
    priority: p.featured ? 0.8 : 0.6,
  }))

  const workshopPages: MetadataRoute.Sitemap = workshops.map((w) => ({
    url: `${BASE_URL}/workshops/${w.slug}`,
    lastModified: new Date(w.createdAt),
    changeFrequency: 'weekly',
    priority: w.featured ? 0.85 : 0.7,
  }))

  const journalPages: MetadataRoute.Sitemap = journalPosts
    .filter((p) => p.status === 'published')
    .map((p) => ({
      url: `${BASE_URL}/journal/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [
    ...staticPages,
    ...artworkPages,
    ...collectionPages,
    ...productPages,
    ...workshopPages,
    ...journalPages,
  ]
}
