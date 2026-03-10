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
import type { ProductVariant, ShopCategory } from "@/types";

function getCategoryBreadcrumb(shopCategory: ShopCategory) {
  if (shopCategory === "print_limited_edition")
    return { label: "Prints", href: "/shop/prints" };
  if (shopCategory === "original_painting")
    return { label: "Originals", href: "/shop/originals" };
  if (shopCategory === "designers_collection")
    return { label: "Designers Collection", href: "/shop/designers" };
  if (shopCategory === "workshop")
    return { label: "Workshops", href: "/workshops" };
  if (shopCategory.startsWith("merch_"))
    return { label: "Merch & Objects", href: "/shop/merch" };
  return { label: "Shop", href: "/shop" };
}

function getEditionInfo(type: string, shopCategory: ShopCategory, tags: string[]) {
  if (type === "print") {
    return tags.includes("limited-edition") ? "Limited Edition" : "Open Edition";
  }
  if (type === "original") return "Original Work";
  if (shopCategory === "designers_collection") return "Designers Collection";
  if (shopCategory.startsWith("merch_")) return "Merchandise";
  if (shopCategory === "workshop") return "Workshop";
  return "Product";
}

function getVariantLabel(shopCategory: ShopCategory) {
  if (
    shopCategory === "merch_tshirt" ||
    shopCategory === "merch_sweatshirt" ||
    shopCategory === "merch_leggings" ||
    shopCategory === "designers_collection"
  )
    return "Select Size";
  if (shopCategory === "merch_phone_case" || shopCategory === "merch_laptop_case")
    return "Select Model";
  if (shopCategory === "merch_cushion") return "Select Size";
  if (shopCategory === "merch_suitcase") return "Select Size";
  if (shopCategory === "print_limited_edition") return "Select Size";
  return "Select Option";
}

function getTypeDetails(type: string, shopCategory: ShopCategory) {
  const details: { label: string; value: string }[] = [];
  if (type === "print") {
    details.push(
      { label: "Type", value: "Giclée Print" },
      { label: "Paper", value: "310gsm Hahnemühle Photo Rag" },
      { label: "Ink", value: "Archival pigment inks (100+ years)" }
    );
  } else if (shopCategory === "designers_collection") {
    details.push({ label: "Type", value: "Designer Garment" });
  } else if (shopCategory.startsWith("merch_")) {
    const merchLabels: Record<string, string> = {
      merch_phone_case: "Phone Case",
      merch_cushion: "Art Cushion",
      merch_tshirt: "T-Shirt",
      merch_sweatshirt: "Sweatshirt",
      merch_leggings: "Leggings",
      merch_laptop_case: "Laptop Case",
      merch_suitcase: "Suitcase",
      merch_tie: "Silk Tie",
    };
    details.push({ label: "Type", value: merchLabels[shopCategory] ?? "Merchandise" });
  } else {
    details.push({ label: "Type", value: "Original Painting" });
  }
  return details;
}

export default function ProductDetailContent() {
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
      .filter((p) => p.id !== product.id && p.shopCategory === product.shopCategory)
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
  const breadcrumb = getCategoryBreadcrumb(product.shopCategory);
  const editionInfo = getEditionInfo(product.type, product.shopCategory, product.tags);
  const variantLabel = getVariantLabel(product.shopCategory);
  const typeDetails = getTypeDetails(product.type, product.shopCategory);

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
            <Link href={breadcrumb.href} className="text-charcoal-light hover:text-gold transition-colors">
              {breadcrumb.label}
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
                      <Image src={img} alt={`${product.title} view ${i + 1}`} fill className="object-cover" sizes="80px" />
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
              <span className="inline-block px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-medium bg-gold/10 text-gold mb-4">
                {editionInfo}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-black font-medium tracking-[-0.01em]">
                {product.title}
              </h1>
              <p className="mt-4 font-serif text-2xl text-black">
                {formatPrice(currentPrice)}
              </p>
              <div className="divider-gold mt-6 mb-6" />
              <p className="text-[15px] text-charcoal leading-relaxed">
                {product.description}
              </p>

              {product.variants.length > 1 && (
                <div className="mt-8">
                  <p className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light font-medium mb-3">
                    {variantLabel}
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

              {selectedVariant && (
                <p className="mt-4 text-[12px] text-charcoal-light">
                  {selectedVariant.stock > 0 ? (
                    selectedVariant.stock <= 5 ? (
                      <span className="text-warning">Only {selectedVariant.stock} remaining</span>
                    ) : (
                      <span className="text-success">In stock</span>
                    )
                  ) : (
                    <span className="text-error">Sold out</span>
                  )}
                </p>
              )}

              <div className="mt-8">
                <Button
                  variant={addedToCart ? "gold" : "primary"}
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                >
                  {addedToCart ? "Added to Cart" : !isInStock ? "Sold Out" : "Add to Cart"}
                </Button>
              </div>

              <div className="mt-10 space-y-4 border-t border-warm-gray pt-8">
                <h3 className="text-[11px] tracking-[0.15em] uppercase text-charcoal-light font-semibold mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  {typeDetails.map((detail) => (
                    <span key={detail.label} className="contents">
                      <span className="text-charcoal-light">{detail.label}</span>
                      <span className="text-charcoal">{detail.value}</span>
                    </span>
                  ))}
                  <span className="text-charcoal-light">Edition</span>
                  <span className="text-charcoal">{editionInfo}</span>
                  {selectedVariant?.dimensions && (
                    <>
                      <span className="text-charcoal-light">Dimensions</span>
                      <span className="text-charcoal">{selectedVariant.dimensions}</span>
                    </>
                  )}
                  {(product.type === "print" || product.type === "original") && (
                    <>
                      <span className="text-charcoal-light">Certificate</span>
                      <span className="text-charcoal">Signed certificate of authenticity</span>
                    </>
                  )}
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
            <SectionHeading title="You May Also Like" subtitle="Explore more from this collection." />
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
