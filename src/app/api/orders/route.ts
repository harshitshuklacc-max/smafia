import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getSession } from "@/lib/auth";
import { adjustStock } from "@/lib/inventory";
import { emitOrderUpdate } from "@/lib/socket-emit";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      size: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(10),
  shippingAddress: z.string().min(10),
  paymentMethod: z.enum(["cod", "razorpay", "upi"]),
  couponCode: z.string().optional(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const data = orderSchema.parse(await req.json());
    const session = await getSession();

    let subtotal = 0;
    const lineItems: { productId: string; size: string; quantity: number; price: number }[] = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive || product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `${product?.name || "Product"} is out of stock` },
          { status: 400 }
        );
      }
      const sizes = JSON.parse(product.sizes) as string[];
      if (!sizes.includes(item.size)) {
        return NextResponse.json({ error: "Invalid size selected" }, { status: 400 });
      }
      subtotal += product.price * item.quantity;
      lineItems.push({
        productId: product.id,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
      });
    }

    let discount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode, isActive: true },
      });
      if (coupon && subtotal >= coupon.minOrder) {
        discount = coupon.type === "percent" ? (subtotal * coupon.discount) / 100 : coupon.discount;
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const gst = Math.round((subtotal - discount) * 0.05 * 100) / 100;
    const shipping = subtotal > 2999 ? 0 : 99;
    const total = subtotal - discount + gst + shipping;
    const orderNumber = `SM-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.userId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus:
          data.paymentMethod === "cod"
            ? "pending"
            : data.paymentMethod === "upi"
              ? "awaiting_upi"
              : "awaiting",
        subtotal,
        discount,
        gst,
        shipping,
        total,
        couponCode: data.couponCode,
        trackingCode: `TRK${Date.now().toString(36).toUpperCase()}`,
        items: { create: lineItems },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of lineItems) {
      await adjustStock(item.productId, -item.quantity, "Online order", "ONLINE", order.id);
    }

    await emitOrderUpdate({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Order failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
