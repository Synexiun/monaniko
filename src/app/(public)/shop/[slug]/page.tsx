import type { Metadata } from "next";
import { products } from "@/data/artworks";
import ProductDetailContent from "./ProductDetailContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };

  const url = `${BASE_URL}/shop/${product.slug}`;
  const image = product.images[0];
  const priceText = `$${product.basePrice.toLocaleString()}`;

  const description = product.description
    ? `${product.description.slice(0, 130)} Starting from ${priceText}.`
    : `${product.title} by Mona Niko. ${priceText}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image,
    url,
    brand: {
      "@type": "Brand",
      name: "Mona Niko Gallery",
    },
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      name: v.name,
      price: v.price,
      priceCurrency: "USD",
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    })),
  };

  return {
    title: `${product.title} — Mona Niko Shop`,
    description: description.slice(0, 160),
    keywords: [product.title, "Mona Niko", "art merchandise", "fine art print", ...product.tags],
    openGraph: {
      title: `${product.title} — Mona Niko`,
      description: description.slice(0, 200),
      url,
      images: image ? [{ url: image, alt: product.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — Mona Niko`,
      description: description.slice(0, 200),
      images: image ? [image] : [],
    },
    alternates: { canonical: url },
  };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            name: product.title,
            description: product.description,
            image: product.images[0],
            url: `${BASE_URL}/shop/${product.slug}`,
            brand: { "@type": "Brand", name: "Mona Niko Gallery" },
            offers: product.variants.map((v) => ({
              "@type": "Offer",
              name: v.name,
              price: v.price,
              priceCurrency: "USD",
              availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Shop", item: `${BASE_URL}/shop` },
              { "@type": "ListItem", position: 3, name: product.title, item: `${BASE_URL}/shop/${product.slug}` },
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
      <ProductDetailContent />
    </>
  );
}
