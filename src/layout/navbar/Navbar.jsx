import Link from "next/link";

//internal imports
import TopNavbar from "./TopNavbar";
import NavbarPromo from "@layout/navbar/NavbarPromo";
import SearchInput from "@components/navbar/SearchInput";
import NotifyIcon from "@components/navbar/NotifyIcon";
import ProfileDropDown from "@components/navbar/ProfileDropDown";
import { getShowingLanguage } from "@services/SettingServices";
import { getShowingCategory } from "@services/CategoryService";
import { getShowingThemes, getDefaultTheme } from "@services/ThemeServices";
import MobileFooter from "@layout/footer/MobileFooter";
import Image from "next/image";

const Navbar = async ({
  globalSetting,
  storeCustomization,
  storeLayout: layoutProp,
}) => {
  const [
    { languages },
    { categories, error: categoryError },
    { themes },
    { theme: defaultTheme },
  ] = await Promise.all([
    getShowingLanguage(),
    getShowingCategory(),
    getShowingThemes(),
    getDefaultTheme(),
  ]);

  const currency = globalSetting?.default_currency || "$";
  const storeLayout = layoutProp || globalSetting?.store_layout || "default";

  return (
    // Navbar.jsx
    <div className="sticky z-40 top-0 w-full">
      {/* navbar top section */}

      <TopNavbar storeCustomization={storeCustomization} />

      <header
        as="header"
        className="bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_20%,var(--primary)_70%,#7a0d0d_100%)] shadow"
      >
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10">
          <div className="relative flex lg:h-16 h-14 justify-between">
            <div className="relative z-10 hidden sm:flex px-2 lg:px-0">
              <Link href="/" className="flex flex-shrink-0 items-center">
                <Image
                  width={160}
                  height={50}
                  className="h-10 w-auto max-w-[160px] object-contain"
                  priority
                  src={
                    storeCustomization?.navbar?.logo || "/logo/logo-light.svg"
                  }
                  alt="logo"
                />
              </Link>
            </div>

            {/* search input section */}
            <div className="min-w-0 flex-1 md:px-8 lg:px-10 xl:col-span-6">
              <div className="flex items-center px-6 lg:py-3 py-2 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                <div className="w-full">
                  <SearchInput />
                </div>
              </div>
            </div>

            {/* notification icons */}
            <div className="lg:relative lg:z-10 sm:flex sm:items-center hidden ml-auto">
              <NotifyIcon />

              {/* Profile dropdown */}
              <div className="relative ml-4 flex-shrink-0">
                <ProfileDropDown />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* navbar bottom */}
      <NavbarPromo
        languages={languages}
        categories={categories}
        categoryError={categoryError}
        themes={themes}
        defaultTheme={defaultTheme}
        storeLayout={storeLayout}
      />
      <MobileFooter
        categories={categories}
        categoryError={categoryError}
        globalSetting={globalSetting}
      />
    </div>
  );
};

export default Navbar;
