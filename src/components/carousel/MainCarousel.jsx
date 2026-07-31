//internal import

import { cookies } from "next/headers";
import CarouselCard from "@components/carousel/CarouselCard";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { searchProducts } from "@lib/actions/product.actions";

const MainCarousel = async () => {
  const cookieStore = await cookies();
  const lang = cookieStore.get("_lang")?.value || "en";
  const showingTranslateValue = (data) => {
    if (!data) return "";
    return data !== undefined && Object?.keys(data).includes(lang)
      ? data[lang]
      : data?.en || "";
  };
  const showingUrl = (data) => (data !== undefined ? data : "!#");
  const showingImage = (data) => data !== undefined && data;

  const { storeCustomizationSetting } = await getStoreCustomizationSetting();
  const slider = storeCustomizationSetting?.slider;

  // Real, live content beats static placeholder banners — pull a handful of
  // currently on-sale products and turn each into a slide (real photo,
  // real discount, real link). Falls back to the CMS-configured static
  // slides if nothing is on sale right now.
  const { products: saleProducts } = await searchProducts({
    onSale: true,
    limit: 5,
    sort: "newest",
  });

  let sliderData;
  if (saleProducts?.length > 0) {
    sliderData = saleProducts.map((product) => ({
      id: product._id,
      title: showingTranslateValue(product.title),
      info:
        product.prices?.discount > 0
          ? `Now ${formatMoney(product.prices.price)} — save ${product.prices.discount}%`
          : "On sale now",
      buttonName: "Shop Now",
      url: `/product/${product.slug}`,
      image: product.image?.[0] || "/slider/slider-1.jpg",
      fit: "contain",
      badge: "On Sale",
    }));
  } else {
    sliderData = [
      {
        id: 1,
        title: showingTranslateValue(slider?.first_title),
        info: showingTranslateValue(slider?.first_description),
        buttonName: showingTranslateValue(slider?.first_button),
        url: showingUrl(slider?.first_link),
        image: showingImage(slider?.first_img) || "/slider/slider-1.jpg",
      },
      {
        id: 2,
        title: showingTranslateValue(slider?.second_title),
        info: showingTranslateValue(slider?.second_description),
        buttonName: showingTranslateValue(slider?.second_button),
        url: showingUrl(slider?.second_link),
        image: showingImage(slider?.second_img) || "/slider/slider-2.jpg",
      },
      {
        id: 3,
        title: showingTranslateValue(slider?.third_title),
        info: showingTranslateValue(slider?.third_description),
        buttonName: showingTranslateValue(slider?.third_button),
        url: showingUrl(slider?.third_link),
        image: showingImage(slider?.third_img) || "/slider/slider-3.jpg",
      },
    ];
  }

  return (
    <>
      <CarouselCard
        sliderData={sliderData}
        storeCustomizationSetting={storeCustomizationSetting}
      />
    </>
  );
};

function formatMoney(n) {
  const num = Number(n) || 0;
  return `$${num.toFixed(2)}`;
}

export default MainCarousel;
