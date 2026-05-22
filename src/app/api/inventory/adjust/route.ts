import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adjustStock, serializeProduct } from "@/lib/inventory";
import { emitInventoryUpdate } from "@/lib/socket-emit";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, change, reason } = await req.json();
  if (!productId || typeof change !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const product = await adjustStock(
    productId,
    change,
    reason || "Manual adjustment",
    "OFFLINE"
  );

  await emitInventoryUpdate({
    productId: product.id,
    quantity: product.quantity,
    barcode: product.barcode,
    isActive: product.isActive,
  });

  return NextResponse.json(serializeProduct(product));
}
