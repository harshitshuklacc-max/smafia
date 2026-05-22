"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function ShopFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("search") || "");

  function search(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (q) sp.set("search", q);
    else sp.delete("search");
    router.push(`/shop?${sp.toString()}`);
  }

  return (
    <form onSubmit={search} className="mt-8 flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40" />
        <input
          className="pl-12"
          placeholder="Search sneakers, brands..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary">
        Search
      </button>
    </form>
  );
}
