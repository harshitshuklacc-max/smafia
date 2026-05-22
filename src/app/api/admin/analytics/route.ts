import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [products, orders, posSales, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
    prisma.posSale.findMany({ select: { total: true, createdAt: true } }),
    prisma.product.findMany({
      where: { quantity: { lte: 5 }, isActive: true },
      take: 10,
      select: { id: true, name: true, quantity: true, sku: true },
    }),
  ]);

  const onlineRevenue = orders
    .filter((o) => o.status !== "REJECTED" && o.status !== "CANCELLED")
    .reduce((s, o) => s + o.total, 0);
  const offlineRevenue = posSales.reduce((s, p) => s + p.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayOnline = orders
      .filter((o) => o.createdAt.toISOString().slice(0, 10) === key)
      .reduce((s, o) => s + o.total, 0);
    const dayOffline = posSales
      .filter((p) => p.createdAt.toISOString().slice(0, 10) === key)
      .reduce((s, p) => s + p.total, 0);
    return { date: key, online: dayOnline, offline: dayOffline };
  });

  return NextResponse.json({
    totalProducts: products,
    onlineRevenue,
    offlineRevenue,
    totalRevenue: onlineRevenue + offlineRevenue,
    pendingOrders,
    lowStock,
    chart: last7Days,
  });
}
