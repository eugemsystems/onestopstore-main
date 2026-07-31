import React from "react";
import Link from "next/link";
import { FiPhoneCall } from "react-icons/fi";

//internal imports
import { showingTranslateValue } from "@lib/translate";
import SelectCurrency from "@components/form/SelectCurrency";
import TopNavbarTheme from "./TopNavbarTheme";
import SelectLayout from "@components/form/SelectLayout";
import { getShowingThemes, getDefaultTheme } from "@services/ThemeServices";
import { getGlobalSettings, getThemeOptions } from "@lib/actions/settings.actions";
import { isUserAuthenticated } from "@lib/auth-server";
import TopBarContentRotator from "./TopBarContentRotator";

const TopNavbar = async ({ storeCustomization }) => {
  const navbar = storeCustomization?.navbar;

  const [{ themes }, { theme: defaultTheme }, { globalSetting }, isLoggedIn, { themeOptions }] =
    await Promise.all([
      getShowingThemes(),
      getDefaultTheme(),
      getGlobalSettings(),
      isUserAuthenticated(),
      getThemeOptions(),
    ]);

  const topBarContent = Array.isArray(themeOptions?.header?.top_bar_content)
    ? themeOptions.header.top_bar_content.map((item) => item?.content).filter(Boolean)
    : [];

  const storeLayout = globalSetting?.store_layout || "default";

  // showingTranslateValue is async (reads the locale cookie) — awaiting it
  // here (rather than inline in JSX) was the actual cause of "blank" labels:
  // an un-awaited Promise is always truthy, so `promise || "fallback"` never
  // fell back and React silently rendered nothing for the Promise itself.
  const helpText = (await showingTranslateValue(navbar?.help_text)) || "We're here to help";
  const aboutUsLabel = (await showingTranslateValue(navbar?.about_us)) || "About Us";
  const contactUsLabel = (await showingTranslateValue(navbar?.contact_us)) || "Contact Us";

  return (
    <div className="hidden lg:block bg-muted">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-10">
        <div className="text-muted-foreground py-2 font-sans text-xs font-medium flex justify-between items-center">
          <span className="flex items-center min-w-0">
            <FiPhoneCall className="mr-2 shrink-0" />
            {topBarContent.length > 0 ? (
              <TopBarContentRotator items={topBarContent} />
            ) : (
              helpText
            )}
            {globalSetting?.contact && (
              <a
                href={`tel:${globalSetting.contact}`}
                className="font-bold text-primary ml-1"
              >
                {globalSetting.contact}
              </a>
            )}
          </span>

          <div className="lg:text-right flex items-center navBar">
            {navbar?.about_menu_status && (
              <div>
                <Link
                  href="/about-us"
                  className="font-medium hover:text-primary"
                >
                  {aboutUsLabel}
                </Link>
                <span className="mx-2">|</span>
              </div>
            )}
            {navbar?.contact_menu_status && (
              <div>
                <Link
                  href="/contact-us"
                  className="font-medium hover:text-primary"
                >
                  {contactUsLabel}
                </Link>
                <span className="mx-2">|</span>
              </div>
            )}
            {!isLoggedIn && (
              <div>
                <Link
                  href="/auth/signup"
                  className="font-medium hover:text-primary"
                >
                  Create an Account
                </Link>
                <span className="mx-2">|</span>
              </div>
            )}
            <div>
              <Link
                href="/auctions"
                className="font-medium hover:text-primary"
              >
                Auctions
              </Link>
            </div>

            <div className="flex items-center ml-4 gap-2 border-l border-border pl-4">
              <SelectCurrency size="text-xs" />
              <TopNavbarTheme
                themes={themes}
                defaultTheme={defaultTheme}
                size="text-xs"
              />
              <SelectLayout currentLayout={storeLayout} size="text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
