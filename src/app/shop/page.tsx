import { getPublicProducts } from "@/lib/inventory";
import { EmptyDrops } from "@/components/products/EmptyDrops";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const products = await getPublicProducts({
    search: params.search,
    category: params.category,
    brand: params.brand,
  });

  return (
    <div className="gradient-hero min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="text-4xl font-black tracking-[0.15em] md:text-6xl">THE SHOP</h1>
        <p className="mt-2 text-white/60">Premium sneakers & streetwear footwear</p>
        <ShopFilters />
        {products.length === 0 ? (
          <EmptyDrops />
        ) : (
          <div className="mt-12">
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </div>
  );
}
