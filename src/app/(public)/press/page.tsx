import type { Metadata } from "next";
import PressContent from "./PressContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Press & Media | Mona Niko Gallery",
  description:
    "Mona Niko featured in press and media. Read coverage of exhibitions, artist features, and gallery news.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/press" },
};

export default function PressPage() {
  return <PressContent />;
}
