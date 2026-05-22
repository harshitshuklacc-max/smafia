import { STORE } from "@/lib/utils";

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="gradient-hero min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-5xl font-black tracking-[0.1em]">
          ABOUT <span className="text-sm-neon">SHOE MAFIA</span>
        </h1>
        <p className="mt-6 text-lg text-white/70 leading-relaxed">
          Born in the heart of Bilaspur, Chhattisgarh, SHOE MAFIA is more than a sneaker store —
          it&apos;s a culture. We curate premium streetwear footwear inspired by global icons:
          Nike, Jordan, Yeezy, and the underground heat you find on StockX and GOAT.
        </p>
        <div className="glass mt-12 grid gap-8 rounded-3xl p-8 md:grid-cols-3">
          <div>
            <p className="text-3xl font-black text-sm-neon">4.0★</p>
            <p className="text-sm text-white/60">Google Rating</p>
          </div>
          <div>
            <p className="text-3xl font-black text-sm-accent">100%</p>
            <p className="text-sm text-white/60">Authentic Heat</p>
          </div>
          <div>
            <p className="text-3xl font-black text-sm-gold">BILASPUR</p>
            <p className="text-sm text-white/60">Home Base</p>
          </div>
        </div>
        <p className="mt-12 text-white/60">
          Visit us at {STORE.address}. Call {STORE.phone} for inquiries.
        </p>
      </div>
    </div>
  );
}
