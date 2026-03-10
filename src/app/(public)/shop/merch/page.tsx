import type { Metadata } from "next";
import MerchContent from "./MerchContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Art Merchandise & Lifestyle Products | Mona Niko Gallery",
  description:
    "Wear and live with art. Shop Mona Niko's collection of apparel, home goods, and lifestyle products featuring her signature artworks.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/shop/merch" },
};

export default function MerchShopPage() {
  return <MerchContent />;
}
