"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="gradient-hero relative flex min-h-screen items-center overflow-hidden pt-32 pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-sm-neon/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-sm-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs tracking-[0.4em] text-sm-accent uppercase">
            Bilaspur · Chhattisgarh · India
          </p>
          <h1 className="mt-4 text-5xl leading-[0.95] font-black tracking-tight md:text-7xl lg:text-8xl">
            WEAR THE
            <br />
            <span className="neon-text text-sm-neon">MAFIA.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">
            Premium sneakers & streetwear footwear. Cinematic drops inspired by global
            heat — Jordan, Yeezy, Nike culture — reimagined for Bilaspur.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/shop" className="btn-primary">
              Explore Drops
            </Link>
            <Link href="/about" className="btn-ghost">
              Our Story
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="animate-float relative h-[400px] w-full max-w-lg md:h-[500px]">
            <Image
              src="/images/hero-sneaker.svg"
              alt="Premium sneaker"
              fill
              className="object-contain drop-shadow-[0_0_60px_rgba(57,255,20,0.2)]"
              priority
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest text-white/40"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        SCROLL ↓
      </motion.div>
    </section>
  );
}
