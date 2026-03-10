import type { Metadata } from "next";
import GalleryContent from "./GalleryContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Gallery — Original Paintings & Fine Art | Mona Niko",
  description:
    "Browse the complete collection of original paintings and artworks by Mona Niko. Figurative, abstract, and mixed media works available for purchase.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    url: BASE_URL + "/gallery",
    images: [{ url: "/images/hero/hero-main.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: BASE_URL + "/gallery" },
};

export default function GalleryPage() {
  return <GalleryContent />;
}
