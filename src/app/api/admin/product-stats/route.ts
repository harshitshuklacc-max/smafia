import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [total, withBcn, inStock, outStock, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { busyBcn: { not: null } } }),
    prisma.product.count({ where: { quantity: { gt: 0 }, isActive: true } }),
    prisma.product.count({ where: { quantity: 0 } }),
    prisma.product.count({ where: { quantity: { gt: 0, lte: 5 } } }),
  ]);

  return NextResponse.json({
    total,
    withBcn,
    barcodeReady: withBcn === total,
    inStock,
    outStock,
    lowStock,
  });
}
