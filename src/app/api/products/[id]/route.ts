import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { serializeProduct } from "@/lib/inventory";
import { emitInventoryUpdate } from "@/lib/socket-emit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { category: true, brand: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quantity =
    typeof body.quantity === "number" ? body.quantity : existing.quantity;
  const autoHide = body.autoHideOOS ?? existing.autoHideOOS;
  const isActive =
    body.isActive !== undefined
      ? body.isActive
      : autoHide && quantity === 0
        ? false
        : quantity > 0
          ? true
          : existing.isActive;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.description && { description: body.description }),
      ...(body.price && { price: body.price }),
      quantity,
      isActive,
      ...(body.images && { images: JSON.stringify(body.images) }),
      ...(body.sizes && { sizes: JSON.stringify(body.sizes) }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.isTrending !== undefined && { isTrending: body.isTrending }),
      ...(body.isNewArrival !== undefined && { isNewArrival: body.isNewArrival }),
      ...(body.isLimited !== undefined && { isLimited: body.isLimited }),
      autoHideOOS: autoHide,
    },
    include: { category: true, brand: true },
  });

  await emitInventoryUpdate({
    productId: product.id,
    quantity: product.quantity,
    barcode: product.barcode,
    isActive: product.isActive,
  });

  return NextResponse.json(serializeProduct(product));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
