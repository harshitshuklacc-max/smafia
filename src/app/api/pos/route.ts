import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { z } from "zod";

const posSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      size: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.string(),
  discount: z.number().default(0),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sales = await prisma.posSale.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = posSchema.parse(await req.json());
    let subtotal = 0;

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.quantity < item.quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
      }
      subtotal += item.price * item.quantity;
    }

    const gst = Math.round((subtotal - data.discount) * 0.05 * 100) / 100;
    const total = subtotal - data.discount + gst;
    const invoiceNumber = `POS-${Date.now().toString(36).toUpperCase()}`;

    const sale = await prisma.posSale.create({
      data: {
        invoiceNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        subtotal,
        gst,
        discount: data.discount,
        total,
        paymentMethod: data.paymentMethod,
        items: { create: data.items },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of data.items) {
      await adjustStock(
        item.productId,
        -item.quantity,
        "POS sale",
        "OFFLINE",
        sale.id
      );
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "POS sale failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
