"use client";

import { useContext } from "react";
import Link from "next/link";

import MegaMenuCategory from "@components/mega-menu/MegaMenuCategory";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { useSetting } from "@context/SettingContext";
import { getEnabledPrimaryNavItems } from "@utils/navbarMenus";

const linkClassName =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/15 transition-colors whitespace-nowrap";

const NavbarPromoElectronic = ({ categories, categoryError }) => {
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { storeCustomization } = useSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const navbar = storeCustomization?.navbar;
  const navItems = getEnabledPrimaryNavItems(navbar, showingTranslateValue);

  return (
    <div className="hidden lg:flex items-center gap-0.5 h-full">
      {navbar?.categories_menu_status !== false && (
        <MegaMenuCategory
          categories={categories}
          categoryError={categoryError}
          storeLayout="electronic"
        />
      )}

      {navItems.map((item) => {
        const Icon = item.Icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setIsLoading(!isLoading)}
            className={linkClassName}
          >
            <Icon
              className={`h-3.5 w-3.5 ${item.iconClass || ""} ${
                item.accent ? "text-orange-300" : ""
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarPromoElectronic;
