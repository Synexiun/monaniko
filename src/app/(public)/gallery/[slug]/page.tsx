import type { Metadata } from "next";
import { artworks } from "@/data/artworks";
import ArtworkDetailContent from "./ArtworkDetailContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

const mediumLabels: Record<string, string> = {
  oil: "Oil on Canvas",
  acrylic: "Acrylic on Canvas",
  watercolor: "Watercolor on Paper",
  mixed_media: "Mixed Media",
  ink: "Ink on Paper",
  pastel: "Pastel on Paper",
  digital: "Digital",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);
  if (!artwork) return { title: "Artwork Not Found" };

  const medium = mediumLabels[artwork.medium] || artwork.medium;
  const dimLabel = artwork.dimensions.depth
    ? `${artwork.dimensions.width}×${artwork.dimensions.height}×${artwork.dimensions.depth} ${artwork.dimensions.unit}`
    : `${artwork.dimensions.width}×${artwork.dimensions.height} ${artwork.dimensions.unit}`;

  const priceText =
    artwork.status === "available" && artwork.price
      ? `$${artwork.price.toLocaleString()}`
      : "Price on inquiry";

  const description = artwork.description
    ? `${artwork.description.slice(0, 120)} ${medium}, ${dimLabel}. ${priceText}.`
    : `Original artwork by Mona Niko. ${medium}, ${dimLabel}. ${priceText}.`;

  const url = `${BASE_URL}/gallery/${artwork.slug}`;
  const image = artwork.images[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    creator: {
      "@type": "Person",
      name: "Mona Niko",
      url: `${BASE_URL}/about`,
    },
    artMedium: medium,
    width: `${artwork.dimensions.width} ${artwork.dimensions.unit}`,
    height: `${artwork.dimensions.height} ${artwork.dimensions.unit}`,
    dateCreated: String(artwork.year),
    image,
    url,
    genre: "Contemporary Fine Art",
    ...(artwork.status === "available" && artwork.price
      ? {
          offers: {
            "@type": "Offer",
            price: artwork.price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  };

  return {
    title: `${artwork.title} — Original ${medium} by Mona Niko`,
    description: description.slice(0, 160),
    keywords: [artwork.title, "Mona Niko", medium, "original artwork", "fine art", ...artwork.tags],
    openGraph: {
      title: `${artwork.title} by Mona Niko`,
      description: description.slice(0, 200),
      url,
      images: image ? [{ url: image, alt: artwork.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${artwork.title} by Mona Niko`,
      description: description.slice(0, 200),
      images: image ? [image] : [],
    },
    alternates: { canonical: url },
  };
}

export function generateStaticParams() {
  return artworks.map((a) => ({ slug: a.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);

  const jsonLd = artwork
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "VisualArtwork",
            name: artwork.title,
            creator: { "@type": "Person", name: "Mona Niko", url: `${BASE_URL}/about` },
            artMedium: mediumLabels[artwork.medium] || artwork.medium,
            width: `${artwork.dimensions.width} ${artwork.dimensions.unit}`,
            height: `${artwork.dimensions.height} ${artwork.dimensions.unit}`,
            dateCreated: String(artwork.year),
            image: artwork.images[0],
            url: `${BASE_URL}/gallery/${artwork.slug}`,
            genre: "Contemporary Fine Art",
            ...(artwork.status === "available" && artwork.price
              ? { offers: { "@type": "Offer", price: artwork.price, priceCurrency: "USD", availability: "https://schema.org/InStock" } }
              : {}),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Gallery", item: `${BASE_URL}/gallery` },
              { "@type": "ListItem", position: 3, name: artwork.title, item: `${BASE_URL}/gallery/${artwork.slug}` },
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
      <ArtworkDetailContent />
    </>
  );
}
