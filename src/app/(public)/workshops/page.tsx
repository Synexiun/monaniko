import type { Metadata } from "next";
import WorkshopsContent from "./WorkshopsContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Art Workshops & Classes | Mona Niko Gallery",
  description:
    "Join immersive art workshops led by Mona Niko in Mission Viejo, CA. Beginner to advanced classes in painting, mixed media, ceramics, and more.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    url: BASE_URL + "/workshops",
    images: [{ url: "/images/hero/workshop-preview.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: BASE_URL + "/workshops" },
};

export default function WorkshopsPage() {
  return <WorkshopsContent />;
}
