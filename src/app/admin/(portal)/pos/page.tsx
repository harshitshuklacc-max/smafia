"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  sizes: string[];
};

type CartLine = {
  product: Product;
  size: string;
  qty: number;
};

export default function POSPage() {
  const [scan, setScan] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [payment, setPayment] = useState("cash");
  const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null);

  async function scanProduct(code?: string) {
    const c = encodeURIComponent((code || scan).trim());
    if (!c) return;
    const res = await fetch(`/api/products/barcode/${c}`);
    if (res.ok) {
      const data = await res.json();
      if (data.multiple) {
        alert(
          `${data.count} variants found for this BCN. Use Barcode Restock page to pick size, or scan internal barcode.`
        );
        setScan("");
        return;
      }
      const product = data.products?.[0] || data;
      const size = product.sizes[0] || "9";
      setCart((prev) => {
        const idx = prev.findIndex((l) => l.product.id === product.id && l.size === size);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
          return next;
        }
        return [...prev, { product, size, qty: 1 }];
      });
      setScan("");
    }
  }

  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + gst;

  async function completeSale() {
    const res = await fetch("/api/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((l) => ({
          productId: l.product.id,
          size: l.size,
          quantity: l.qty,
          price: l.product.price,
        })),
        customerName,
        paymentMethod: payment,
      }),
    });
    if (res.ok) {
      setInvoice(await res.json());
      setCart([]);
    } else alert("Sale failed — check stock");
  }

  return (
    <div>
      <h1 className="text-3xl font-black">POS BILLING</h1>
      <p className="mt-1 text-white/50">Offline store · synced inventory</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <input
            placeholder="Scan barcode..."
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && scanProduct()}
            autoFocus
            className="text-lg"
          />
          <button onClick={() => scanProduct()} className="btn-primary mt-4 w-full">
            Add Item
          </button>
          <input
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-4"
          />
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="mt-4">
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold">Bill</h2>
          {cart.map((l) => (
            <div key={`${l.product.id}-${l.size}`} className="mt-3 flex justify-between text-sm">
              <span>
                {l.product.name} ({l.size}) × {l.qty}
              </span>
              <span>{formatPrice(l.product.price * l.qty)}</span>
            </div>
          ))}
          <hr className="my-4 border-white/10" />
          <div className="flex justify-between text-sm"><span>GST 5%</span><span>{formatPrice(gst)}</span></div>
          <div className="mt-2 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-sm-neon">{formatPrice(total)}</span>
          </div>
          <button
            onClick={completeSale}
            disabled={cart.length === 0}
            className="btn-primary mt-6 w-full"
          >
            Complete Sale & Print
          </button>
        </div>
      </div>

      {invoice && (
        <div className="glass mt-8 rounded-2xl p-8 print-only:block" id="invoice-print">
          <div className="no-print mb-4 flex gap-3">
            <button onClick={() => window.print()} className="btn-primary">
              Print Thermal / A4
            </button>
            <button onClick={() => setInvoice(null)} className="btn-ghost">
              New Sale
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black">SHOE MAFIA</h2>
            <p className="text-xs">GST Invoice · Bilaspur, CG</p>
            <p className="mt-2 font-mono text-sm">#{invoice.invoiceNumber as string}</p>
            <p className="mt-4 text-2xl font-bold">{formatPrice(invoice.total as number)}</p>
            <p className="text-xs text-white/50">Thank you for shopping!</p>
          </div>
        </div>
      )}
    </div>
  );
}
