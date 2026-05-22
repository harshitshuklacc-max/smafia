import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { emitOrderUpdate } from "@/lib/socket-emit";
import type { OrderStatus } from "@prisma/client";

const validStatuses: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }, { trackingCode: id }] },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, paymentStatus } = body;

  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
    include: { items: { include: { product: true } } },
  });

  await emitOrderUpdate({
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
  });

  return NextResponse.json(order);
}
