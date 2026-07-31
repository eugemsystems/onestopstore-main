import { Suspense } from "react";
import { notFound } from "next/navigation";

// Server Actions from lib
import { getProductBySlug } from "@lib/actions/product.actions";
import { getAttributes } from "@lib/actions/attribute.actions";
import { getGlobalSettings } from "@lib/actions/settings.actions";

// Client Component
import ProductClient from "./_components/product-client";
import ProductSlugSkeleton from "@components/preloader/ProductSlugSkeleton";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { product } = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for could not be found.",
    };
  }

  const productTitle =
    product?.seo?.meta_title?.en || product?.title?.en || "Product";
  const productDescription =
    product?.seo?.meta_description?.en ||
    product?.description?.en ||
    "Shop the best products";
  const ogImage =
    product?.seo?.og_image ||
    (product?.image?.length > 0 ? product.image[0] : "");
  const seoKeywords =
    product?.seo?.meta_keywords?.length > 0
      ? product.seo.meta_keywords
      : product?.tags || [];

  return {
    title: productTitle,
    description: productDescription,
    keywords: seoKeywords,
    openGraph: {
      title: productTitle,
      description: productDescription,
      images: ogImage ? [{ url: ogImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: productTitle,
      description: productDescription,
      images: ogImage ? [ogImage] : [],
    },
  };
}

async function ProductSlugContent({ slug }) {
  const [
    { product, reviews, relatedProducts },
    { attributes },
  ] = await Promise.all([
    getProductBySlug(slug),
    getAttributes(),
    getGlobalSettings(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductClient
      product={product}
      reviews={reviews || []}
      attributes={attributes || []}
      relatedProducts={relatedProducts || []}
      error={null}
    />
  );
}

const ProductSlug = async ({ params }) => {
  const { slug } = await params;

  return (
    <Suspense fallback={<ProductSlugSkeleton />}>
      <ProductSlugContent slug={slug} />
    </Suspense>
  );
};

export default ProductSlug;
