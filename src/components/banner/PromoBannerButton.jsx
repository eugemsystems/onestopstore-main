"use client";

import Link from "next/link";
import AuthAwareLink from "@components/common/AuthAwareLink";

const PromoBannerButton = ({ href, label }) => {
  const link = href || "/search";

  return (
    <AuthAwareLink
      href={link}
      className="text-sm font-medium px-6 py-2 bg-primary text-center rounded-full text-primary-foreground hover:bg-primary/90"
    >
      {label}
    </AuthAwareLink>
  );
};

export default PromoBannerButton;
