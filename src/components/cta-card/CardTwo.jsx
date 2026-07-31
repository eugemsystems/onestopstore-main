import Image from "next/image";
import Link from "next/link";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { showingTranslateValue } from "@lib/translate";

const AppleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-6 h-6 fill-white shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GooglePlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-6 h-6 fill-white shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3.18 23.76c.35.2.74.24 1.1.12l12.02-6.93-2.54-2.54-10.58 9.35zm-1.1-20.71a2 2 0 0 0-.08.62v16.66c0 .22.03.43.08.62L13.04 12 2.08 3.05zm18.07 8.38-2.84-1.64L14.5 12l2.81 2.21 2.84-1.64c.81-.47.81-1.23 0-1.7v.06zm-16.41-9.5 10.58 9.35 2.54-2.54L4.28.2c-.36-.12-.75-.08-1.1.12l-.44.61z" />
  </svg>
);

const CardTwo = async () => {
  const { storeCustomizationSetting } = await getStoreCustomizationSetting();
  const home = storeCustomizationSetting?.home;

  const title =
    showingTranslateValue(home?.quick_delivery_title) ||
    "Explore the Marketplace Apps For Best Shopping Experiences!";
  const description =
    showingTranslateValue(home?.quick_delivery_description) ||
    "Professionally customize intuitive best practices after unique intellectual capital. Seamlessly repurpose e-business e-commerce via backend imperatives.";
  const appLink = home?.quick_delivery_link || "#";
  const appScreenImg = home?.quick_delivery_img || "/app-download-img.png";

  return (
    /* Full-width green section */
    <section className="w-full bg-primary">
      {/* Inner container — content bounded to max-w-screen-2xl */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-10 flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">
        {/* ── Left column: app screen image, flush top & bottom with spacing ── */}
        <div className="hidden lg:block lg:w-1/2 overflow-hidden self-stretch relative">
          <div className="relative w-full h-full">
            <Image
              src={appScreenImg}
              alt="App screen"
              fill
              sizes="(max-width: 460px) 460px, (max-width: 992px) 50vw, 33vw"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* ── Right column: vertically centered text + buttons ── */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center py-10 lg:py-14">
          <h3 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl leading-snug mb-4">
            {title}
          </h3>
          <p className="text-white text-sm mb-7 max-w-md">
            {description}
          </p>

          {/* App store download buttons */}
          <div className="flex flex-wrap gap-3">
            {/* App Store */}
            <Link
              href={appLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white rounded-xl px-4 py-3 transition-colors"
            >
              <AppleIcon />
              <div className="text-left leading-tight">
                <span className="block text-[9px] text-white/60 uppercase tracking-widest font-medium">
                  Download on the
                </span>
                <span className="block text-sm font-semibold">App Store</span>
              </div>
            </Link>

            {/* Google Play */}
            <Link
              href={appLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-black hover:bg-gray-900 text-white rounded-xl px-4 py-3 transition-colors"
            >
              <GooglePlayIcon />
              <div className="text-left leading-tight">
                <span className="block text-[9px] text-white/60 uppercase tracking-widest font-medium">
                  Download on the
                </span>
                <span className="block text-sm font-semibold">Google Play</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardTwo;
