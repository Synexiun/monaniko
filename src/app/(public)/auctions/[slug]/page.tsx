import type { Metadata } from "next";
import AuctionDetailContent from "./AuctionDetailContent";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://monaniko.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const url = `${BASE_URL}/auctions/${slug}`;
  return {
    title: `Auction — ${slug.replace(/-/g, ' ')} | Mona Niko Gallery`,
    description: "Place your bid on this original artwork by Mona Niko. Live auction — bid before time runs out.",
    openGraph: {
      type: "website",
      siteName: "Mona Niko Gallery",
      locale: "en_US",
      url,
    },
    alternates: { canonical: url },
  };
}

export default function AuctionDetailPage() {
  return <AuctionDetailContent />;
}
