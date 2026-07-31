"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  getLoggedInShoppingDestination,
  isSignupOfferRoute,
} from "@utils/promoLinks";

/**
 * Renders the original href for SSR/hydration, then redirects logged-in users
 * away from signup/offer routes on click.
 */
const AuthAwareLink = ({
  href,
  children,
  className,
  style,
  onClick,
  ...props
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const targetHref = href || "/shop";

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (isLoggedIn && isSignupOfferRoute(targetHref)) {
      event.preventDefault();
      router.push(getLoggedInShoppingDestination(targetHref));
    }
  };

  return (
    <Link
      href={targetHref}
      onClick={handleClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Link>
  );
};

export default AuthAwareLink;
