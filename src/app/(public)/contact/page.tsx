import type { Metadata } from "next";
import ContactContent from "./ContactContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

export const metadata: Metadata = {
  title: "Contact | Mona Niko Gallery",
  description:
    "Get in touch with Mona Niko Gallery. Visit us at The Shops at Mission Viejo, book a private viewing, or inquire about original artworks and commissions.",
  openGraph: {
    type: "website",
    siteName: "Mona Niko Gallery",
    locale: "en_US",
    url: BASE_URL + "/contact",
  },
  alternates: { canonical: BASE_URL + "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
