import type { Metadata } from "next";
import HomepageContent from "./HomepageContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Mona Niko — Contemporary Fine Art Gallery | Mission Viejo, CA",
  description:
    "Discover original paintings, limited edition prints, and art workshops by Mona Niko. Fine art gallery located at The Shops at Mission Viejo, California.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    url: BASE_URL,
    images: [{ url: "/images/hero/hero-main.jpg", width: 1200, height: 630, alt: "Mona Niko Gallery" }],
  },
  alternates: { canonical: BASE_URL },
};

export default function HomePage() {
  return <HomepageContent />;
}
