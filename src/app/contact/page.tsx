"use client";

import { useState } from "react";
import { STORE } from "@/lib/utils";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="gradient-hero min-h-screen pt-32 pb-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
        <div>
          <h1 className="text-5xl font-black tracking-[0.1em]">CONTACT</h1>
          <p className="mt-4 text-white/60">We&apos;d love to hear from you</p>
          <ul className="mt-8 space-y-4">
            <li className="flex gap-3 text-white/80">
              <MapPin className="h-5 w-5 text-sm-neon shrink-0" />
              {STORE.address}
            </li>
            <li>
              <a href={`tel:${STORE.phoneRaw}`} className="flex gap-3 hover:text-sm-neon">
                <Phone className="h-5 w-5 text-sm-neon" />
                {STORE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 text-sm-neon" />
              {STORE.email}
            </li>
          </ul>
          <a href={STORE.whatsapp} className="btn-primary mt-8 inline-flex" target="_blank" rel="noopener noreferrer">
            WhatsApp Chat
          </a>
        </div>
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8">
          <input placeholder="Your Name" required />
          <input type="email" placeholder="Email" className="mt-4" required />
          <input placeholder="Phone" className="mt-4" />
          <textarea placeholder="Message" rows={5} className="mt-4" required />
          <button type="submit" className="btn-primary mt-6 w-full">
            Send Message
          </button>
          {sent && <p className="mt-4 text-center text-sm text-sm-neon">Message received! We&apos;ll reply soon.</p>}
        </form>
      </div>
    </div>
  );
}
