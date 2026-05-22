"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function EmptyDrops({ compact }: { compact?: boolean }) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-16" : "min-h-[50vh] py-24"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative mb-8">
        <div className="h-32 w-32 animate-float rounded-full border border-sm-neon/30 bg-sm-neon/5" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">👟</div>
      </div>
      <h2 className="neon-text text-3xl font-black tracking-[0.2em] md:text-5xl">
        NEW DROPS COMING SOON.
      </h2>
      <p className="mt-4 max-w-lg text-white/60">
        The vault is loading. Follow us on Instagram and WhatsApp for the next heat drop
        from Bilaspur&apos;s premium sneaker destination.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/contact" className="btn-primary">
          Get Notified
        </Link>
        <a
          href="https://wa.me/917587555558"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          WhatsApp Us
        </a>
      </div>
    </motion.div>
  );
}
