import type { Metadata } from "next";
import CommissionsContent from "./CommissionsContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Custom Commissions — Original Paintings to Order | Mona Niko",
  description:
    "Commission a one-of-a-kind original painting by Mona Niko. Share your vision and receive a bespoke artwork crafted with care. Inquire today.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    url: BASE_URL + "/commissions",
  },
  alternates: { canonical: BASE_URL + "/commissions" },
};

export default function CommissionsPage() {
  return <CommissionsContent />;
}
