import { Suspense } from "react";

import { getProductListingData } from "@lib/product-listing-page";
import SearchClient from "../search/_components/search-client";
import ProductListingSkeleton from "@components/preloader/ProductListingSkeleton";

export async function generateMetadata() {
  return {
    title: "Shop All Products",
    description: "Browse all products with filters and sorting",
    keywords: ["shop", "products", "catalog", "deals"],
  };
}

async function ShopContent({ searchParams }) {
  const data = await getProductListingData(searchParams);
  return <SearchClient {...data} basePath="/shop" />;
}

const Shop = async ({ searchParams }) => {
  const params = await searchParams;
  const suspenseKey = [
    params?.query,
    params?.category,
    params?.sort,
    params?.rating,
    params?.minPrice,
    params?.maxPrice,
    params?.page,
  ].join("|");

  return (
    <Suspense key={suspenseKey} fallback={<ProductListingSkeleton />}>
      <ShopContent searchParams={params} />
    </Suspense>
  );
};

export default Shop;
