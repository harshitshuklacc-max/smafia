"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { Heart, ShoppingBag } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  sizes: string[];
  brandName?: string;
  categoryName?: string;
  artNo?: string;
  color?: string;
  busyBcn?: string;
  outOfStock: boolean;
  inStock: boolean;
  isLimited?: boolean;
  quantity: number;
};

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
};

export function ProductDetailClient({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  const [size, setSize] = useState(product.sizes[0] || "");
  const [img, setImg] = useState(0);
  const { addItem } = useCart();

  function addToCart() {
    if (!size || product.outOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size,
      quantity: 1,
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-sm-slate">
        <Image
          src={product.images[img] || "/images/placeholder-sneaker.svg"}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImg(i)}
                className={`h-2 w-8 rounded-full ${i === img ? "bg-sm-neon" : "bg-white/30"}`}
              />
            ))}
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {product.brandName && (
          <p className="text-xs tracking-[0.3em] text-sm-accent uppercase">{product.brandName}</p>
        )}
        <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
        <p className="mt-4 text-3xl font-bold text-sm-neon">{formatPrice(product.price)}</p>
        {product.busyBcn && (
          <p className="mt-2 text-xs text-white/40">BCN: {product.busyBcn}</p>
        )}
        {(product.color || product.artNo) && (
          <p className="mt-1 text-sm text-white/60">
            {product.artNo && <span>Art: {product.artNo}</span>}
            {product.color && <span> · Colour: {product.color}</span>}
          </p>
        )}
        {product.comparePrice && (
          <p className="text-white/40 line-through">{formatPrice(product.comparePrice)}</p>
        )}

        {product.isLimited && (
          <span className="mt-4 inline-block rounded-full bg-sm-gold px-4 py-1 text-xs font-bold text-black">
            LIMITED EDITION
          </span>
        )}

        <p className="mt-6 text-white/70 leading-relaxed">{product.description}</p>

        <div className="mt-8">
          <p className="mb-3 text-xs tracking-widest text-white/50 uppercase">Select Size (UK)</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`min-w-[3rem] rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  size === s
                    ? "border-sm-neon bg-sm-neon/10 text-sm-neon"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {product.outOfStock ? (
          <p className="mt-8 rounded-xl border border-red-500/50 bg-red-500/10 px-6 py-4 text-center font-bold text-red-400">
            OUT OF STOCK
          </p>
        ) : (
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={addToCart} className="btn-primary flex-1 sm:flex-none">
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </button>
            <button className="btn-ghost">
              <Heart className="h-5 w-5" />
              Wishlist
            </button>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-12">
            <h3 className="font-bold tracking-widest uppercase">Reviews</h3>
            {reviews.map((r) => (
              <div key={r.id} className="glass mt-4 rounded-xl p-4">
                <p className="text-sm-neon">{"★".repeat(r.rating)}</p>
                <p className="mt-2 text-sm">{r.comment}</p>
                <p className="mt-1 text-xs text-white/50">— {r.authorName}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
