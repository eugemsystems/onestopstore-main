//internal import
import { cookies } from "next/headers";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { searchProducts } from "@lib/actions/product.actions";
import OfferProductCard from "@components/offer/OfferProductCard";

/**
 * "Latest Offers" card next to the hero carousel. Previously rendered
 * <Coupon couponInHome /> which always shows an empty list — Laravel has no
 * "list active coupons" endpoint (coupons are only validated by code at
 * checkout), so the card was permanently blank. Shows real currently
 * on-sale products instead, which is both real data and a better fit for
 * "offers" than an empty coupon widget.
 *
 * Simple vertical list of compact product cards (thumbnail + name + price
 * — OfferProductCard), same box proportions as the original list version.
 * Deliberately not a Swiper carousel — every horizontal-carousel attempt
 * here ran into width/overflow/gap issues; a vertical stack naturally
 * respects its container's width with no sizing math to get wrong.
 */
const OfferCard = async () => {
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

  const { products: rawProducts } = await searchProducts({
    onSale: true,
    limit: 6,
    sort: "newest",
  });
  // Resolve the translatable {en: "..."} title into a plain string here —
  // OfferProductCard is a simple presentational component, not wired into
  // the app's client-side translation context.
  const products = (rawProducts || []).map((product) => ({
    ...product,
    title: showingTranslateValue(product.title),
  }));

  return (
    // Same total height as the hero banner (CarouselCard) beside it.
    <div className="w-full group h-[260px] sm:h-[340px] lg:h-[400px] flex flex-col">
      <div className="shrink-0 bg-primary/10 dark:bg-primary/20 text-foreground px-6 py-2 border border-b-0 border-primary/20 rounded-t-xl flex items-center justify-center">
        <h3 className="text-base font-medium">
          {showingTranslateValue(
            storeCustomizationSetting?.home?.discount_title,
          ) || "Latest Offers"}
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto rounded-b-xl border border-primary/30 bg-card p-2 space-y-2">
        {products?.length > 0 ? (
          products.map((product) => (
            <OfferProductCard key={product._id} product={product} />
          ))
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
