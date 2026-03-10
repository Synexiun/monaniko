import type { Metadata } from "next";
import CollectorClubContent from "./CollectorClubContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Collector Club — Exclusive Art Membership | Mona Niko Gallery",
  description:
    "Join the Mona Niko Collector Club. Silver, Gold & Platinum tiers offering private viewings, studio visits, first access to new works, and dedicated liaison service.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/collector-club" },
};

export default function CollectorClubPage() {
  return <CollectorClubContent />;
}
