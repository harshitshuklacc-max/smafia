"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="glass-strong mx-auto mt-4 max-w-7xl rounded-2xl px-6 py-4 md:mx-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <motion.span
              className="text-xl font-black tracking-[0.2em] md:text-2xl"
              whileHover={{ scale: 1.02 }}
            >
              SHOE<span className="text-sm-neon">MAFIA</span>
            </motion.span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium tracking-widest uppercase transition-colors",
                  pathname === l.href ? "text-sm-neon" : "text-white/70 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/shop" className="hidden rounded-full p-2 hover:bg-white/5 sm:block" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/wishlist" className="rounded-full p-2 hover:bg-white/5" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/login" className="rounded-full p-2 hover:bg-white/5" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/cart" className="relative rounded-full p-2 hover:bg-white/5" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sm-neon text-[10px] font-bold text-black">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="rounded-full p-2 md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 md:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-widest uppercase"
              >
                {l.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </div>
    </header>
  );
}
