"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

//internal import
import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  BellIcon,
  UserCircleIcon,
  KeyIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  BanknotesIcon,
  GiftIcon,
  CreditCardIcon,
  LifebuoyIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { Gavel as GavelIcon } from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useSetting } from "@context/SettingContext";
import { getUserSession } from "@lib/auth-client";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { storeCustomization } = useSetting();

  const userInfo = getUserSession();

  const dashboard = storeCustomization?.dashboard;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showingTranslateValue } = useUtilsFunction();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // silently fail
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogOut = () => {
    signOut();
    Cookies.remove("couponInfo");
    router.push("/");
  };

  const logoutLabel =
    showingTranslateValue(storeCustomization?.navbar?.logout) || "Logout";

  // Grouped so the list reads as sections instead of one long flat column.
  const sidebarGroups = [
    {
      label: null,
      items: [
        {
          title: showingTranslateValue(dashboard?.dashboard_title) || "Dashboard",
          href: "/user/dashboard",
          icon: Squares2X2Icon,
        },
      ],
    },
    {
      label: "Orders",
      items: [
        {
          title: showingTranslateValue(dashboard?.my_order) || "My Orders",
          href: "/user/my-orders",
          icon: ClipboardDocumentListIcon,
        },
        { title: "Laybys", href: "/user/laybys", icon: ClipboardDocumentListIcon },
        { title: "My Auctions", href: "/user/auctions", icon: GavelIcon },
        { title: "Refunds", href: "/user/refunds", icon: ArrowUturnLeftIcon },
      ],
    },
    {
      label: "Rewards",
      items: [
        { title: "Wallet", href: "/user/wallet", icon: BanknotesIcon },
        { title: "Points", href: "/user/points", icon: CreditCardIcon },
        { title: "Gift Cards", href: "/user/gift-cards", icon: GiftIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Addresses", href: "/user/shipping-address", icon: MapPinIcon },
        { title: "My Account", href: "/user/my-account", icon: UserCircleIcon },
        {
          title: showingTranslateValue(dashboard?.update_profile) || "Update Profile",
          href: "/user/update-profile",
          icon: UserCircleIcon,
        },
        {
          title: showingTranslateValue(dashboard?.change_password) || "Change Password",
          href: "/user/change-password",
          icon: KeyIcon,
        },
      ],
    },
    {
      label: "Support",
      items: [
        {
          title: "Notifications",
          href: "/user/notifications",
          icon: BellIcon,
          badge: unreadCount > 0 ? unreadCount : null,
        },
        { title: "Support Tickets", href: "/user/tickets", icon: LifebuoyIcon },
      ],
    },
  ];

  const flatItems = sidebarGroups.flatMap((g) => g.items);

  return (
    <div>
      {/* Mobile Dropdown */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center cursor-pointer justify-between w-full p-3 bg-gradient-to-r from-primary to-[#7a0d0d] rounded-xl border border-primary/40 transition-all"
        >
          <div className="flex flex-row items-center">
            <div className="relative w-10 h-10">
              <div className="relative rounded-full w-10 h-10 border-2 border-white/30 flex items-center justify-center bg-white/10 overflow-hidden">
                {userInfo?.image &&
                (userInfo.image.startsWith("http://") ||
                  userInfo.image.startsWith("https://")) ? (
                  <Image
                    src={userInfo.image}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full bg-white/10"
                    alt={userInfo?.name?.[0] || "U"}
                  />
                ) : (
                  <div className="flex items-center text-xl font-semibold justify-center text-white">
                    {userInfo?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-3">
              <h5 className="text-left text-md font-semibold leading-none text-white line-h">
                {userInfo?.name}
              </h5>
              <p className="text-sm text-white/70">{userInfo?.email}</p>
            </div>
          </div>
          {isDropdownOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-white/80" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-white/80" />
          )}
        </button>

        {isDropdownOpen && (
          <div className="mt-1 bg-gradient-to-b from-primary to-[#5c0a0a] rounded-xl border border-primary/40 overflow-hidden">
            {flatItems?.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/10 border-b border-white/10 text-sm font-medium text-white/85 cursor-pointer"
                onClick={() => setIsDropdownOpen(false)}
              >
                <span className="flex items-center">
                  <item.icon className="h-4 w-4 mr-3 text-white/70 shrink-0" />
                  {item.title}
                </span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-bold leading-none text-primary bg-white rounded-full">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogOut();
                setIsDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 hover:bg-white/10 text-sm font-semibold cursor-pointer text-white"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-3 text-white shrink-0" />
              {logoutLabel}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="flex flex-col lg:flex-row w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block shrink-0 w-full">
          <div className="rounded-2xl sticky top-4 bg-gradient-to-b from-primary via-[#a30d0d] to-[#5c0a0a] border border-primary/40 p-5 flex flex-col max-h-[calc(100vh-2rem)]">
            {/* Avatar Section */}
            <div className="flex flex-row items-center mb-4 pb-5 border-b border-white/15 shrink-0">
              <div className="relative w-16 h-16">
                <div className="relative w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 overflow-hidden">
                  {userInfo?.image &&
                  (userInfo.image.startsWith("http://") ||
                    userInfo.image.startsWith("https://")) ? (
                    <img
                      src={userInfo.image}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full bg-white/10"
                      alt={userInfo?.name?.[0] || "U"}
                    />
                  ) : (
                    <div className="flex items-center text-xl font-semibold justify-center text-white">
                      {userInfo?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#a30d0d]"></div>
              </div>
              <div className="ml-3 min-w-0">
                <h5 className="text-lg text-left font-semibold leading-none text-white line-h truncate">
                  {userInfo?.name}
                </h5>
                <p className="text-sm text-white/70 truncate">{userInfo?.email}</p>
              </div>
            </div>

            {/* Menu Items — scrollable if it ever grows past the viewport */}
            <div className="overflow-y-auto pr-1 -mr-1">
              {sidebarGroups.map((group, gIdx) => (
                <div key={gIdx} className={gIdx > 0 ? "mt-3" : ""}>
                  {group.label && (
                    <p className="px-4 mb-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        href={item.href}
                        key={item.title}
                        className={`flex items-center justify-between rounded-lg py-2.5 px-4 text-sm font-medium w-full mb-1 transition-colors ${
                          isActive
                            ? "bg-white text-primary shadow-sm"
                            : "text-white/85 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center min-w-0">
                          <item.icon
                            className={`shrink-0 h-4 w-4 mr-3 ${
                              isActive ? "text-primary" : "text-white/70"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.title}</span>
                        </span>
                        {item.badge && (
                          <span
                            className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-bold leading-none rounded-full ${
                              isActive
                                ? "bg-primary text-white"
                                : "bg-white text-primary"
                            }`}
                          >
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Logout Button */}
            <span className="p-3 px-4 flex items-center rounded-lg hover:bg-white/10 w-full mt-3 pt-4 border-t border-white/15 cursor-pointer group shrink-0">
              <ArrowRightStartOnRectangleIcon className="shrink-0 h-4 w-4 text-white/80 group-hover:text-white" />
              <button
                onClick={handleLogOut}
                className="inline-flex items-center justify-between ml-3 text-sm font-semibold w-full text-left cursor-pointer transition-colors text-white/90 group-hover:text-white"
              >
                {logoutLabel}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
