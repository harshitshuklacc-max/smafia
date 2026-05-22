import { prisma } from "./prisma";
import type { SaleChannel } from "@prisma/client";

export type StockUpdatePayload = {
  productId: string;
  quantity: number;
  barcode: string;
  isActive: boolean;
  autoHideOOS: boolean;
};

export async function adjustStock(
  productId: string,
  change: number,
  reason: string,
  channel: SaleChannel,
  reference?: string
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const newQty = Math.max(0, product.quantity + change);
  const shouldHide = product.autoHideOOS && newQty === 0;

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      quantity: newQty,
      isActive: newQty > 0 ? true : shouldHide ? false : product.isActive,
    },
  });

  await prisma.inventoryLog.create({
    data: { productId, change, reason, channel, reference },
  });

  return updated;
}

export function serializeProduct(p: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string;
  sizes: string;
  sku: string;
  inventoryId: string;
  barcode: string;
  quantity: number;
  isLimited: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  isActive: boolean;
  artNo?: string | null;
  color?: string | null;
  busyBcn?: string | null;
  category?: { name: string; slug: string } | null;
  brand?: { name: string; slug: string } | null;
}) {
  const images = JSON.parse(p.images || "[]") as string[];
  const sizes = JSON.parse(p.sizes || "[]") as string[];
  const outOfStock = p.quantity <= 0;
  return {
    ...p,
    images,
    sizes,
    outOfStock,
    inStock: !outOfStock,
    categoryName: p.category?.name,
    brandName: p.brand?.name,
    artNo: p.artNo,
    color: p.color,
    busyBcn: p.busyBcn,
  };
}

export async function getPublicProducts(filters?: {
  category?: string;
  brand?: string;
  search?: string;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
}) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      quantity: { gt: 0 },
      ...(filters?.category && { category: { slug: filters.category } }),
      ...(filters?.brand && { brand: { slug: filters.brand } }),
      ...(filters?.featured && { isFeatured: true }),
      ...(filters?.trending && { isTrending: true }),
      ...(filters?.newArrival && { isNewArrival: true }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search } },
          { sku: { contains: filters.search } },
          { busyBcn: { contains: filters.search } },
          { artNo: { contains: filters.search } },
          { brand: { name: { contains: filters.search } } },
        ],
      }),
    },
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(serializeProduct);
}
