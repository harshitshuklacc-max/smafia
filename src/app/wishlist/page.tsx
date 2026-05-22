import { EmptyDrops } from "@/components/products/EmptyDrops";
import Link from "next/link";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-4xl font-black tracking-[0.15em]">WISHLIST</h1>
        <p className="mt-4 text-white/60">Sign in to save your favorite pairs</p>
        <div className="mt-12">
          <EmptyDrops compact />
        </div>
        <Link href="/login" className="btn-primary mt-8 inline-flex">
          Sign In
        </Link>
      </div>
    </div>
  );
}
