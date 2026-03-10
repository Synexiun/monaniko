import type { Metadata } from "next";
import KidsClubContent from "./KidsClubContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Kids Club — Art Classes for Children | Mona Niko Gallery",
  description:
    "Inspire creativity in young artists! Mona Niko Gallery's Kids Club offers fun art classes and workshops for children in Mission Viejo, CA.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
  },
  alternates: { canonical: BASE_URL + "/kids-club" },
};

export default function KidsClubPage() {
  return <KidsClubContent />;
}
