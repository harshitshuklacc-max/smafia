"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/products/ProductGrid";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { STORE } from "@/lib/utils";
import { Instagram } from "lucide-react";

type Product = {
  slug: string;
  name: string;
  price: number;
  images: string[];
  brandName?: string;
  isLimited?: boolean;
  isNewArrival?: boolean;
  outOfStock?: boolean;
};

export function HomeSections({
  featured,
  trending,
  newArrivals,
}: {
  featured: Product[];
  trending: Product[];
  newArrivals: Product[];
}) {
  return (
    <>
      {featured.length > 0 && (
        <Section title="Featured Drops" subtitle="Curated heat for the culture">
          <ProductGrid products={featured} />
        </Section>
      )}
      {trending.length > 0 && (
        <Section title="Trending Now" subtitle="What Bilaspur is rocking">
          <ProductGrid products={trending} />
        </Section>
      )}
      {newArrivals.length > 0 && (
        <Section title="New Arrivals" subtitle="Fresh pairs just landed">
          <ProductGrid products={newArrivals} />
        </Section>
      )}

      <section className="px-6 py-20">
        <div className="glass mx-auto max-w-7xl rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-black tracking-[0.15em]">CATEGORIES</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {["Sneakers", "Streetwear", "Casual", "Limited Edition"].map((c) => (
              <Link
                key={c}
                href={`/shop?category=${c.toLowerCase().replace(/ /g, "-")}`}
                className="card-hover glass rounded-2xl p-6 text-center"
              >
                <span className="text-3xl">👟</span>
                <p className="mt-3 text-sm font-bold tracking-widest uppercase">{c}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-black tracking-[0.15em]">BRAND COLLABS</h2>
          <p className="mt-2 text-white/60">Nike · Jordan · Adidas · New Balance · ASICS</p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-60">
            {["NIKE", "JORDAN", "YEEZY", "NEW BALANCE", "PUMA"].map((b) => (
              <span key={b} className="text-xl font-black tracking-widest">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="glass mx-auto max-w-7xl rounded-3xl p-8 text-center">
          <Instagram className="mx-auto h-8 w-8 text-sm-neon" />
          <h2 className="mt-4 text-2xl font-black tracking-[0.15em]">INSTAGRAM GALLERY</h2>
          <p className="mt-2 text-white/60">Tag @shoemafia for a feature</p>
          <div className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-sm-slate bg-gradient-to-br from-sm-neon/10 to-sm-accent/10"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black tracking-[0.15em]">CUSTOMER REVIEWS</h2>
          <blockquote className="glass mt-8 rounded-2xl p-8">
            <p className="text-lg italic text-white/80">
              &ldquo;Best sneaker store in Bilaspur. Premium quality, authentic vibes.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-sm-neon">— Local Customer ★★★★☆</footer>
          </blockquote>
        </div>
      </section>

      <section className="px-6 py-20">
        <NewsletterForm />
      </section>

      <section className="px-6 pb-24">
        <div className="glass mx-auto max-w-7xl overflow-hidden rounded-3xl">
          <h2 className="p-8 text-2xl font-black tracking-[0.15em]">VISIT THE STORE</h2>
          <iframe
            title="SHOE MAFIA Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.5!2d82.15!3d22.09!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDA1JzI0LjAiTiA4MsKwMDknMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="p-6 text-sm text-white/60">{STORE.address}</p>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-20">
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-[0.15em]">{title}</h2>
            <p className="mt-2 text-white/60">{subtitle}</p>
          </div>
          <Link href="/shop" className="btn-ghost text-sm">
            View All →
          </Link>
        </div>
        {children}
      </motion.div>
    </section>
  );
}
