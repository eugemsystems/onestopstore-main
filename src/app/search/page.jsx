import { Suspense } from "react";

import { getProductListingData } from "@lib/product-listing-page";
import SearchClient from "./_components/search-client";
import ProductListingSkeleton from "@components/preloader/ProductListingSkeleton";

export async function generateMetadata({ searchParams }) {
  const { query } = await searchParams;

  return {
    title: query ? `Search: ${query}` : "Search Products",
    description: query
      ? `Find the best deals on ${query}`
      : "Search and discover amazing products",
    keywords: query
      ? [query, "search", "products", "deals"]
      : ["search", "products"],
  };
}

async function SearchContent({ searchParams }) {
  const data = await getProductListingData(searchParams);
  return <SearchClient {...data} basePath="/search" />;
}

const Search = async ({ searchParams }) => {
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
      <SearchContent searchParams={params} />
    </Suspense>
  );
};

export default Search;
