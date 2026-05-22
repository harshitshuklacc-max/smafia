"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Receipt,
  ScanBarcode,
  ShoppingCart,
  LogOut,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/restock", label: "Barcode Restock", icon: ScanBarcode },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/pos", label: "POS Billing", icon: Receipt },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="glass-strong hidden w-64 shrink-0 flex-col border-r border-white/10 p-6 md:flex">
      <Link href="/admin" className="text-xl font-black tracking-widest">
        SM<span className="text-sm-neon">ADMIN</span>
      </Link>
      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                active ? "bg-sm-neon/10 text-sm-neon" : "text-white/60 hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="flex items-center gap-2 text-sm text-white/50 hover:text-red-400">
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
