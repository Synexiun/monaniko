import type { Metadata } from "next";
import JournalContent from "./JournalContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Journal — Art, Studio & Inspiration | Mona Niko",
  description:
    "Explore Mona Niko's journal: behind-the-scenes studio stories, artistic insights, collection updates, and art world inspiration.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/journal" },
};

export default function JournalPage() {
  return <JournalContent />;
}
