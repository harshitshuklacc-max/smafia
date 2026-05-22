"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  image: string;
  brandName?: string;
  isLimited?: boolean;
  isNewArrival?: boolean;
  outOfStock?: boolean;
};

export function ProductCard({
  slug,
  name,
  price,
  image,
  brandName,
  isLimited,
  isNewArrival,
  outOfStock,
}: ProductCardProps) {
  return (
    <motion.article
      className="glass card-hover group overflow-hidden rounded-2xl"
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 24 }}
      viewport={{ once: true }}
    >
      <Link href={`/shop/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-sm-slate">
          <Image
            src={image || "/images/placeholder-sneaker.svg"}
            alt={name}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
            sizes="(max-width:768px) 50vw, 25vw"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {isLimited && (
              <span className="rounded-full bg-sm-gold/90 px-3 py-1 text-[10px] font-bold tracking-wider text-black uppercase">
                Limited
              </span>
            )}
            {isNewArrival && (
              <span className="rounded-full bg-sm-accent/90 px-3 py-1 text-[10px] font-bold tracking-wider text-black uppercase">
                New Drop
              </span>
            )}
            {outOfStock && (
              <span className="rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                Out of Stock
              </span>
            )}
          </div>
        </div>
        <div className="p-5">
          {brandName && (
            <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">{brandName}</p>
          )}
          <h3 className="mt-1 font-semibold tracking-wide">{name}</h3>
          <p className="mt-2 text-lg font-bold text-sm-neon">{formatPrice(price)}</p>
        </div>
      </Link>
    </motion.article>
  );
}
