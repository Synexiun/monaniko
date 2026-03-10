import type { Metadata } from "next";
import { collections, artworks } from "@/data/artworks";
import CollectionDetailContent from "./CollectionDetailContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) return { title: "Collection Not Found" };

  const collectionArtworks = artworks.filter((a) =>
    collection.artworkIds.includes(a.id)
  );
  const availableCount = collectionArtworks.filter(
    (a) => a.status === "available"
  ).length;

  const description =
    collection.description
      ? `${collection.description.slice(0, 130)} — ${availableCount} works available.`
      : `Explore the ${collection.title} collection by Mona Niko. ${availableCount} works available.`;

  const url = `${BASE_URL}/collections/${collection.slug}`;
  const image = collection.coverImage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.title} — Mona Niko Gallery`,
    description: collection.description,
    url,
    image,
    creator: {
      "@type": "Person",
      name: "Mona Niko",
      url: `${BASE_URL}/about`,
    },
    numberOfItems: collectionArtworks.length,
  };

  return {
    title: `${collection.title} Collection`,
    description: description.slice(0, 160),
    keywords: [collection.title, "Mona Niko", "art collection", "contemporary art", "fine art"],
    openGraph: {
      title: `${collection.title} — Mona Niko Gallery`,
      description: description.slice(0, 200),
      url,
      images: image ? [{ url: image, alt: collection.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} — Mona Niko Gallery`,
      description: description.slice(0, 200),
      images: image ? [image] : [],
    },
    alternates: { canonical: url },
  };
}

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);
  const collectionArtworks = collection
    ? artworks.filter((a) => collection.artworkIds.includes(a.id))
    : [];

  const jsonLd = collection
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            name: `${collection.title} — Mona Niko Gallery`,
            description: collection.description,
            url: `${BASE_URL}/collections/${collection.slug}`,
            image: collection.coverImage,
            creator: { "@type": "Person", name: "Mona Niko", url: `${BASE_URL}/about` },
            numberOfItems: collectionArtworks.length,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Collections", item: `${BASE_URL}/collections` },
              { "@type": "ListItem", position: 3, name: collection.title, item: `${BASE_URL}/collections/${collection.slug}` },
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
      <CollectionDetailContent />
    </>
  );
}
