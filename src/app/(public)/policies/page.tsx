import type { Metadata } from "next";
import PoliciesContent from "./PoliciesContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Policies — Shipping, Returns & Privacy | Mona Niko Gallery",
  description:
    "Review shipping, return, and privacy policies for Mona Niko Gallery purchases, workshops, and digital services.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/policies" },
};

export default function PoliciesPage() {
  return <PoliciesContent />;
}
