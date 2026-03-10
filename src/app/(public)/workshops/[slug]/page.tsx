import type { Metadata } from "next";
import { workshops } from "@/data/artworks";
import WorkshopDetailContent from "./WorkshopDetailContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workshop = workshops.find((w) => w.slug === slug);
  if (!workshop) return { title: "Workshop Not Found" };

  const date = new Date(workshop.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const description = workshop.description
    ? `${workshop.description} ${date} at ${workshop.location}. $${workshop.price}/person. ${workshop.spotsLeft} spots remaining.`
    : `${workshop.title} — Art workshop with Mona Niko. ${date}. $${workshop.price}/person.`;

  const url = `${BASE_URL}/workshops/${workshop.slug}`;
  const image = workshop.images[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: workshop.title,
    description: workshop.description,
    image,
    url,
    startDate: workshop.date,
    endDate: workshop.endDate || workshop.date,
    location: {
      "@type": workshop.isOnline ? "VirtualLocation" : "Place",
      name: workshop.isOnline ? "Online" : "Mona Niko Gallery",
      address: workshop.isOnline ? undefined : {
        "@type": "PostalAddress",
        streetAddress: "668B The Shops At Mission Viejo Mall",
        addressLocality: "Mission Viejo",
        addressRegion: "CA",
        postalCode: "92691",
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Person",
      name: workshop.instructor || "Mona Niko",
      url: `${BASE_URL}/about`,
    },
    offers: {
      "@type": "Offer",
      price: workshop.price,
      priceCurrency: "USD",
      availability:
        workshop.spotsLeft > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url,
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: workshop.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    remainingAttendeeCapacity: workshop.spotsLeft,
  };

  return {
    title: `${workshop.title} — Art Workshop`,
    description: description.slice(0, 160),
    keywords: [workshop.title, "art workshop", "Mona Niko", "Mission Viejo", "painting class", workshop.level],
    openGraph: {
      title: `${workshop.title} — Mona Niko Gallery`,
      description: description.slice(0, 200),
      url,
      images: image ? [{ url: image, alt: workshop.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${workshop.title} — Mona Niko Gallery`,
      description: description.slice(0, 200),
      images: image ? [image] : [],
    },
    alternates: { canonical: url },
  };
}

export function generateStaticParams() {
  return workshops.map((w) => ({ slug: w.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const workshop = workshops.find((w) => w.slug === slug);

  const jsonLd = workshop
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Event",
            name: workshop.title,
            description: workshop.description,
            image: workshop.images[0],
            url: `${BASE_URL}/workshops/${workshop.slug}`,
            startDate: workshop.date,
            endDate: workshop.endDate || workshop.date,
            location: {
              "@type": workshop.isOnline ? "VirtualLocation" : "Place",
              name: workshop.isOnline ? "Online" : "Mona Niko Gallery",
              address: workshop.isOnline
                ? undefined
                : { "@type": "PostalAddress", streetAddress: "668B The Shops At Mission Viejo Mall", addressLocality: "Mission Viejo", addressRegion: "CA", postalCode: "92691", addressCountry: "US" },
            },
            organizer: { "@type": "Person", name: workshop.instructor || "Mona Niko", url: `${BASE_URL}/about` },
            offers: { "@type": "Offer", price: workshop.price, priceCurrency: "USD", availability: workshop.spotsLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut", url: `${BASE_URL}/workshops/${workshop.slug}` },
            eventStatus: "https://schema.org/EventScheduled",
            remainingAttendeeCapacity: workshop.spotsLeft,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Workshops", item: `${BASE_URL}/workshops` },
              { "@type": "ListItem", position: 3, name: workshop.title, item: `${BASE_URL}/workshops/${workshop.slug}` },
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
      <WorkshopDetailContent />
    </>
  );
}
