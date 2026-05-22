import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/inventory";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  return { title: p?.name || "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, brand: true, reviews: { where: { approved: true } } },
  });

  if (!raw || (!raw.isActive && raw.quantity <= 0)) {
    const inactive = await prisma.product.findUnique({ where: { slug } });
    if (!inactive) notFound();
    if (!inactive.isActive && inactive.quantity <= 0) notFound();
  }

  if (!raw) notFound();

  const product = serializeProduct(raw);
  const isPublic = product.isActive && product.inStock;

  if (!isPublic && product.quantity <= 0) notFound();

  return (
    <div className="min-h-screen pt-28 pb-20">
      <ProductDetailClient product={product} reviews={raw.reviews} />
    </div>
  );
}
