import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { parseBusyStockText } from "../scripts/parse-busy-pdf";
import { slugify } from "../src/lib/utils";
import { productImageUrl } from "../src/lib/product-image";

const prisma = new PrismaClient();

function inferBrand(artNo: string): string {
  const u = artNo.toUpperCase();
  if (u.includes("NIKE") || u.startsWith("AIR ") || u.includes("JORDAN") || u.includes("DUNK") || u.includes("PEGASUS") || u.includes("VOMERO")) return "Nike";
  if (u.includes("PUMA") || u.includes("SUEDE")) return "Puma";
  if (u.includes("ADIDAS") || u.includes("ADIZERO") || u.includes("SAMBA")) return "Adidas";
  if (u.includes("REEBOK")) return "Reebok";
  if (u.includes("SKECHER")) return "Skechers";
  if (u.includes("ASICS") || u.includes("TIGER")) return "ASICS";
  if (u.includes("NB ") || u.startsWith("NB")) return "New Balance";
  if (u.includes("CONVERCE") || u.includes("CONVERSE")) return "Converse";
  if (u.includes("YEEZY") || u.includes("YEZZY")) return "Yeezy";
  if (u.includes("ON ") || u.includes("CLOUD")) return "On";
  return "Streetwear";
}

async function ensureBrand(name: string, cache: Map<string, string>) {
  if (cache.has(name)) return cache.get(name)!;
  const slug = slugify(name);
  const brand = await prisma.brand.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
  cache.set(name, brand.id);
  return brand.id;
}

async function main() {
  const extractPath = process.argv[2] || "prisma/busy-stock-extract.txt";
  const text = fs.readFileSync(extractPath, "utf-8");
  const items = parseBusyStockText(text);

  console.log(`Parsed ${items.length} products from Busy PDF`);

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.posSaleItem.deleteMany();
  await prisma.posSale.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();

  const brandCache = new Map<string, string>();
  const batchSize = 500;
  let lineIndex = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const data = [];

    for (const item of batch) {
      lineIndex++;
      const brandId = await ensureBrand(inferBrand(item.artNo), brandCache);
      const name = `${item.artNo} — ${item.color} (Size ${item.size})`;
      const description = [
        `Imported from Busy — BCN wise Stock Details (20-05-2026).`,
        `BCN (Barcode Number): ${item.bcn}`,
        `Art No: ${item.artNo}`,
        `Size: ${item.size}`,
        `Colour: ${item.color}`,
        `Sales Price: ₹${item.price.toLocaleString("en-IN")}`,
        `Opening Qty: ${item.opQty} | In: ${item.qtyIn} | Out: ${item.qtyOut} | Closing: ${item.quantity}`,
        `Status: ${item.inStock ? "✓ In Stock" : "✗ Out of Stock"}`,
      ].join("\n");

      const uid = `sm-${lineIndex}`;
      data.push({
        name,
        slug: `bcn-${item.bcn}-${lineIndex}`,
        description,
        price: item.price,
        artNo: item.artNo,
        color: item.color,
        brandId,
        busyBcn: String(item.bcn),
        images: JSON.stringify([]),
        sizes: JSON.stringify([String(item.size)]),
        sku: `SM-${uid}`,
        inventoryId: `INV-${uid}`,
        barcode: `BCN-${item.bcn}-${lineIndex}`,
        quantity: item.quantity,
        isActive: item.inStock,
        autoHideOOS: true,
        isLimited: item.artNo.toUpperCase().includes("LIMITED"),
      });
    }

    await prisma.product.createMany({ data });
    console.log(`Imported ${Math.min(i + batchSize, items.length)}/${items.length}...`);
  }

  const all = await prisma.product.findMany({ select: { id: true } });
  console.log(`Assigning name/colour images to ${all.length} products...`);
  for (let j = 0; j < all.length; j += 500) {
    const imgBatch = all.slice(j, j + 500);
    await Promise.all(
      imgBatch.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { images: JSON.stringify([productImageUrl(p.id)]) },
        })
      )
    );
  }

  const inStock = await prisma.product.count({ where: { quantity: { gt: 0 }, isActive: true } });
  const outStock = await prisma.product.count({ where: { quantity: 0 } });

  console.log(`✓ Import complete: ${items.length} products`);
  console.log(`  In stock (visible online): ${inStock}`);
  console.log(`  Out of stock: ${outStock}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
