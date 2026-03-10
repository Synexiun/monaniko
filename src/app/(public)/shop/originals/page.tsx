import type { Metadata } from "next";
import OriginalsContent from "./OriginalsContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Original Paintings for Sale | Mona Niko Gallery",
  description:
    "Purchase original paintings by Mona Niko. One-of-a-kind artworks in oil, acrylic, and mixed media. Each work includes a Certificate of Authenticity.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/shop/originals" },
};

export default function OriginalsShopPage() {
  return <OriginalsContent />;
}
