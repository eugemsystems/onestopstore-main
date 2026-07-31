"use client";

import { usePathname } from "next/navigation";

/**
 * Conditionally renders layout elements like Navbar and Footer.
 * If the current route starts with '/auth', it hides them.
 */
const ConditionalLayoutWrapper = ({ children, isAuthPageHidden = true }) => {
  const pathname = usePathname();
  
  // Check if we're on an auth page (login, signup, forget-password, etc.)
  const isAuthPage = pathname?.startsWith("/auth");

  // If we should hide on auth pages and we are on one, don't render children
  if (isAuthPageHidden && isAuthPage) {
    return null;
  }

  return <>{children}</>;
};

export default ConditionalLayoutWrapper;
