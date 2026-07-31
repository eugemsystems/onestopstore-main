import { Suspense } from "react";

//internal import
import StickyCart from "@components/cart/StickyCart";
import HomeDefault from "@components/home/HomeDefault";
import HomeModern from "@components/home/HomeModern";
import HomeMinimal from "@components/home/HomeMinimal";
import HomeClothing from "@components/home/HomeClothing";
import HomeElectronic from "@components/home/HomeElectronic";
import { getStoreProducts, searchProducts } from "@lib/actions/product.actions";
import { getAttributes } from "@lib/actions/attribute.actions";
import { getCategories } from "@lib/actions/category.actions";
import {
  getGlobalSettings,
  getCustomizationSettings,
} from "@lib/actions/settings.actions";
import { getFeaturedCampaign } from "@lib/actions/campaign.actions";
import { resolveStoreLayout } from "@lib/resolveStoreLayout";

const Home = async ({ searchParams }) => {
  const [
    { attributes },
    { storeCustomizationSetting, error: storeCustomizationError },
    { popularProducts, error },
    { globalSetting },
    { categories },
    featuredCampaignResult,
    { products: discountedProducts },
  ] = await Promise.all([
    getAttributes(),
    getCustomizationSettings(),
    getStoreProducts({ category: "", title: "" }),
    getGlobalSettings(),
    getCategories(),
    getFeaturedCampaign(),
    // The homepage's plain product list rarely contains an on-sale item by
    // chance (only ~50 of ~15,000 products are on sale at any time) — fetch
    // real on-sale products directly instead of hoping the first page of
    // unsorted products happens to include some.
    searchProducts({ onSale: true, limit: 18, sort: "newest" }),
  ]);

  // Production uses admin globalSetting; local/dev may override via cookie/query
  const params = await searchParams;
  const layout = await resolveStoreLayout(globalSetting, params);

  const layoutProps = {
    popularProducts,
    discountedProducts,
    attributes,
    storeCustomizationSetting,
    storeCustomizationError: error || storeCustomizationError,
    globalSetting,
    categories,
    featuredCampaign: featuredCampaignResult?.campaign || null,
  };

  return (
    <>
      {layout === "modern" && <HomeModern {...layoutProps} />}
      {layout === "minimal" && <HomeMinimal {...layoutProps} />}
      {layout === "clothing" && <HomeClothing {...layoutProps} />}
      {layout === "electronic" && <HomeElectronic {...layoutProps} />}
      {(layout === "default" ||
        !["modern", "minimal", "clothing", "electronic"].includes(layout)) && (
        <HomeDefault {...layoutProps} />
      )}
    </>
  );
};

export default Home;
