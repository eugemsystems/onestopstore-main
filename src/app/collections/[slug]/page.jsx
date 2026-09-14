import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getProductListingData } from "@lib/product-listing-page";
import { getCategoryBySlug } from "@lib/actions/category.actions";
import SearchClient from "../../search/_components/search-client";
import ProductListingSkeleton from "@components/preloader/ProductListingSkeleton";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { category } = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Collection Not Found",
      description: "The collection you're looking for could not be found.",
    };
  }

  const name = category?.name?.en || "Collection";
  const description =
    category?.description?.en || `Shop ${name} at the best prices`;
  const storeDomain = (
    process.env.NEXT_PUBLIC_STORE_DOMAIN || "https://onestopstore.local"
  ).replace(/\/$/, "");
  const canonical = `${storeDomain}/collections/${slug}`;

  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: {
      title: name,
      description,
      url: canonical,
      type: "website",
    },
  };
}

async function CollectionContent({ slug, searchParams }) {
  const { category } = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const data = await getProductListingData({ ...searchParams, category: slug });
  return (
    <SearchClient
      {...data}
      basePath={`/collections/${slug}`}
      pageTitle={category?.name?.en}
    />
  );
}

const CollectionPage = async ({ params, searchParams }) => {
  const { slug } = await params;
  const sp = await searchParams;
  const suspenseKey = [
    slug,
    sp?.sort,
    sp?.rating,
    sp?.minPrice,
    sp?.maxPrice,
    sp?.page,
  ].join("|");

  return (
    <Suspense key={suspenseKey} fallback={<ProductListingSkeleton />}>
      <CollectionContent slug={slug} searchParams={sp} />
    </Suspense>
  );
};

export default CollectionPage;
