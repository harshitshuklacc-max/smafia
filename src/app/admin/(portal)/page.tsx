import Link from "next/link";
import { Package, ShoppingCart, Receipt, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [products, orders, posSales, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ select: { total: true, status: true } }),
    prisma.posSale.findMany({ select: { total: true } }),
    prisma.product.findMany({
      where: { quantity: { lte: 5 }, isActive: true },
      take: 10,
      select: { name: true, quantity: true, sku: true },
    }),
  ]);

  const onlineRevenue = orders
    .filter((o) => o.status !== "REJECTED" && o.status !== "CANCELLED")
    .reduce((s, o) => s + o.total, 0);
  const offlineRevenue = posSales.reduce((s, p) => s + p.total, 0);

  return {
    totalProducts: products,
    onlineRevenue,
    offlineRevenue,
    totalRevenue: onlineRevenue + offlineRevenue,
    pendingOrders: orders.filter((o) => o.status === "PENDING").length,
    lowStock,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-black tracking-widest">ADMIN DASHBOARD</h1>
      <p className="mt-1 text-white/50">SHOE MAFIA — Bilaspur Control Center</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={stats?.totalProducts ?? 0} icon={Package} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} icon={ShoppingCart} />
        <StatCard
          label="Total Revenue"
          value={`₹${Math.round(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
          icon={Receipt}
        />
        <StatCard label="Low Stock" value={stats?.lowStock?.length ?? 0} icon={AlertTriangle} accent />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <QuickLink href="/admin/restock" title="Barcode Restock" desc="Scan BCN to put OOS & low stock back live" />
        <QuickLink href="/admin/products" title="Products" desc="View all Busy stock with BCN & images" />
        <QuickLink href="/admin/pos" title="POS Billing" desc="Walk-in customer billing" />
        <QuickLink href="/admin/orders" title="Manage Orders" desc="Accept, pack, ship orders" />
      </div>

      {stats?.lowStock?.length > 0 && (
        <div className="glass mt-10 rounded-2xl p-6">
          <h2 className="font-bold text-amber-400">Low Stock Alerts</h2>
          <ul className="mt-4 space-y-2">
            {stats.lowStock.map((p: { name: string; quantity: number; sku: string }) => (
              <li key={p.sku || p.name} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-amber-400">{p.quantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <Icon className={accent ? "h-6 w-6 text-amber-400" : "h-6 w-6 text-sm-neon"} />
      <p className="mt-4 text-2xl font-black">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="glass card-hover rounded-2xl p-6">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm text-white/50">{desc}</p>
    </Link>
  );
}
