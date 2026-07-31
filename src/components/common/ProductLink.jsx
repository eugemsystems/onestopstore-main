"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";

const ProductLinkIndicator = () => {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-background/60 backdrop-blur-[1px]">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </span>
  );
};

/**
 * Product detail link with a pending spinner overlay while the slug page loads.
 */
const ProductLink = ({ href, className = "", children, ...props }) => {
  const hasPosition = /(?:^|\s)(?:absolute|relative|fixed|sticky)(?:\s|$)/.test(className);
  const combinedClassName = `${hasPosition ? "" : "relative"} ${className}`.trim();

  if (!href) {
    return (
      <span className={combinedClassName} {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={combinedClassName} {...props}>
      <ProductLinkIndicator />
      {children}
    </Link>
  );
};

export default ProductLink;
