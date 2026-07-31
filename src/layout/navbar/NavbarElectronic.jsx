import Link from "next/link";
import Image from "next/image";

//internal imports
import NavbarPromoElectronic from "@layout/navbar/NavbarPromoElectronic";
import TopNavbar from "@layout/navbar/TopNavbar";
import SearchInput from "@components/navbar/SearchInput";
import NavbarIconsElectronic from "@components/navbar/NavbarIconsElectronic";
import { getShowingCategory } from "@services/CategoryService";
import MobileFooter from "@layout/footer/MobileFooter";

const NavbarElectronic = async ({
  globalSetting,
  storeCustomization,
  storeLayout: layoutProp,
}) => {
  const [{ categories, error: categoryError }] = await Promise.all([
    getShowingCategory(),
  ]);

  return (
    <div className="sticky z-40 top-0 w-full">
      {/* Top bar with language/theme/layout selectors */}
      <TopNavbar storeCustomization={storeCustomization} />

      {/* Main Navbar — Temu style */}
      <header className="bg-primary">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10">
          <div className="flex lg:h-16 h-14 items-center gap-3">
            {/* Logo */}
            <Link
              href="/"
              className="mr-3 lg:mr-12 xl:mr-12 shrink-0 hidden md:block lg:block"
            >
              <Image
                width={160}
                height={50}
                className="h-10 w-auto max-w-[160px] object-contain"
                priority
                src={storeCustomization?.navbar?.logo || "/logo/logo-light.svg"}
                alt="logo"
              />
            </Link>

            {/* Left Nav Links + Categories */}
            <NavbarPromoElectronic
              categories={categories}
              categoryError={categoryError}
            />

            {/* Search — grows to fill space */}
            <div className="flex flex-col mx-auto w-80">
              <SearchInput variant="electronic" />
            </div>

            {/* Right Icons */}
            <NavbarIconsElectronic />
          </div>
        </div>
      </header>

      <MobileFooter
        categories={categories}
        categoryError={categoryError}
        globalSetting={globalSetting}
      />
    </div>
  );
};

export default NavbarElectronic;
