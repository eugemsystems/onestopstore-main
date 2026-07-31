//internal import

import { cookies } from "next/headers";
import CarouselCard from "@components/carousel/CarouselCard";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { searchProducts, getProductsByIds } from "@lib/actions/product.actions";
import { getHomePageContent } from "@lib/actions/home.actions";

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

  // Priority 1: admin-curated products. `content.products_ids` is
  // aggregated server-side (onestopstore-api) from every product picker
  // across the admin "Home Pages" builder — whatever's configured there
  // drives the hero banner directly.
  const { content: homeContent } = await getHomePageContent();
  const { products: bannerProducts } =
    homeContent?.products_ids?.length > 0
      ? await getProductsByIds(homeContent.products_ids)
      : { products: [] };

  // Priority 2: real, live content still beats static placeholder banners
  // — pull a handful of currently on-sale products and turn each into a
  // slide (real photo, real discount, real link) if nothing's curated.
  const { products: saleProducts } = bannerProducts?.length
    ? { products: [] }
    : await searchProducts({ onSale: true, limit: 5, sort: "newest" });

  let sliderData;
  if (bannerProducts?.length > 0) {
    sliderData = bannerProducts.map((product) => ({
      id: product._id,
      title: showingTranslateValue(product.title),
      info: showingTranslateValue(product.category?.name),
      buttonName: "Shop Now",
      url: `/product/${product.slug}`,
      image: product.image?.[0] || "/slider/slider-1.jpg",
      fit: "contain",
      price: product.prices,
    }));
  } else if (saleProducts?.length > 0) {
    sliderData = saleProducts.map((product) => ({
      id: product._id,
      title: showingTranslateValue(product.title),
      info: showingTranslateValue(product.category?.name),
      buttonName: "Shop Now",
      url: `/product/${product.slug}`,
      image: product.image?.[0] || "/slider/slider-1.jpg",
      fit: "contain",
      badge: "On Sale",
      price: product.prices,
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

export default MainCarousel;
