import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
