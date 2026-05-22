"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Package, ScanBarcode, CheckCircle2, AlertTriangle } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  busyBcn?: string;
  color?: string;
  artNo?: string;
  images: string[];
  sizes: string[];
  outOfStock?: boolean;
};

type StockFilter = "all" | "out" | "low" | "in";

export default function RestockPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scan, setScan] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pickList, setPickList] = useState<Product[] | null>(null);
  const [lastRestocked, setLastRestocked] = useState<Product | null>(null);
  const [filter, setFilter] = useState<StockFilter>("out");
  const [list, setList] = useState<Product[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    withBcn: number;
    outStock: number;
    lowStock: number;
  } | null>(null);
  const [autoAdd, setAutoAdd] = useState(true);

  async function loadStats() {
    const res = await fetch("/api/admin/product-stats");
    if (res.ok) setStats(await res.json());
  }

  async function loadList() {
    const stockParam = filter === "all" ? "" : `&stock=${filter}`;
    const res = await fetch(`/api/products?limit=10000${stockParam}`);
    if (!res.ok) return;
    const data = await res.json();
    setList(data.products || data);
  }

  useEffect(() => {
    loadStats();
    loadList();
    inputRef.current?.focus();
  }, [filter]);

  async function restock(productId?: string) {
    const code = scan.trim();
    if (!code && !productId) return;
    setLoading(true);
    setMessage("");
    setPickList(null);

    const res = await fetch("/api/inventory/restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barcode: code,
        quantity: qty,
        productId,
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Restock failed");
      return;
    }

    if (data.multiple) {
      setPickList(data.products);
      setMessage(`${data.count || data.products.length} variants for BCN "${data.scanned || scan}" — pick size/colour:`);
      return;
    }

    setLastRestocked(data.product);
    setMessage(data.message);
    setScan("");
    setQty(1);
    loadList();
    inputRef.current?.focus();
  }

  function onScanKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (autoAdd) restock();
      else restock();
    }
  }

  function stockBadge(p: Product) {
    if (p.quantity <= 0)
      return (
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
          Out of Stock
        </span>
      );
    if (p.quantity <= 5)
      return (
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
          Low Stock ({p.quantity})
        </span>
      );
    return (
      <span className="rounded-full bg-sm-neon/20 px-2 py-0.5 text-xs text-sm-neon">
        In Stock ({p.quantity})
      </span>
    );
  }

  return (
    <div>
      <h1 className="flex items-center gap-3 text-3xl font-black">
        <ScanBarcode className="h-8 w-8 text-sm-neon" />
        BARCODE RESTOCK
      </h1>
      <p className="mt-1 text-white/50">
        Works with <strong className="text-sm-neon">all {stats?.total?.toLocaleString() || "5000+"} products</strong>{" "}
        — every Busy BCN from your stock list. Scan to restock out-of-stock, low-stock, or normal items.
      </p>
      {stats && (
        <p className="mt-2 text-xs text-white/40">
          {stats.withBcn.toLocaleString()} barcode-ready · {stats.outStock.toLocaleString()} out ·{" "}
          {stats.lowStock.toLocaleString()} low stock
        </p>
      )}

      <div className="glass neon-border mt-8 rounded-3xl p-6 md:p-8">
        <label className="text-xs font-bold tracking-[0.25em] text-sm-neon uppercase">
          Scanner input (BCN)
        </label>
        <input
          ref={inputRef}
          className="mt-3 text-lg"
          placeholder="Scan barcode here..."
          value={scan}
          onChange={(e) => setScan(e.target.value)}
          onKeyDown={onScanKey}
          disabled={loading}
          autoFocus
        />
        <label className="mt-4 flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={autoAdd}
            onChange={(e) => setAutoAdd(e.target.checked)}
          />
          Auto-add stock on scan (Enter) — fastest for 5000+ items
        </label>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-white/50">Qty to add</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-24"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <button
            onClick={() => restock()}
            disabled={loading || !scan.trim()}
            className="btn-primary"
          >
            {loading ? "Adding..." : "Add to Stock"}
          </button>
          {[1, 5, 10].map((n) => (
            <button
              key={n}
              type="button"
              className="btn-ghost text-sm"
              onClick={() => {
                setQty(n);
                if (scan.trim()) restock();
              }}
            >
              Quick +{n}
            </button>
          ))}
        </div>
        {message && (
          <p
            className={`mt-4 flex items-center gap-2 text-sm ${
              message.includes("back") || message.includes("updated")
                ? "text-sm-neon"
                : "text-amber-400"
            }`}
          >
            {(message.includes("back") || message.includes("updated")) && (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {message}
          </p>
        )}
      </div>

      {pickList && (
        <div className="glass mt-6 rounded-2xl p-6">
          <p className="mb-4 text-sm text-white/60">Same BCN — select variant:</p>
          <div className="grid gap-3 md:grid-cols-2">
            {pickList.map((p) => (
              <button
                key={p.id}
                onClick={() => restock(p.id)}
                className="card-hover flex gap-4 rounded-xl border border-white/10 p-4 text-left"
              >
                <ProductThumb product={p} />
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-white/50">BCN {p.busyBcn} · Size {p.sizes[0]}</p>
                  {stockBadge(p)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {lastRestocked && (
        <div className="glass mt-6 flex gap-6 rounded-2xl border border-sm-neon/30 p-6">
          <ProductThumb product={lastRestocked} large />
          <div>
            <p className="text-xs text-sm-neon uppercase">Last restocked</p>
            <h2 className="text-xl font-bold">{lastRestocked.name}</h2>
            <p className="text-sm text-white/50">
              BCN: {lastRestocked.busyBcn} · {formatPrice(lastRestocked.price)}
            </p>
            <p className="mt-2 text-lg font-bold text-sm-neon">
              Now {lastRestocked.quantity} in stock — live on website
            </p>
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["out", "Out of Stock"],
              ["low", "Low Stock"],
              ["in", "In Stock"],
              ["all", "All"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm ${
                filter === key ? "bg-sm-neon text-black" : "bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-white/40">
          <AlertTriangle className="mr-1 inline h-4 w-4" />
          Tap a row to load BCN into scanner, or scan directly
        </p>
        <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setScan(p.busyBcn || p.barcode);
                setPickList(null);
                inputRef.current?.focus();
              }}
              className="glass flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:border-sm-neon/40"
            >
              <ProductThumb product={p} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-xs text-white/50">BCN {p.busyBcn || p.barcode}</p>
              </div>
              {stockBadge(p)}
            </button>
          ))}
          {list.length === 0 && (
            <p className="py-8 text-center text-white/40">No products in this filter</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductThumb({ product, large }: { product: Product; large?: boolean }) {
  const src = product.images?.[0] || "/images/placeholder-sneaker.svg";
  const size = large ? 96 : 56;
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg bg-sm-slate ${large ? "h-24 w-24" : "h-14 w-14"}`}
    >
      <Image src={src} alt={product.name} fill className="object-cover" sizes={`${size}px`} unoptimized />
    </div>
  );
}
