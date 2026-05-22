import { PrismaClient } from "@prisma/client";
import { productImageUrl } from "../src/lib/product-image";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true } });
  console.log(`Assigning images to ${products.length} products...`);

  const batchSize = 500;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await Promise.all(
      batch.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: {
            images: JSON.stringify([productImageUrl(p.id)]),
          },
        })
      )
    );
    console.log(`Updated ${Math.min(i + batchSize, products.length)}/${products.length}`);
  }

  console.log("✓ All products now have name + colour based preview images");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
