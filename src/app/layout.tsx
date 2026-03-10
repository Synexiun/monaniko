import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monaniko.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Mona Niko — Contemporary Fine Art Gallery",
    template: "%s | Mona Niko Gallery",
  },
  description:
    "Discover original paintings, limited edition prints, and immersive art workshops by Mona Niko. Contemporary fine art gallery in Mission Viejo, California.",
  keywords: [
    "Mona Niko",
    "contemporary art",
    "fine art gallery",
    "original paintings",
    "art prints",
    "art workshops",
    "Mission Viejo gallery",
    "abstract art",
    "mixed media art",
    "California artist",
    "buy original art",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Mona Niko Gallery",
    title: "Mona Niko — Contemporary Fine Art Gallery",
    description:
      "Discover original paintings, limited edition prints, and immersive art workshops by Mona Niko. Fine art gallery in Mission Viejo, CA.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "Mona Niko Gallery" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@monaniko",
    creator: "@monaniko",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ArtGallery",
      "@id": `${BASE_URL}/#gallery`,
      "name": "Mona Niko Gallery",
      "url": BASE_URL,
      "description": "Contemporary fine art gallery featuring original paintings, limited edition prints, and immersive art workshops by Mona Niko.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "668B The Shops At Mission Viejo Mall",
        "addressLocality": "Mission Viejo",
        "addressRegion": "CA",
        "postalCode": "92691",
        "addressCountry": "US",
      },
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "10:00", "closes": "18:00" },
      ],
    },
    {
      "@type": "Person",
      "@id": `${BASE_URL}/#artist`,
      "name": "Mona Niko",
      "jobTitle": "Contemporary Artist",
      "worksFor": { "@id": `${BASE_URL}/#gallery` },
      "url": `${BASE_URL}/about`,
      "description": "Contemporary artist known for vibrant figurative paintings, mixed media works, and Persian heritage-inspired art.",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
