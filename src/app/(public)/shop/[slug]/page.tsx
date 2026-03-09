"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/shop/ProductCard";
import { products } from "@/data/artworks";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { ProductVariant } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const product = products.find((p) => p.slug === slug);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants[0] ?? null
  );
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && p.type === product.type)
      .slice(0, 3);
  }, [product]);

  if (!product) {
    return (
      <div className="pt-[var(--header-height)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-black mb-4">Product Not Found</h1>
          <p className="text-charcoal-light mb-8">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/shop">
            <Button variant="primary">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : true;

  const handleAddToCart = () => {
    if (!selectedVariant || !isInStock) return;

    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      title: `${product.title}${selectedVariant.name ? ` — ${selectedVariant.name}` : ""}`,
      image: product.images[0],
      price: selectedVariant.price,
      quantity: 1,
      type: product.type,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
    openCart();
  };

  const editionInfo =
    product.type === "print"
      ? product.tags.includes("limited-edition")
        ? "Limited Edition"
        : "Open Edition"
      : "Original Work";

  return (
    <>
      {/* ─── Breadcrumb ────────────────────────────────────── */}
      <div className="pt-[var(--header-height)] bg-cream">
        <div className="container-gallery py-5">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase"
          >
            <Link href="/shop" className="text-charcoal-light hover:text-gold transition-colors">
              Shop
            </Link>
            <span className="text-warm-gray-dark">/</span>
            <Link
              href={product.type === "print" ? "/shop/prints" : "/shop/originals"}
              className="text-charcoal-light hover:text-gold transition-colors"
            >
              {product.type === "print" ? "Prints" : "Originals"}
            </Link>
            <span className="text-warm-gray-dark">/</span>
            <span className="text-charcoal">{product.title}</span>
          </motion.nav>
        </div>
      </div>

      {/* ─── Product Detail ────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container-gallery">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark">
                <Image
                  src={product.images[activeImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "relative w-20 h-20 overflow-hidden border-2 transition-colors",
                        activeImage === i
                          ? "border-gold"
                          : "border-transparent hover:border-warm-gray"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} view ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {/* Type Badge */}
              <span className="inline-block px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-medium bg-gold/10 text-gold mb-4">
                {editionInfo}
              </span>

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl text-black font-medium tracking-[-0.01em]">
                {product.title}
              </h1>

              {/* Price */}
              <p className="mt-4 font-serif text-2xl text-black">
                {formatPrice(currentPrice)}
              </p>

              {/* Divider */}
              <div className="divider-gold mt-6 mb-6" />

              {/* Description */}
              <p className="text-[15px] text-charcoal leading-relaxed">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.variants.length > 1 && (
                <div className="mt-8">
                  <p className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light font-medium mb-3">
                    Select Size
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={cn(
                          "px-5 py-3 border text-[13px] transition-all duration-200",
                          selectedVariant?.id === variant.id
                            ? "border-black bg-black text-white"
                            : variant.stock === 0
                            ? "border-warm-gray text-warm-gray-dark cursor-not-allowed line-through"
                            : "border-warm-gray text-charcoal hover:border-black"
                        )}
                      >
                        <span className="block">{variant.name}</span>
                        <span className="block text-[12px] mt-0.5 opacity-70">
                          {formatPrice(variant.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Indicator */}
              {selectedVariant && (
                <p className="mt-4 text-[12px] text-charcoal-light">
                  {selectedVariant.stock > 0 ? (
                    selectedVariant.stock <= 5 ? (
                      <span className="text-warning">
                        Only {selectedVariant.stock} remaining
                      </span>
                    ) : (
                      <span className="text-success">In stock</span>
                    )
                  ) : (
                    <span className="text-error">Sold out</span>
                  )}
                </p>
              )}

              {/* Add to Cart */}
              <div className="mt-8">
                <Button
                  variant={addedToCart ? "gold" : "primary"}
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                >
                  {addedToCart
                    ? "Added to Cart"
                    : !isInStock
                    ? "Sold Out"
                    : "Add to Cart"}
                </Button>
              </div>

              {/* Product Details */}
              <div className="mt-10 space-y-4 border-t border-warm-gray pt-8">
                <h3 className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light font-semibold mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-charcoal-light">Type</span>
                  <span className="text-charcoal capitalize">
                    {product.type === "print" ? "Giclée Print" : "Original Painting"}
                  </span>

                  <span className="text-charcoal-light">Edition</span>
                  <span className="text-charcoal">{editionInfo}</span>

                  {selectedVariant?.dimensions && (
                    <>
                      <span className="text-charcoal-light">Dimensions</span>
                      <span className="text-charcoal">{selectedVariant.dimensions}</span>
                    </>
                  )}

                  {product.type === "print" && (
                    <>
                      <span className="text-charcoal-light">Paper</span>
                      <span className="text-charcoal">310gsm Hahnemühle Photo Rag</span>

                      <span className="text-charcoal-light">Ink</span>
                      <span className="text-charcoal">Archival pigment inks (100+ years)</span>
                    </>
                  )}

                  <span className="text-charcoal-light">Certificate</span>
                  <span className="text-charcoal">Signed certificate of authenticity</span>

                  <span className="text-charcoal-light">Shipping</span>
                  <span className="text-charcoal">Professionally packed &amp; insured</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Related Products ──────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="py-24 md:py-32 bg-cream-dark">
          <div className="container-gallery">
            <SectionHeading
              title="You May Also Like"
              subtitle="Explore more works from the collection."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
