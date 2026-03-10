import type { Metadata } from "next";
import PrintsContent from "./PrintsContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Limited Edition Prints | Mona Niko Gallery",
  description:
    "Shop limited edition fine art prints by Mona Niko. Museum-quality giclée prints on archival paper, available in multiple sizes.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/shop/prints" },
};

export default function PrintsShopPage() {
  return <PrintsContent />;
}
