import type { Metadata } from "next";
import CollectionsContent from "./CollectionsContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Collections — Curated Art Series | Mona Niko Gallery",
  description:
    "Explore curated collections by Mona Niko. Each series tells a unique story through original paintings, limited prints, and mixed media works.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/collections" },
};

export default function CollectionsPage() {
  return <CollectionsContent />;
}
