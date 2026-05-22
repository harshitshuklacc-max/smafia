import { prisma } from "./prisma";

/** Clean USB scanner input (trim, strip * wrappers, newlines) */
export function normalizeScanCode(raw: string): string {
  return raw
    .trim()
    .replace(/[\r\n\t]/g, "")
    .replace(/^\*+|\*+$/g, "")
    .replace(/\s+/g, "");
}

/** Build all codes we should match against DB (Busy BCN, internal barcode, etc.) */
export function barcodeVariants(raw: string): string[] {
  const n = normalizeScanCode(raw);
  if (!n) return [];

  const variants = new Set<string>([n, n.toUpperCase(), n.toLowerCase()]);

  if (/^\d+$/.test(n)) {
    variants.add(String(parseInt(n, 10)));
    variants.add(n.padStart(6, "0"));
    variants.add(n.padStart(12, "0"));
  }

  if (!n.startsWith("BCN-")) {
    variants.add(`BCN-${n}`);
  }
  if (n.startsWith("BCN-")) {
    variants.add(n.replace(/^BCN-/, ""));
  }
  if (!n.startsWith("SM-")) {
    variants.add(`SM-${n}`);
    variants.add(`SM-BCN-${n}`);
  }
  if (!n.startsWith("INV-")) {
    variants.add(`INV-${n}`);
    variants.add(`INV-BCN-${n}`);
  }

  return [...variants].filter(Boolean);
}

/**
 * Find products by scanner code — searches ALL products in database.
 * Matches: busyBcn, barcode, sku, inventoryId (exact + normalized variants).
 */
export async function findProductsByScanCode(raw: string) {
  const variants = barcodeVariants(raw);
  if (variants.length === 0) return [];

  const orConditions = variants.flatMap((code) => [
    { busyBcn: code },
    { barcode: code },
    { sku: code },
    { inventoryId: code },
  ]);

  const products = await prisma.product.findMany({
    where: { OR: orConditions },
    include: { category: true, brand: true },
    orderBy: [{ quantity: "asc" }, { name: "asc" }],
  });

  if (products.length > 0) return products;

  const normalized = normalizeScanCode(raw);
  if (normalized.length >= 4) {
    return prisma.product.findMany({
      where: {
        OR: [
          { busyBcn: { contains: normalized } },
          { barcode: { contains: normalized } },
          { sku: { contains: normalized } },
          { name: { contains: normalized } },
        ],
      },
      include: { category: true, brand: true },
      take: 50,
      orderBy: { name: "asc" },
    });
  }

  return [];
}
