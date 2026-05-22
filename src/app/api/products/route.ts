import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  generateBarcodeValue,
  generateInventoryId,
  generateSku,
  slugify,
} from "@/lib/utils";
import { getPublicProducts, serializeProduct } from "@/lib/inventory";
import { emitInventoryUpdate } from "@/lib/socket-emit";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const admin = await requireAdmin();
  if (admin) {
    const stock = searchParams.get("stock");
    const limit = Math.min(Number(searchParams.get("limit") || 5000), 10000);
    const skip = Number(searchParams.get("skip") || 0);
    const search = searchParams.get("search")?.trim();

    const products = await prisma.product.findMany({
      where: {
        ...(stock === "out" && { quantity: 0 }),
        ...(stock === "low" && { quantity: { gt: 0, lte: 5 } }),
        ...(stock === "in" && { quantity: { gt: 5 } }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { busyBcn: { contains: search } },
            { barcode: { contains: search } },
            { sku: { contains: search } },
            { artNo: { contains: search } },
          ],
        }),
      },
      include: { category: true, brand: true },
      orderBy: [{ quantity: "asc" }, { name: "asc" }],
      take: limit,
      skip,
    });

    const total = await prisma.product.count({
      where: {
        ...(stock === "out" && { quantity: 0 }),
        ...(stock === "low" && { quantity: { gt: 0, lte: 5 } }),
        ...(stock === "in" && { quantity: { gt: 5 } }),
      },
    });

    return NextResponse.json({
      products: products.map(serializeProduct),
      total,
      limit,
      skip,
    });
  }
  const products = await getPublicProducts({
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    search: searchParams.get("search") || undefined,
    featured: searchParams.get("featured") === "1",
    trending: searchParams.get("trending") === "1",
    newArrival: searchParams.get("new") === "1",
  });
  return NextResponse.json(products);
}

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  images: z.array(z.string()).min(1),
  sizes: z.array(z.string()).min(1),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  isLimited: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  autoHideOOS: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = productSchema.parse(body);
    const inventoryId = generateInventoryId();
    const barcode = generateBarcodeValue(inventoryId);
    const sku = generateSku(data.name);
    const slug = `${slugify(data.name)}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        images: JSON.stringify(data.images),
        sizes: JSON.stringify(data.sizes),
        sku,
        inventoryId,
        barcode,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isLimited: data.isLimited ?? false,
        isNewArrival: data.isNewArrival ?? true,
        isTrending: data.isTrending ?? false,
        isFeatured: data.isFeatured ?? false,
        autoHideOOS: data.autoHideOOS ?? true,
        isActive: data.quantity > 0,
      },
      include: { category: true, brand: true },
    });

    await emitInventoryUpdate({
      productId: product.id,
      quantity: product.quantity,
      barcode: product.barcode,
      isActive: product.isActive,
    });

    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
