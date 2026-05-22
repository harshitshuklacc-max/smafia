import { HeroSection } from "@/components/home/HeroSection";
import { HomeSections } from "@/components/home/HomeSections";
import { getPublicProducts } from "@/lib/inventory";
import { EmptyDrops } from "@/components/products/EmptyDrops";
import { ProductGrid } from "@/components/products/ProductGrid";

export default async function HomePage() {
  const [featured, trending, newArrivals] = await Promise.all([
    getPublicProducts({ featured: true }),
    getPublicProducts({ trending: true }),
    getPublicProducts({ newArrival: true }),
  ]);

  const hasProducts = featured.length + trending.length + newArrivals.length > 0;

  return (
    <>
      <HeroSection />
      {hasProducts ? (
        <HomeSections
          featured={featured.slice(0, 4)}
          trending={trending.slice(0, 4)}
          newArrivals={newArrivals.slice(0, 4)}
        />
      ) : (
        <section className="px-6">
          <EmptyDrops />
        </section>
      )}
      {hasProducts && featured.length > 0 && (
        <section className="px-6 py-20">
          <h2 className="text-center text-3xl font-black tracking-[0.15em]">FEATURED HEAT</h2>
          <div className="mx-auto mt-12 max-w-7xl">
            <ProductGrid products={featured} />
          </div>
        </section>
      )}
    </>
  );
}
