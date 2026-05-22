"use client";

import { useEffect, useState } from "react";
import { BarcodeDisplay } from "@/components/admin/BarcodeDisplay";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  barcode: string;
  inventoryId: string;
  artNo?: string;
  color?: string;
  busyBcn?: string;
  images: string[];
  sizes: string[];
  outOfStock?: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/products?limit=10000");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products || data);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const images = (form.get("images") as string).split(",").map((s) => s.trim()).filter(Boolean);
    const sizes = (form.get("sizes") as string).split(",").map((s) => s.trim()).filter(Boolean);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        price: Number(form.get("price")),
        quantity: Number(form.get("quantity")),
        images: images.length ? images : ["/images/placeholder-sneaker.svg"],
        sizes: sizes.length ? sizes : ["7", "8", "9", "10"],
        isNewArrival: true,
        isFeatured: form.get("featured") === "on",
      }),
    });

    if (res.ok) {
      const p = await res.json();
      setLastBarcode(p.barcode);
      setShowForm(false);
      load();
      (e.target as HTMLFormElement).reset();
    } else {
      alert("Failed to create product");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black">PRODUCTS</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProduct} className="glass mt-8 grid gap-4 rounded-2xl p-6 md:grid-cols-2">
          <input name="name" placeholder="Product Name *" required />
          <input name="price" type="number" placeholder="Price (INR) *" required />
          <input name="quantity" type="number" placeholder="Quantity *" required />
          <input name="images" placeholder="Image URLs (comma separated)" className="md:col-span-2" />
          <input name="sizes" placeholder="Sizes UK (e.g. 7,8,9,10)" className="md:col-span-2" />
          <textarea name="description" placeholder="Description *" rows={3} className="md:col-span-2" required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" /> Featured on homepage
          </label>
          <button type="submit" className="btn-primary md:col-span-2">
            Create Product (Auto SKU + Barcode)
          </button>
        </form>
      )}

      {lastBarcode && (
        <div className="glass mt-8 rounded-2xl p-6">
          <h3 className="font-bold text-sm-neon">Barcode Generated — Print & Scan</h3>
          <BarcodeDisplay barcode={lastBarcode} />
        </div>
      )}

      <div className="mt-10 space-y-4">
        {products.length === 0 && (
          <p className="text-white/50">No products yet. Add your first drop above.</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4">
            <div>
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-white/50">
                BCN: {p.busyBcn || p.barcode} · SKU: {p.sku} · Size:{" "}
                {Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes} ·{" "}
                {p.color && <>Colour: {p.color} · </>}
                Stock: {p.quantity} · {formatPrice(p.price)}
              </p>
              <p className={`text-xs font-bold ${p.outOfStock || p.quantity === 0 ? "text-red-400" : "text-sm-neon"}`}>
                {p.quantity > 0 ? "In Stock" : "Out of Stock"}
              </p>
            </div>
            <BarcodeDisplay barcode={p.barcode} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
