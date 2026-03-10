import type { Metadata } from "next";
import AboutContent from "./AboutContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "About Mona Niko — Contemporary Artist | Mission Viejo, CA",
  description:
    "Meet Mona Niko — contemporary artist and gallery owner in Mission Viejo, CA. Explore her journey, artistic vision, and Persian heritage-inspired works.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    title: "About Mona Niko — Contemporary Artist | Mission Viejo, CA",
    description:
      "Meet Mona Niko — contemporary artist and gallery owner in Mission Viejo, CA. Explore her journey, artistic vision, and Persian heritage-inspired works.",
    url: BASE_URL + "/about",
    images: [{ url: "/images/hero/artist-portrait.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: BASE_URL + "/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
