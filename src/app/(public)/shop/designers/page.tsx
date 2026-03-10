import type { Metadata } from "next";
import DesignersContent from "./DesignersContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Designer's Collection | Mona Niko Gallery",
  description:
    "Exclusive designer collaborations and curated art pieces from the Mona Niko Designer's Collection.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/shop/designers" },
};

export default function DesignersShopPage() {
  return <DesignersContent />;
}
