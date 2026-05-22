"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { Smartphone } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<"cod" | "upi" | "razorpay">("upi");

  const gst = Math.round(subtotal * 0.05);
  const shipping = subtotal > 2999 ? 0 : 99;
  const total = subtotal + gst + shipping;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
        })),
        guestName: form.get("name"),
        guestEmail: form.get("email"),
        guestPhone: form.get("phone"),
        shippingAddress: form.get("address"),
        paymentMethod: payment,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const order = await res.json();
      clear();
      if (payment === "upi") {
        router.push(
          `/checkout/upi?order=${encodeURIComponent(order.orderNumber)}&amount=${order.total}&track=${order.trackingCode}`
        );
      } else {
        router.push(`/track?code=${order.trackingCode}`);
      }
    } else {
      const err = await res.json();
      alert(err.error || "Order failed");
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cart is empty</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
        <form onSubmit={placeOrder} className="glass rounded-3xl p-8">
          <h1 className="text-3xl font-black">CHECKOUT</h1>
          <input name="name" placeholder="Full Name" className="mt-6" required />
          <input name="email" type="email" placeholder="Email" className="mt-4" required />
          <input name="phone" placeholder="Phone (+91)" className="mt-4" required />
          <textarea name="address" placeholder="Shipping Address" rows={3} className="mt-4" required />

          <p className="mt-6 text-xs font-bold tracking-widest text-white/50 uppercase">Payment</p>
          <div className="mt-3 space-y-3">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                payment === "upi" ? "border-sm-neon bg-sm-neon/10" : "border-white/10"
              }`}
            >
              <input
                type="radio"
                checked={payment === "upi"}
                onChange={() => setPayment("upi")}
              />
              <Smartphone className="h-5 w-5 text-sm-neon" />
              <div>
                <span className="font-semibold">UPI QR Pay</span>
                <p className="text-xs text-white/50">GPay · PhonePe · Paytm → 7587555558-2@ybl</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 p-4">
              <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
              Cash on Delivery
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 p-4">
              <input
                type="radio"
                checked={payment === "razorpay"}
                onChange={() => setPayment("razorpay")}
              />
              Razorpay (Card / UPI gateway)
            </label>
          </div>

          <button type="submit" className="btn-primary mt-8 w-full" disabled={loading}>
            {loading
              ? "Processing..."
              : payment === "upi"
                ? `Place Order & Pay ${formatPrice(total)}`
                : `Place Order — ${formatPrice(total)}`}
          </button>
        </form>

        <div className="glass h-fit rounded-3xl p-8">
          <h2 className="font-bold">Order Summary</h2>
          {items.map((i) => (
            <div key={`${i.productId}-${i.size}`} className="mt-4 flex justify-between text-sm">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
          <hr className="my-4 border-white/10" />
          <div className="flex justify-between text-sm">
            <span>GST (5%)</span>
            <span>{formatPrice(gst)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="mt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-sm-neon">{formatPrice(total)}</span>
          </div>
          {payment === "upi" && (
            <p className="mt-4 rounded-xl bg-sm-neon/10 p-3 text-xs text-sm-neon">
              You will get a QR code to pay instantly to SHOE MAFIA UPI.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
