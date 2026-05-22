import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { STORE } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-sm-charcoal">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="text-2xl font-black tracking-[0.15em]">
            SHOE<span className="text-sm-neon">MAFIA</span>
          </h3>
          <p className="mt-4 max-w-md text-sm text-white/60">
            Bilaspur&apos;s premium luxury sneaker destination. Authentic streetwear heat,
            limited drops, cinematic experience.
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm text-sm-gold">
            ★ {STORE.rating}/5 Google Rating
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold tracking-widest text-sm-neon uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/track">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold tracking-widest text-sm-neon uppercase">
            Visit Us
          </h4>
          <p className="flex gap-2 text-sm text-white/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sm-accent" />
            {STORE.address}
          </p>
          <a
            href={`tel:${STORE.phoneRaw}`}
            className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-sm-neon"
          >
            <Phone className="h-4 w-4" />
            {STORE.phone}
          </a>
          <a
            href={STORE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm text-white/70 hover:text-sm-neon"
          >
            <Instagram className="h-4 w-4" />
            Instagram
          </a>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} SHOE MAFIA. All rights reserved. Bilaspur, Chhattisgarh.
      </div>
    </footer>
  );
}
