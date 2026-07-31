"use client";

import { useEffect, useState } from "react";

/**
 * Rotates through admin-managed promo strings (theme-options ->
 * header.top_bar_content) — same spot/purpose as the legacy frontend's
 * TopbarSlider, simplified to a fade rotation.
 */
const TopBarContentRotator = ({ items }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <span
      className="truncate"
      // Admin-authored HTML (e.g. "<strong>Welcome!</strong> ...") — same
      // trust boundary as the rest of the admin-managed site content.
      dangerouslySetInnerHTML={{ __html: items[index] }}
    />
  );
};

export default TopBarContentRotator;
