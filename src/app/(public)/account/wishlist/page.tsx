'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, Loader2, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

interface WishlistArtwork {
  id: string; title: string; slug: string; images: string;
  category: string; price: number | null; priceOnInquiry: boolean; status: string;
}
interface WishlistProduct {
  id: string; title: string; slug: string; images: string;
  type: string; basePrice: number;
}
interface WishlistItem {
  id: string;
  artworkId: string | null;
  productId: string | null;
  createdAt: string;
  artwork: WishlistArtwork | null;
  product: WishlistProduct | null;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/account/wishlist')
      .then((r) => r.ok ? r.json() : Promise.reject('Failed'))
      .then((d) => setItems(d.items))
      .catch(() => setError('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    setRemoving(id);
    await fetch(`/api/account/wishlist/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
    setRemoving(null);
  };

  const getImage = (images: string) => {
    try { const arr = JSON.parse(images); return arr[0] || null; } catch { return null; }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[#C4A265]" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center py-20 gap-3">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl md:text-3xl text-black font-medium">Wishlist</h1>
        {items.length > 0 && (
          <p className="text-sm text-[#6B6560]">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[#E8E5E0] p-12 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-[#C4A265] opacity-40" />
          <p className="font-serif text-lg text-black mb-2">Your wishlist is empty</p>
          <p className="text-sm text-[#6B6560] mb-6">Save artworks and products you love to find them easily later.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/gallery" className="inline-block px-5 py-2.5 bg-[#1A1A1A] text-white text-[11px] tracking-[0.12em] uppercase hover:bg-[#C4A265] transition-colors">
              Browse Gallery
            </Link>
            <Link href="/shop" className="inline-block px-5 py-2.5 border border-[#1A1A1A] text-black text-[11px] tracking-[0.12em] uppercase hover:bg-[#1A1A1A] hover:text-white transition-colors">
              Visit Shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => {
            const art = item.artwork;
            const prod = item.product;
            const title = art?.title ?? prod?.title ?? '';
            const slug = art ? `/gallery/${art.slug}` : `/shop/${prod?.slug}`;
            const imgSrc = art ? getImage(art.images) : prod ? getImage(prod.images) : null;
            const priceLabel = art
              ? art.priceOnInquiry ? 'Price on inquiry'
              : art.price ? formatPrice(art.price) : 'Price on inquiry'
              : prod ? formatPrice(prod.basePrice) : '';
            const badge = art?.status === 'SOLD' ? 'Sold' : art?.status === 'ON_EXHIBITION' ? 'On Exhibition' : null;

            return (
              <div key={item.id} className="bg-white border border-[#E8E5E0] group flex flex-col">
                <Link href={slug} className="relative block aspect-[4/3] bg-[#F5F3F0] overflow-hidden">
                  {imgSrc ? (
                    <Image src={imgSrc} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-[#C4A265] opacity-30" />
                    </div>
                  )}
                  {badge && (
                    <div className="absolute top-3 left-3 bg-black/80 text-white text-[9px] tracking-[0.1em] uppercase px-2 py-1">
                      {badge}
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <p className="text-[10px] tracking-[0.15em] uppercase text-[#C4A265] mb-1">
                      {art ? art.category.replace('_', ' ') : prod?.type.replace(/_/g, ' ')}
                    </p>
                    <Link href={slug}>
                      <h3 className="font-serif text-base text-black hover:text-[#C4A265] transition-colors leading-snug">{title}</h3>
                    </Link>
                    <p className="text-sm text-[#6B6560] mt-1">{priceLabel}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F5F3F0]">
                    <Link
                      href={slug}
                      className="text-[10px] tracking-[0.12em] uppercase text-black hover:text-[#C4A265] transition-colors font-medium"
                    >
                      {art?.status === 'AVAILABLE' || prod ? 'View & Add to Cart' : 'View Details'}
                    </Link>
                    <button
                      onClick={() => remove(item.id)}
                      disabled={removing === item.id}
                      className="p-1.5 text-[#6B6560] hover:text-red-500 transition-colors disabled:opacity-50"
                      aria-label="Remove from wishlist"
                    >
                      {removing === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
