import { STORE } from "@/lib/utils";

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ShoeStore",
    name: STORE.name,
    description: "Premium luxury sneakers and streetwear footwear in Bilaspur",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bus Stand, Old Telephone Exchange Road, Telipara",
      addressLocality: "Bilaspur",
      addressRegion: "Chhattisgarh",
      postalCode: "495001",
      addressCountry: "IN",
    },
    telephone: STORE.phone,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: STORE.rating,
      bestRating: 5,
    },
    priceRange: "₹₹₹",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
