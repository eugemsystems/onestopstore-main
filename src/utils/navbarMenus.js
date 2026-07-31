import {
  FiAlertCircle,
  FiFileText,
  FiGift,
  FiHelpCircle,
  FiPackage,
  FiPhoneIncoming,
  FiPocket,
  FiShoppingBag,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import {
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";

const isMenuEnabled = (navbar, statusKey) =>
  navbar?.[statusKey] !== false;

export const PRIMARY_NAV_CONFIG = [
  {
    key: "shop",
    statusKey: "shop_menu_status",
    labelKey: "shop",
    defaultLabel: "Shop",
    href: "/shop",
    Icon: ShoppingBagIcon,
  },
  {
    key: "best_selling",
    statusKey: "best_selling_menu_status",
    labelKey: "best_selling",
    defaultLabel: "Best-Selling",
    href: "/search?sort=best-selling",
    Icon: TrendingUpIcon,
  },
  {
    key: "five_star",
    statusKey: "five_star_menu_status",
    labelKey: "five_star_rated",
    defaultLabel: "5-Star Rated",
    href: "/search?rating=5",
    Icon: StarIcon,
    iconClass: "fill-current",
  },
  {
    key: "offers",
    statusKey: "offers_menu_status",
    labelKey: "offers",
    defaultLabel: "Offers",
    href: "/offers",
    Icon: TagIcon,
  },
  {
    key: "flash_sale",
    statusKey: "flash_sale_menu_status",
    labelKey: "flash_sale",
    defaultLabel: "Flash Sale",
    href: "/flash-sale",
    Icon: ZapIcon,
    accent: true,
  },
];

const DRAWER_PAGES_CONFIG = [
  {
    key: "offers",
    statusKey: "offers_menu_status",
    labelKey: "offers",
    defaultLabel: "Offers",
    href: "/offers",
    icon: FiGift,
  },
  {
    key: "flash_sale",
    statusKey: "flash_sale_menu_status",
    labelKey: "flash_sale",
    defaultLabel: "Flash Sale",
    href: "/flash-sale",
    icon: FiZap,
  },
  {
    key: "shop",
    statusKey: "shop_menu_status",
    labelKey: "shop",
    defaultLabel: "Shop",
    href: "/shop",
    icon: FiShoppingBag,
  },
  {
    key: "best_selling",
    statusKey: "best_selling_menu_status",
    labelKey: "best_selling",
    defaultLabel: "Best-Selling",
    href: "/search?sort=best-selling",
    icon: FiShoppingBag,
  },
  {
    key: "five_star",
    statusKey: "five_star_menu_status",
    labelKey: "five_star_rated",
    defaultLabel: "5-Star Rated",
    href: "/search?rating=5",
    icon: FiShoppingBag,
  },
  {
    key: "track_order",
    statusKey: null,
    labelKey: null,
    defaultLabel: "Track Order",
    href: "/track",
    icon: FiPackage,
  },
  {
    key: "checkout",
    statusKey: null,
    labelKey: "checkout",
    defaultLabel: "Checkout",
    href: "/checkout",
    icon: FiShoppingBag,
  },
  {
    key: "faq",
    statusKey: "faq_status",
    labelKey: "faq",
    defaultLabel: "FAQ",
    href: "/faq",
    icon: FiHelpCircle,
  },
  {
    key: "about_us",
    statusKey: "about_menu_status",
    labelKey: "about_us",
    defaultLabel: "About Us",
    href: "/about-us",
    icon: FiUsers,
  },
  {
    key: "contact_us",
    statusKey: "contact_menu_status",
    labelKey: "contact_us",
    defaultLabel: "Contact Us",
    href: "/contact-us",
    icon: FiPhoneIncoming,
  },
  {
    key: "privacy_policy",
    statusKey: "privacy_policy_status",
    labelKey: "privacy_policy",
    defaultLabel: "Privacy Policy",
    href: "/privacy-policy",
    icon: FiPocket,
  },
  {
    key: "terms",
    statusKey: "term_and_condition_status",
    labelKey: "term_and_condition",
    defaultLabel: "Terms and Conditions",
    href: "/terms-and-conditions",
    icon: FiFileText,
  },
  {
    key: "not_found",
    statusKey: null,
    labelKey: null,
    defaultLabel: "Not Found",
    href: "/404",
    icon: FiAlertCircle,
  },
];

const getMenuLabel = (navbar, labelKey, defaultLabel, showingTranslateValue) => {
  if (!labelKey) return defaultLabel;
  const translated = showingTranslateValue?.(navbar?.[labelKey]);
  return translated || defaultLabel;
};

export const getEnabledPrimaryNavItems = (navbar, showingTranslateValue) =>
  PRIMARY_NAV_CONFIG.filter((item) => isMenuEnabled(navbar, item.statusKey)).map(
    (item) => ({
      ...item,
      label: getMenuLabel(
        navbar,
        item.labelKey,
        item.defaultLabel,
        showingTranslateValue,
      ),
    }),
  );

export const getEnabledDrawerPages = (navbar, showingTranslateValue) =>
  DRAWER_PAGES_CONFIG.filter(
    (item) => !item.statusKey || isMenuEnabled(navbar, item.statusKey),
  ).map((item) => ({
    title: getMenuLabel(
      navbar,
      item.labelKey,
      item.defaultLabel,
      showingTranslateValue,
    ),
    href: item.href,
    icon: item.icon,
  }));
