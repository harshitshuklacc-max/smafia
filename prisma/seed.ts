import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("ShOeMaFia@#1", 12);

  await prisma.user.upsert({
    where: { username: "SHoEmafia" },
    update: {},
    create: {
      username: "SHoEmafia",
      name: "SHOE MAFIA Admin",
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
    },
  });

  const banners = [
    {
      title: "THE DROP IS COMING",
      subtitle: "Bilaspur's premium sneaker destination",
      image: "/images/hero-sneaker.svg",
      order: 0,
    },
    {
      title: "STREETWEAR. REDEFINED.",
      subtitle: "Limited pairs. Maximum heat.",
      image: "/images/hero-street.svg",
      order: 1,
    },
  ];

  for (const b of banners) {
    const exists = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!exists) await prisma.banner.create({ data: b });
  }

  await prisma.setting.upsert({
    where: { key: "store_name" },
    update: {},
    create: { key: "store_name", value: "SHOE MAFIA" },
  });

  await prisma.setting.upsert({
    where: { key: "store_phone" },
    update: {},
    create: { key: "store_phone", value: "+91 75875 55558" },
  });

  console.log("✓ Admin user seeded (username: SHoEmafia)");
  console.log("✓ Banners and settings seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
