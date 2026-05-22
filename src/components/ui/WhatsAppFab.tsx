"use client";

import { MessageCircle } from "lucide-react";
import { STORE } from "@/lib/utils";

export function WhatsAppFab() {
  return (
    <a
      href={STORE.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </a>
  );
}
