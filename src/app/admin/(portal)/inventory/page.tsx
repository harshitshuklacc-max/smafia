"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ScanBarcode } from "lucide-react";

type Product = {
  id: string;
  name: string;
  quantity: number;
  barcode: string;
  busyBcn?: string;
  sku: string;
  images?: string[];
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [scanCode, setScanCode] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  async function load() {
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
  }

  useEffect(() => {
    load();
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
    socket.on("inventory:update", () => load());
    return () => socket.disconnect();
  }, []);

  async function scanBarcode(code?: string) {
    const c = code || scanCode;
    if (!c) return;
    const res = await fetch(`/api/products/barcode/${encodeURIComponent(c)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.multiple) {
        alert(`${data.count} products share BCN ${c}. Open Barcode Restock to select size/colour.`);
        setScanCode("");
        return;
      }
      setSelected(data.products?.[0] || data);
      setScanCode("");
    } else alert("Product not found — works with all 5000+ Busy BCN codes");
  }

  async function adjustStock(change: number) {
    if (!selected) return;
    const res = await fetch("/api/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selected.id,
        change,
        reason: change > 0 ? "Restock" : "Adjustment",
      }),
    });
    if (res.ok) {
      setSelected(await res.json());
      load();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">INVENTORY</h1>
          <p className="mt-1 text-white/50">Online ↔ Offline sync</p>
        </div>
        <Link href="/admin/restock" className="btn-primary flex items-center gap-2">
          <ScanBarcode className="h-5 w-5" />
          Barcode Restock
        </Link>
      </div>

      <div className="glass mt-8 rounded-2xl p-6">
        <label className="text-xs tracking-widest text-sm-neon uppercase">Quick lookup</label>
        <input
          className="mt-2"
          placeholder="Scan BCN / barcode"
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && scanBarcode()}
        />
        <button onClick={() => scanBarcode()} className="btn-ghost mt-4">
          Lookup
        </button>
      </div>

      {selected && (
        <div className="glass mt-6 rounded-2xl p-6">
          <h2 className="text-xl font-bold">{selected.name}</h2>
          <p className="text-sm text-white/50">
            BCN: {selected.busyBcn || selected.barcode} · Stock: {selected.quantity}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => adjustStock(1)} className="btn-primary">
              +1 Stock
            </button>
            <button onClick={() => adjustStock(5)} className="btn-ghost">
              +5
            </button>
            <button onClick={() => adjustStock(-1)} className="btn-ghost text-red-400">
              -1
            </button>
          </div>
        </div>
      )}

      <table className="mt-10 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50">
            <th className="py-3">Product</th>
            <th>BCN</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-white/5">
              <td className="py-3">{p.name}</td>
              <td>{p.busyBcn || p.barcode}</td>
              <td className={p.quantity <= 5 ? "text-amber-400" : ""}>{p.quantity}</td>
              <td>
                {p.quantity === 0 ? (
                  <span className="text-red-400">Out of Stock</span>
                ) : p.quantity <= 5 ? (
                  <span className="text-amber-400">Low</span>
                ) : (
                  <span className="text-sm-neon">In Stock</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
