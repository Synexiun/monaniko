import type { Metadata } from "next";
import FaqContent from "./FaqContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | Mona Niko Gallery",
  description:
    "Answers to common questions about purchasing original art, limited edition prints, custom commissions, and art workshops at Mona Niko Gallery.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/faq" },
};

export default function FaqPage() {
  return <FaqContent />;
}
