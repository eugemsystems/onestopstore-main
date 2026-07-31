"use client";

import { useContext, useState, useEffect } from "react";
import Link from "next/link";

//internal import
import MegaMenuCategory from "@components/mega-menu/MegaMenuCategory";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
// import SelectLanguage from "@components/form/SelectLanguage";
import StoreTheme from "@components/common/StoreTheme";
import { resolveActiveTheme } from "@utils/resolveActiveTheme";
import { useSetting } from "@context/SettingContext";

const NavbarPromo = ({
  languages,
  categories,
  categoryError,
  themes,
  defaultTheme,
  storeLayout = "default",
}) => {
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { storeCustomization, globalSetting } = useSetting();

  const { showingTranslateValue } = useUtilsFunction();
  const navbar = storeCustomization?.navbar;

  const [activeTheme, setActiveTheme] = useState(defaultTheme || null);

  // Production uses API default theme; local/dev may restore cookie override
  useEffect(() => {
    setActiveTheme(resolveActiveTheme(themes, defaultTheme));
  }, [themes, defaultTheme]);

  return (
    <>
      {/* Inject theme CSS variables */}
      <StoreTheme theme={activeTheme} />

      <div
        suppressHydrationWarning
        className="hidden lg:block xl:block bg-background text-foreground border-b border-border"
      >
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 h-12 flex justify-between items-center">
          <div className="inline-flex">
            <div className="relative">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center md:justify-start md:space-x-10">
                  <nav className="md:flex items-center gap-5">
                    <Link
                      href="/"
                      onClick={() => setIsLoading(!isLoading)}
                      className="py-2 text-sm font-medium text-foreground hover:text-primary"
                    >
                      Home
                    </Link>

                    <Link
                      href="/shop"
                      onClick={() => setIsLoading(!isLoading)}
                      className="py-2 text-sm font-medium text-foreground hover:text-primary"
                    >
                      Shop
                    </Link>

                    {navbar?.categories_menu_status && (
                      <MegaMenuCategory
                        categories={categories}
                        categoryError={categoryError}
                        storeLayout={storeLayout}
                      />
                    )}

                    {navbar?.about_menu_status && (
                      <Link
                        href="/about-us"
                        onClick={() => setIsLoading(!isLoading)}
                        className="py-2 text-sm font-medium text-foreground hover:text-primary"
                      >
                        {showingTranslateValue(navbar?.about_us) || "About Us"}
                      </Link>
                    )}

                    {navbar?.contact_menu_status && (
                      <Link
                        onClick={() => setIsLoading(!isLoading)}
                        href="/contact-us"
                        className="py-2 text-sm font-medium text-foreground hover:text-primary"
                      >
                        {showingTranslateValue(navbar?.contact_us) ||
                          "Contact Us"}
                      </Link>
                    )}

                    {navbar?.flash_sale_menu_status !== false && (
                      <Link
                        href="/search?on_sale=1"
                        onClick={() => setIsLoading(!isLoading)}
                        className="relative inline-flex items-center bg-orange-500/10 py-0 px-2 rounded text-sm font-medium text-orange-600 hover:text-primary"
                      >
                        ⚡{" "}
                        {showingTranslateValue(navbar?.flash_sale) ||
                          "Flash Sale"}
                        <div className="absolute flex w-3 h-3 left-auto -right-1.5 -top-1.5">
                          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-white"></span>
                        </div>
                      </Link>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-foreground">
            {/* <SelectLanguage data={languages} /> */}

            {navbar?.privacy_policy_status && (
              <Link
                onClick={() => setIsLoading(!isLoading)}
                href="/privacy-policy"
                className="py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                {showingTranslateValue(navbar?.privacy_policy) ||
                  "Privacy Policy"}
              </Link>
            )}
            {navbar?.term_and_condition_status && (
              <Link
                onClick={() => setIsLoading(!isLoading)}
                href="/terms-and-conditions"
                className="py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                {showingTranslateValue(navbar?.term_and_condition) ||
                  "Terms & Conditions"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarPromo;
