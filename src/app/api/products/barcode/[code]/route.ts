import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { serializeProduct } from "@/lib/inventory";
import { findProductsByScanCode, normalizeScanCode } from "@/lib/barcode-lookup";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await params;
  const decoded = normalizeScanCode(decodeURIComponent(code));
  const matches = await findProductsByScanCode(decoded);

  if (matches.length === 0) {
    return NextResponse.json({ error: "Product not found", scanned: decoded }, { status: 404 });
  }

  if (matches.length === 1) {
    return NextResponse.json(serializeProduct(matches[0]));
  }

  return NextResponse.json({
    multiple: true,
    count: matches.length,
    scanned: decoded,
    products: matches.map(serializeProduct),
  });
}
