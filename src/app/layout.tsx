import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
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

export const metadata: Metadata = {
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
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mona Niko Gallery",
    title: "Mona Niko — Contemporary Fine Art Gallery",
    description:
      "Discover original paintings, limited edition prints, and immersive art workshops by Mona Niko.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
