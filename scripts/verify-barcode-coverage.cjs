const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const total = await p.product.count();
  const withBcn = await p.product.count({ where: { busyBcn: { not: null } } });
  const testCodes = ["703127", "800186", "801467", "7a"];
  console.log("Total products:", total);
  console.log("With Busy BCN:", withBcn);
  for (const code of testCodes) {
    const n = await p.product.count({ where: { busyBcn: code } });
    console.log(`  BCN ${code}: ${n} match(es)`);
  }
}

main().finally(() => p.$disconnect());
