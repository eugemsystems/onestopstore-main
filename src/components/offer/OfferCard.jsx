//internal import
import { cookies } from "next/headers";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { searchProducts } from "@lib/actions/product.actions";
import ProductCard from "@components/product/ProductCard";

/**
 * "Latest Offers" card next to the hero carousel. Previously rendered
 * <Coupon couponInHome /> which always shows an empty list — Laravel has no
 * "list active coupons" endpoint (coupons are only validated by code at
 * checkout), so the card was permanently blank. Shows real currently
 * on-sale products instead, which is both real data and a better fit for
 * "offers" than an empty coupon widget.
 *
 * Same box (bordered, titled) as before, same outer position beside the
 * hero banner — only the inside changed: a static 3-column CSS grid of
 * the real ProductCard (same one used in Best Sellers/New Arrivals/etc),
 * not a Swiper carousel. A grid divides its container into exact equal
 * columns with no overflow/gap math to get wrong, unlike every
 * Swiper-based attempt before this.
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

  const { products } = await searchProducts({
    onSale: true,
    limit: 3,
    sort: "newest",
  });

  return (
    // Same total height as the hero banner (CarouselCard) beside it — sized
    // up from the old compact-list height to fit ProductCard's real height
    // (image + title + rating + price + meta) in one row without clipping.
    <div className="w-full group h-[420px] sm:h-[460px] lg:h-[520px] flex flex-col">
      <div className="shrink-0 bg-primary/10 dark:bg-primary/20 text-foreground px-6 py-2 border border-b-0 border-primary/20 rounded-t-xl flex items-center justify-center">
        <h3 className="text-base font-medium">
          {showingTranslateValue(
            storeCustomizationSetting?.home?.discount_title,
          ) || "Latest Offers"}
        </h3>
      </div>
      <div className="flex-1 min-h-0 rounded-b-xl border border-primary/30 bg-card p-2">
        {products?.length > 0 ? (
          <div className="grid h-full grid-cols-3 gap-2">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                attributes={attributes}
              />
            ))}
          </div>
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
