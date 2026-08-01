//internal import
import { cookies } from "next/headers";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { searchProducts } from "@lib/actions/product.actions";
import ProductCard from "@components/product/ProductCard";
import OfferProductRow from "@components/offer/OfferProductRow";

/**
 * "Latest Offers" card next to the hero carousel. Previously rendered
 * <Coupon couponInHome /> which always shows an empty list — Laravel has no
 * "list active coupons" endpoint (coupons are only validated by code at
 * checkout), so the card was permanently blank. Shows real currently
 * on-sale products instead, which is both real data and a better fit for
 * "offers" than an empty coupon widget.
 *
 * Layout: a top row of 2 product cards (compact ProductCard, same
 * component as Best Sellers/New Arrivals/etc), then below that 2 list
 * rows in the original compact row style (thumbnail + name + price).
 *
 *   |--------|  |--------|
 *   |  card  |  |  card  |
 *   |--------|  |--------|
 *   *** row ***************
 *   *** row ***************
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

  const { products: rawProducts } = await searchProducts({
    onSale: true,
    limit: 4,
    sort: "newest",
  });
  const cardProducts = rawProducts?.slice(0, 2) || [];
  const rowProducts = (rawProducts?.slice(2, 4) || []).map((product) => ({
    ...product,
    title: showingTranslateValue(product.title),
  }));

  return (
    <div className="w-full group h-[420px] sm:h-[460px] lg:h-[520px] flex flex-col">
      <div className="shrink-0 bg-primary/10 dark:bg-primary/20 text-foreground px-6 py-2 border border-b-0 border-primary/20 rounded-t-xl flex items-center justify-center">
        <h3 className="text-base font-medium">
          {showingTranslateValue(
            storeCustomizationSetting?.home?.discount_title,
          ) || "Latest Offers"}
        </h3>
      </div>
      <div className="flex-1 min-h-0 rounded-b-xl border border-primary/30 bg-card p-2 flex flex-col gap-2">
        {cardProducts.length > 0 || rowProducts.length > 0 ? (
          <>
            {cardProducts.length > 0 && (
              <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
                {cardProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    attributes={attributes}
                    compact
                  />
                ))}
              </div>
            )}
            {rowProducts.length > 0 && (
              <div className="shrink-0 flex flex-col gap-2">
                {rowProducts.map((product) => (
                  <OfferProductRow key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
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
