import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildProductImageSvg } from "@/lib/product-image";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { artNo: true, color: true, name: true, sizes: true },
  });

  if (!product) {
    return new NextResponse("Not found", { status: 404 });
  }

  let size: string | undefined;
  try {
    const sizes = JSON.parse(product.sizes || "[]") as string[];
    size = sizes[0];
  } catch {
    // ignore
  }

  const svg = buildProductImageSvg({
    artNo: product.artNo,
    color: product.color,
    name: product.name,
    size,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
