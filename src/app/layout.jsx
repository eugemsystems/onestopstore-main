//internal imports
import React from "react";
import "@styles/custom.css";
import Providers from "./provider";
import { resolveStoreLayout } from "@lib/resolveStoreLayout";
import Navbar from "@layout/navbar/Navbar";
import NavbarClothing from "@layout/navbar/NavbarClothing";
import NavbarElectronic from "@layout/navbar/NavbarElectronic";
import Footer from "@layout/footer/Footer";
import FooterClothing from "@layout/footer/FooterClothing";
import FooterElectronic from "@layout/footer/FooterElectronic";
import FooterModern from "@layout/footer/FooterModern";
import MobileFooter from "@layout/footer/MobileFooter";
import FeatureCard from "@components/feature-card/FeatureCard";
import {
  getStoreSettings,
  getGlobalSettings,
  getCustomizationSettings,
} from "@lib/actions/settings.actions";

import { SettingProvider } from "@context/SettingContext";
import { CurrencyProvider } from "@context/CurrencyContext";
import ConditionalLayoutWrapper from "@components/layout/ConditionalLayoutWrapper";
import WhatsappChatWidget from "@components/whatsapp/WhatsappChatWidget";

// Force dynamic rendering so settings/customization are always fresh
export const dynamic = "force-dynamic";

// Dynamic metadata from API settings
export async function generateMetadata() {
  const { globalSetting } = await getGlobalSettings();
  const { storeCustomizationSetting } = await getCustomizationSettings();

  const seo = storeCustomizationSetting?.seo || {};
  const shopName = globalSetting?.shop_name || "Store";
  const siteDescription =
    globalSetting?.site_description ||
    seo?.meta_description ||
    `${shopName} - Online Store`;
  const siteUrl = seo?.meta_url || globalSetting?.website || "";
  const ogImage = seo?.og_img || seo?.meta_img || "";
  const favicon = seo?.favicon || globalSetting?.favicon || "/favicon.png";

  // Safely construct metadataBase URL
  let metadataBase;
  if (siteUrl) {
    try {
      metadataBase = new URL(
        siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`,
      );
    } catch {
      metadataBase = undefined;
    }
  }

  return {
    title: {
      default: seo?.meta_title || shopName,
      template: `%s | ${shopName}`,
    },
    description: siteDescription,
    keywords: seo?.meta_keywords || "",
    metadataBase,
    icons: {
      icon: favicon,
      apple: favicon,
    },
    openGraph: {
      title: seo?.meta_title || shopName,
      description: siteDescription,
      url: siteUrl,
      siteName: shopName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.meta_title || shopName,
      description: siteDescription,
      images: ogImage ? [ogImage] : [],
      creator: seo?.twitter_handle || "",
    },
    robots: seo?.robots || "index, follow",
    verification: {
      google: seo?.google_verification || "",
    },
  };
}

export default async function RootLayout({ children }) {
  const { globalSetting } = await getGlobalSettings();
  const { storeSetting } = await getStoreSettings();

  // Fetch all customization data at once (adjust your API to return full data)
  const { storeCustomizationSetting, error } = await getCustomizationSettings();

  // Production uses admin globalSetting; local/dev may override via cookie
  const storeLayout = await resolveStoreLayout(globalSetting);

  // Determine which Navbar to render
  const renderNavbar = () => {
    switch (storeLayout) {
      case "clothing":
        return (
          <NavbarClothing
            globalSetting={globalSetting}
            storeCustomization={storeCustomizationSetting}
            storeLayout={storeLayout}
          />
        );
      case "electronic":
        return (
          <NavbarElectronic
            globalSetting={globalSetting}
            storeCustomization={storeCustomizationSetting}
            storeLayout={storeLayout}
          />
        );
      case "modern":
        return (
          <NavbarElectronic
            globalSetting={globalSetting}
            storeCustomization={storeCustomizationSetting}
            storeLayout={storeLayout}
          />
        );
      default:
        return (
          <Navbar
            globalSetting={globalSetting}
            storeCustomization={storeCustomizationSetting}
            storeLayout={storeLayout}
          />
        );
    }
  };

  // Determine which Footer to render
  const renderFooter = () => {
    switch (storeLayout) {
      case "clothing":
        return (
          <FooterClothing
            error={error}
            storeCustomizationSetting={storeCustomizationSetting}
            globalSetting={globalSetting}
          />
        );
      case "electronic":
        return (
          <FooterElectronic
            error={error}
            storeCustomizationSetting={storeCustomizationSetting}
            globalSetting={globalSetting}
          />
        );

      case "modern":
        return (
          <FooterModern
            error={error}
            storeCustomizationSetting={storeCustomizationSetting}
            globalSetting={globalSetting}
          />
        );
      default:
        return (
          <>
            <div className="hidden relative lg:block mx-auto max-w-screen-2xl py-6 px-3 sm:px-10">
              <FeatureCard
                storeCustomizationSetting={storeCustomizationSetting}
              />
            </div>
            <div className="border-t border-border w-full">
              <Footer
                error={error}
                storeCustomizationSetting={storeCustomizationSetting}
                globalSetting={globalSetting}
              />
            </div>
          </>
        );
    }
  };

  return (
    <html
      lang={globalSetting?.default_language || "en"}
      className=""
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-background text-foreground antialiased"
      >
        <div>
          <SettingProvider
            initialGlobalSetting={globalSetting}
            initialStoreSetting={storeSetting}
            initialCustomizationSetting={storeCustomizationSetting}
          >
            <CurrencyProvider>
              <Providers storeSetting={storeSetting}>
                <ConditionalLayoutWrapper>
                  {renderNavbar()}
                </ConditionalLayoutWrapper>
                <main className="bg-background z-10">{children}</main>
                <ConditionalLayoutWrapper>
                  <div className="w-full">{renderFooter()}</div>
                </ConditionalLayoutWrapper>
                <WhatsappChatWidget />
              </Providers>
            </CurrencyProvider>
          </SettingProvider>
        </div>
      </body>
    </html>
  );
}
