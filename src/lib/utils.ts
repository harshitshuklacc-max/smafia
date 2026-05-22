import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateSku(name: string) {
  const prefix = "SM";
  const code = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${code}-${rand}`;
}

export function generateInventoryId() {
  return `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function generateBarcodeValue(inventoryId: string) {
  const numeric = inventoryId.replace(/\D/g, "").slice(-12).padStart(12, "0");
  return numeric;
}

export function parseJsonArray<T = string>(json: string): T[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const STORE = {
  name: "SHOE MAFIA",
  tagline: "Premium Sneakers & Streetwear",
  rating: 4.0,
  address:
    "Bus Stand, Old Telephone Exchange Road, Telipara, Bilaspur, Chhattisgarh 495001, India",
  phone: "+91 75875 55558",
  phoneRaw: "917587555558",
  whatsapp: "https://wa.me/917587555558",
  instagram: "https://instagram.com",
  email: "contact@shoemafia.in",
  city: "Bilaspur",
  state: "Chhattisgarh",
};
