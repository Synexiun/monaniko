import type { Metadata } from "next";
import { journalPosts } from "@/data/artworks";
import JournalPostContent from "./JournalPostContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = journalPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  const title = post.seo?.title || `${post.title} — Mona Niko Journal`;
  const description = post.seo?.description || post.excerpt || "";
  const url = `${BASE_URL}/journal/${post.slug}`;
  const image = post.coverImage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image,
    author: {
      "@type": "Person",
      name: post.author || "Mona Niko",
      url: `${BASE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Mona Niko Gallery",
      url: BASE_URL,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    inLanguage: "en-US",
  };

  return {
    title,
    description,
    keywords: post.tags,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author || "Mona Niko"],
      tags: post.tags,
      images: image ? [{ url: image, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: { canonical: url },
  };
}

export function generateStaticParams() {
  return journalPosts
    .filter((p) => p.status === "published")
    .map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = journalPosts.find((p) => p.slug === slug);

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            author: { "@type": "Person", name: post.author || "Mona Niko", url: `${BASE_URL}/about` },
            publisher: { "@type": "Organization", name: "Mona Niko Gallery", url: BASE_URL },
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            url: `${BASE_URL}/journal/${post.slug}`,
            keywords: post.tags.join(", "),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Journal", item: `${BASE_URL}/journal` },
              { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/journal/${post.slug}` },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JournalPostContent />
    </>
  );
}
