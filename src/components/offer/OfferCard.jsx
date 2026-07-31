//internal import
import { cookies } from "next/headers";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { searchProducts } from "@lib/actions/product.actions";
import OfferCardSlider from "@components/offer/OfferCardSlider";

/**
 * "Latest Offers" card next to the hero carousel. Previously rendered
 * <Coupon couponInHome /> which always shows an empty list — Laravel has no
 * "list active coupons" endpoint (coupons are only validated by code at
 * checkout), so the card was permanently blank. Shows real currently
 * on-sale products instead, which is both real data and a better fit for
 * "offers" than an empty coupon widget.
 *
 * Renders full product cards (same DiscountedCard used in the "Latest
 * Deals" grid) one at a time in a slow vertical auto-scroll, matching the
 * hero carousel's own auto-advancing feel.
 */
const OfferCard = async ({ attributes }) => {
  const cookieStore = await cookies();
  const lang = cookieStore.get("_lang")?.value || "en";
  const showingTranslateValue = (data) => {
    if (!data) return "";
    return data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en || "";
  };
  const { storeCustomizationSetting, error } =
    await getStoreCustomizationSetting();

  const { products } = await searchProducts({ onSale: true, limit: 6, sort: "newest" });

  return (
    <div className="w-full group h-[420px] sm:h-[460px] lg:h-[520px] flex flex-col">
      <div className="shrink-0 bg-primary/10 dark:bg-primary/20 text-foreground px-6 py-2 border border-b-0 border-primary/20 rounded-t-xl flex items-center justify-center">
        <h3 className="text-base font-medium">
          {showingTranslateValue(
            storeCustomizationSetting?.home?.discount_title,
          ) || "Latest Offers"}
        </h3>
      </div>
      <div className="flex-1 min-h-0 rounded-b-xl overflow-hidden border border-primary/30 bg-card">
        {products?.length > 0 ? (
          <OfferCardSlider products={products} attributes={attributes} />
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No active offers right now — check back soon!
          </p>
        )}
      </div>
    </div>
  );
};

export default OfferCard;
