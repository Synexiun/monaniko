import type { Metadata } from "next";
import AuctionsContent from "./AuctionsContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Live Auctions — Original Artworks | Mona Niko Gallery",
  description: "Bid on original artworks by Mona Niko in live auctions. Discover rare pieces and place your bid before time runs out.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    url: `${BASE_URL}/auctions`,
    title: "Live Auctions — Original Artworks | Mona Niko Gallery",
    description: "Bid on original artworks by Mona Niko in live auctions.",
    images: [{ url: "/images/hero/hero-main.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: `${BASE_URL}/auctions` },
};

export default function AuctionsPage() {
  return <AuctionsContent />;
}
