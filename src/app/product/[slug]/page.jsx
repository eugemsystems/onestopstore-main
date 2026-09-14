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
    <>
      <ProductJsonLd product={product} />
      <ProductClient
        product={product}
        reviews={reviews || []}
        attributes={attributes || []}
        relatedProducts={relatedProducts || []}
        error={null}
      />
    </>
  );
}

// Product structured data (schema.org/Product) — lets search results show
// price, availability and rating directly, without a duplicate client-side
// copy (a single server-rendered block is the only one that ever exists).
function ProductJsonLd({ product }) {
  const storeDomain = (
    process.env.NEXT_PUBLIC_STORE_DOMAIN || "https://onestopstore.local"
  ).replace(/\/$/, "");

  const name = product?.title?.en || product?.seo?.meta_title?.en || "";
  const description =
    product?.seo?.meta_description?.en || product?.description?.en || "";
  const images = Array.isArray(product?.image) ? product.image.filter(Boolean) : [];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    description,
    image: images,
    sku: product?.sku || undefined,
    brand: product?.brand?.name
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${storeDomain}/product/${product?.slug}`,
      priceCurrency: "USD",
      price: product?.prices?.price ?? undefined,
      availability:
        product?.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product?.total_reviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product?.average_rating || 0,
            reviewCount: product.total_reviews,
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
