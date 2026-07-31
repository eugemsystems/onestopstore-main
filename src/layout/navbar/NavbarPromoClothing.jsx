"use client";

import { useContext, useState, useEffect } from "react";
import Link from "next/link";

import MegaMenuCategory from "@components/mega-menu/MegaMenuCategory";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SelectLanguage from "@components/form/SelectLanguage";
import SelectTheme from "@components/form/SelectTheme";
import SelectLayout from "@components/form/SelectLayout";
import StoreTheme from "@components/common/StoreTheme";
import { resolveActiveTheme } from "@utils/resolveActiveTheme";
import { isLocalStorePreview } from "@utils/localStorePreview";
import { useSetting } from "@context/SettingContext";

const NavbarPromoClothing = ({
  languages,
  categories,
  categoryError,
  themes,
  defaultTheme,
  storeLayout = "clothing",
}) => {
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { storeCustomization, globalSetting } = useSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const navbar = storeCustomization?.navbar;

  const [activeTheme, setActiveTheme] = useState(defaultTheme || null);

  useEffect(() => {
    setActiveTheme(resolveActiveTheme(themes, defaultTheme));
  }, [themes, defaultTheme]);

  return (
    <>
      <StoreTheme theme={activeTheme} />

      <div className="hidden lg:block xl:block bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 h-11 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {/* Mega Menu */}
            {navbar?.categories_menu_status && (
              <MegaMenuCategory
                categories={categories}
                categoryError={categoryError}
                storeLayout="clothing"
              />
            )}

            {navbar?.about_menu_status && (
              <Link
                href="/about-us"
                onClick={() => setIsLoading(!isLoading)}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {showingTranslateValue(navbar?.about_us) || "About Us"}
              </Link>
            )}

            {navbar?.contact_menu_status && (
              <Link
                href="/contact-us"
                onClick={() => setIsLoading(!isLoading)}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {showingTranslateValue(navbar?.contact_us) || "Contact Us"}
              </Link>
            )}

            <Link
              href="/track"
              onClick={() => setIsLoading(!isLoading)}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Track Order
            </Link>

            {navbar?.offers_menu_status && (
              <Link
                href="/offers"
                onClick={() => setIsLoading(!isLoading)}
                className="relative text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                {showingTranslateValue(navbar?.offers) || "Offers"}
                <span className="absolute -top-1.5 -right-2.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                </span>
              </Link>
            )}

            {navbar?.flash_sale_menu_status !== false && (
              <Link
                href="/flash-sale"
                onClick={() => setIsLoading(!isLoading)}
                className="relative text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
              >
                {showingTranslateValue(navbar?.flash_sale) || "Flash Sale"}
                <span className="absolute -top-1.5 -right-2.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white"></span>
                </span>
              </Link>
            )}
          </div>

          <div className="flex items-center text-neutral-600 dark:text-neutral-300">
            <SelectLanguage data={languages} />
            {isLocalStorePreview && (
              <SelectTheme
                themes={themes}
                defaultTheme={defaultTheme}
                onThemeChange={(theme) => setActiveTheme(theme)}
              />
            )}
            {isLocalStorePreview && <SelectLayout currentLayout={storeLayout} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarPromoClothing;
