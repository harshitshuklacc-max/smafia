import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { WhatsAppFab } from "@/components/ui/WhatsAppFab";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

export const metadata: Metadata = {
  title: {
    default: "SHOE MAFIA | Premium Sneakers Bilaspur",
    template: "%s | SHOE MAFIA",
  },
  description:
    "SHOE MAFIA — Bilaspur's premium luxury sneaker & streetwear store. Limited drops, authentic heat, cinematic streetwear experience.",
  keywords: [
    "sneakers Bilaspur",
    "SHOE MAFIA",
    "streetwear shoes",
    "premium sneakers India",
    "Chhattisgarh sneaker store",
  ],
  openGraph: {
    title: "SHOE MAFIA | Premium Sneakers",
    description: "Luxury sneaker drops from Bilaspur, Chhattisgarh",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LocalBusinessSchema />
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppFab />
        </CartProvider>
      </body>
    </html>
  );
}
