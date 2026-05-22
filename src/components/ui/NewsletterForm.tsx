"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "ok" : "err");
    if (res.ok) setEmail("");
  }

  return (
    <div className="glass mx-auto max-w-xl rounded-3xl p-8 text-center">
      <h3 className="text-xl font-black tracking-[0.15em]">JOIN THE MAFIA</h3>
      <p className="mt-2 text-sm text-white/60">First access to drops & exclusive offers</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary shrink-0">
          Subscribe
        </button>
      </form>
      {status === "ok" && <p className="mt-3 text-sm text-sm-neon">You&apos;re on the list!</p>}
    </div>
  );
}
