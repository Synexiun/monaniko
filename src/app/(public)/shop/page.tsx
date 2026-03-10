import type { Metadata } from "next";
import ShopContent from "./ShopContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Shop — Prints, Originals & Merchandise | Mona Niko Gallery",
  description:
    "Shop original paintings, limited edition prints, and exclusive merchandise by Mona Niko. Free US shipping on orders over $150.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    url: BASE_URL + "/shop",
    images: [{ url: "/images/hero/hero-main.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: BASE_URL + "/shop" },
};

export default function ShopPage() {
  return <ShopContent />;
}
