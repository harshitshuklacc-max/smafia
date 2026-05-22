import { ProductCard } from "./ProductCard";

type Product = {
  slug: string;
  name: string;
  price: number;
  images: string[];
  brandName?: string;
  isLimited?: boolean;
  isNewArrival?: boolean;
  outOfStock?: boolean;
};

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {products.map((p) => (
        <ProductCard
          key={p.slug}
          slug={p.slug}
          name={p.name}
          price={p.price}
          image={p.images[0]}
          brandName={p.brandName}
          isLimited={p.isLimited}
          isNewArrival={p.isNewArrival}
          outOfStock={p.outOfStock}
        />
      ))}
    </div>
  );
}
