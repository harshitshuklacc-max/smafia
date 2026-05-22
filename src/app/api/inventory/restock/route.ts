import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adjustStock, serializeProduct } from "@/lib/inventory";
import { emitInventoryUpdate } from "@/lib/socket-emit";
import { findProductsByScanCode, normalizeScanCode } from "@/lib/barcode-lookup";
import { z } from "zod";

const schema = z.object({
  barcode: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  productId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { barcode, quantity, productId } = schema.parse(await req.json());
    const code = normalizeScanCode(barcode);

    let matches = productId
      ? await prisma.product.findMany({
          where: { id: productId },
          include: { category: true, brand: true },
        })
      : await findProductsByScanCode(code);

    if (matches.length === 0) {
      return NextResponse.json(
        {
          error: `No product found for barcode "${code}". All 5000+ Busy BCN codes are supported — check scan or enter BCN manually.`,
          scanned: code,
        },
        { status: 404 }
      );
    }

    if (matches.length > 1 && !productId) {
      return NextResponse.json({
        multiple: true,
        count: matches.length,
        scanned: code,
        products: matches.map(serializeProduct),
      });
    }

    const product = matches[0];
    const wasOOS = product.quantity <= 0;
    const updated = await adjustStock(
      product.id,
      quantity,
      wasOOS ? "Barcode restock — back in stock" : "Barcode restock",
      "OFFLINE"
    );

    const full = await prisma.product.findUnique({
      where: { id: updated.id },
      include: { category: true, brand: true },
    });

    await emitInventoryUpdate({
      productId: updated.id,
      quantity: updated.quantity,
      barcode: updated.barcode,
      isActive: updated.isActive,
    });

    return NextResponse.json({
      message: wasOOS
        ? "Product is back in stock on website & POS"
        : `Stock updated (+${quantity})`,
      scanned: code,
      product: full ? serializeProduct(full) : serializeProduct({ ...updated, category: null, brand: null }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Restock failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
