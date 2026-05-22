"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-20">
        <p className="text-2xl font-bold">Your cart is empty</p>
        <Link href="/shop" className="btn-primary mt-6">
          Shop Drops
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-black tracking-[0.15em]">CART</h1>
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="glass flex gap-4 rounded-2xl p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sm-slate">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-white/50">Size: {item.size}</p>
                <p className="text-sm-neon font-bold">{formatPrice(item.price)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => updateQty(item.productId, item.size, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.size, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                  <button onClick={() => removeItem(item.productId, item.size)} className="ml-auto text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="glass mt-8 rounded-2xl p-6">
          <div className="flex justify-between text-lg font-bold">
            <span>Subtotal</span>
            <span className="text-sm-neon">{formatPrice(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 block w-full text-center">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
