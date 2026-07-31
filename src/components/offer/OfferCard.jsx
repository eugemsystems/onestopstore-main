//internal import
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { searchProducts } from "@lib/actions/product.actions";

/**
 * "Latest Offers" card next to the hero carousel. Previously rendered
 * <Coupon couponInHome /> which always shows an empty list — Laravel has no
 * "list active coupons" endpoint (coupons are only validated by code at
 * checkout), so the card was permanently blank. Shows real currently
 * on-sale products instead, which is both real data and a better fit for
 * "offers" than an empty coupon widget.
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

  const { products } = await searchProducts({ onSale: true, limit: 6, sort: "newest" });

  return (
    <div className="w-full group h-[260px] sm:h-[340px] lg:h-[400px]">
      <div className="bg-card h-full border border-primary/30 transition duration-150 ease-linear transform group-hover:border-primary rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="shrink-0 bg-primary/10 dark:bg-primary/20 text-foreground px-6 py-2 border-b border-primary/20 flex items-center justify-center">
          <h3 className="text-base font-medium">
            {showingTranslateValue(
              storeCustomizationSetting?.home?.discount_title,
            ) || "Latest Offers"}
          </h3>
        </div>
        <div className="flex flex-1 flex-col divide-y divide-border overflow-y-auto">
          {products?.length > 0 ? (
            products.map((product) => (
              <Link
                key={product._id}
                href={`/product/${product.slug}`}
                className="flex flex-1 items-center gap-2.5 px-3 py-1.5 hover:bg-muted/50 min-h-0"
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-border">
                  <Image
                    src={product.image?.[0]}
                    alt="product"
                    fill
                    className="object-contain p-1"
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-medium text-foreground">
                    {showingTranslateValue(product.title)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-primary">
                      ${Number(product.prices?.price || 0).toFixed(2)}
                    </span>
                    {product.prices?.originalPrice > product.prices?.price && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        ${Number(product.prices.originalPrice).toFixed(2)}
                      </span>
                    )}
                    {product.prices?.discount > 0 && (
                      <span className="rounded-full bg-red-100 px-1 py-0.5 text-[9px] font-bold text-red-600">
                        -{product.prices.discount}%
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No active offers right now — check back soon!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
