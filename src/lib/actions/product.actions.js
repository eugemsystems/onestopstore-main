"use server";

import { revalidateTag } from "next/cache";
import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import {
  toTemplateProduct,
  bucketProducts,
  unwrapList,
} from "@services/laravelAdapter";
import { fetchPublicReviews } from "@services/LaravelReviews";

/**
 * Get store products with filtering options.
 * Backed by the Raines Laravel API (`/product`), then adapted to the
 * template's expected buckets.
 */
export async function getStoreProducts({
  category = "",
  title = "",
  slug = "",
} = {}) {
  try {
    const params = new URLSearchParams({ status: "1", paginate: "36" });
    if (category) params.set("category", category);
    if (title) params.set("search", title);

    const response = await resilientFetch(
      `${baseURL}/product?${params.toString()}`,
      {
        next: {
          revalidate: 60,
          tags: ["store_products"],
        },
      },
    );

    const payload = await handleResponse(response);
    const { products, popularProducts, discountedProducts } = bucketProducts(
      unwrapList(payload),
    );

    return {
      success: true,
      error: null,
      reviews: [],
      products,
      relatedProducts: products.slice(0, 12),
      popularProducts,
      discountedProducts,
    };
  } catch (error) {
    return {
      success: false,
      products: [],
      relatedProducts: [],
      popularProducts: [],
      discountedProducts: [],
      reviews: [],
      error: error.message,
    };
  }
}

/**
 * Get product by slug — Laravel `/product/slug/{slug}`
 */
export async function getProductBySlug(slug) {
  try {
    const response = await resilientFetch(`${baseURL}/product/slug/${slug}`, {
      next: {
        revalidate: 120,
        tags: ["product", `product-${slug}`],
      },
    });

    const raw = await handleResponse(response);
    const laravelProduct = raw?.data ?? raw;
    const product = toTemplateProduct(laravelProduct);

    if (!product || !product._id) {
      return {
        success: false,
        product: null,
        reviews: [],
        relatedProducts: [],
        error: "Product not found",
      };
    }

    // Laravel already embeds related products on the slug endpoint
    const related = Array.isArray(laravelProduct?.related_products)
      ? laravelProduct.related_products.map(toTemplateProduct).filter(Boolean)
      : [];

    // Public reviews — Laravel doesn't embed these on the slug endpoint,
    // so fetch them separately via the public /front/review route.
    let reviews = [];
    try {
      reviews = await fetchPublicReviews(product.id);
    } catch {
      // Non-fatal — the product page still renders without reviews
    }

    let relatedProducts = related;
    if (relatedProducts.length === 0 && product.category?.slug) {
      const rel = await getRelatedProducts(product.category.slug);
      relatedProducts = (rel.products || []).filter(
        (p) => p._id !== product._id,
      );
    }

    return {
      success: true,
      product,
      reviews,
      relatedProducts,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      product: null,
      reviews: [],
      relatedProducts: [],
      error: error.message,
    };
  }
}

/**
 * Search products (server-side paginated, filtered, sorted)
 * Laravel `/product?search=&category=&paginate=&page=&sortBy=&field=`
 */
export async function searchProducts({
  query = "",
  category = "",
  sort = "",
  rating = "",
  minPrice = "",
  maxPrice = "",
  onSale = false,
  page = 1,
  limit = 24,
} = {}) {
  try {
    const params = new URLSearchParams({
      status: "1",
      paginate: String(limit),
      page: String(page),
    });
    if (category) params.set("category", category);
    if (query) params.set("search", query);
    if (onSale) params.set("on_sale", "1");

    // Laravel's real sort contract (verified against the live API):
    // sortBy=ASCENDING|DESCENDING + field=<column>. Values like "low-high"
    // or a bare "price" are NOT understood and silently no-op.
    if (sort === "price-low" || sort === "low-high") {
      params.set("sortBy", "ASCENDING");
      params.set("field", "price");
    } else if (sort === "price-high" || sort === "high-low") {
      params.set("sortBy", "DESCENDING");
      params.set("field", "price");
    } else if (sort === "newest") {
      params.set("sortBy", "DESCENDING");
      params.set("field", "created_at");
    } else if (sort === "oldest") {
      params.set("sortBy", "ASCENDING");
      params.set("field", "created_at");
    } else if (sort === "rating" || sort === "best-selling") {
      // Neither reviews_avg_rating nor orders_count are sortable DB columns
      // on this API (avg is computed/nullable, orders_count doesn't exist
      // on the products table) — reviews_count is the closest working
      // popularity proxy.
      params.set("sortBy", "DESCENDING");
      params.set("field", "reviews_count");
    }
    if (rating) params.set("rating", String(rating));
    // Laravel expects "min-max" (dash) — a comma silently returns zero results.
    if (minPrice || maxPrice) {
      params.set("price", `${minPrice || 0}-${maxPrice || 999999}`);
    }

    const response = await resilientFetch(
      `${baseURL}/product?${params.toString()}`,
      {
        next: {
          revalidate: 30,
          tags: ["search_products"],
        },
      },
    );

    const payload = await handleResponse(response);
    const products = unwrapList(payload)
      .map(toTemplateProduct)
      .filter(Boolean);

    const totalDoc = Number(payload?.total) || products.length;
    const currentPage = Number(payload?.current_page) || page;
    const totalPages =
      Number(payload?.last_page) || Math.ceil(totalDoc / limit) || 1;

    return {
      success: true,
      products,
      totalDoc,
      page: currentPage,
      limit,
      totalPages,
      hasMore: currentPage < totalPages,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      products: [],
      totalDoc: 0,
      page,
      limit,
      totalPages: 0,
      hasMore: false,
      error: error.message,
    };
  }
}

/**
 * Get discounted products (on-sale items)
 */
export async function getDiscountedProducts() {
  try {
    const response = await resilientFetch(
      `${baseURL}/product?status=1&paginate=24&on_sale=1`,
      {
        next: {
          revalidate: 120,
          tags: ["discounted_products"],
        },
      },
    );

    const payload = await handleResponse(response);
    const { discountedProducts, products } = bucketProducts(
      unwrapList(payload),
    );

    return {
      success: true,
      products: discountedProducts.length > 0 ? discountedProducts : products,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      products: [],
      error: error.message,
    };
  }
}

/**
 * Get popular products (featured / trending)
 */
export async function getPopularProducts() {
  try {
    const response = await resilientFetch(
      `${baseURL}/product?status=1&paginate=24&top_rated=1`,
      {
        next: {
          revalidate: 120,
          tags: ["popular_products"],
        },
      },
    );

    const payload = await handleResponse(response);
    const { popularProducts } = bucketProducts(unwrapList(payload));

    return {
      success: true,
      products: popularProducts,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      products: [],
      error: error.message,
    };
  }
}

/**
 * Get related products by category (slug or id)
 */
export async function getRelatedProducts(category) {
  try {
    const response = await resilientFetch(
      `${baseURL}/product?status=1&paginate=12&category=${category}`,
      {
        next: {
          revalidate: 120,
          tags: ["related_products", `category-${category}`],
        },
      },
    );

    const payload = await handleResponse(response);
    const products = unwrapList(payload)
      .map(toTemplateProduct)
      .filter(Boolean);

    return {
      success: true,
      products,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      products: [],
      error: error.message,
    };
  }
}

/**
 * Revalidate product cache
 */
export async function revalidateProducts() {
  revalidateTag("store_products");
  revalidateTag("product");
  revalidateTag("discounted_products");
  revalidateTag("popular_products");
  revalidateTag("related_products");
}
