"use client";

import { useState, useEffect } from "react";
import SelectTheme from "@components/form/SelectTheme";
import StoreTheme from "@components/common/StoreTheme";
import { resolveActiveTheme } from "@utils/resolveActiveTheme";

/**
 * TopNavbarTheme — Client component that holds the active theme state
 * for the Electronic (and any other) layout that uses TopNavbar.
 *
 * Renders:
 *   • StoreTheme  — injects CSS vars into :root whenever the theme changes
 *   • SelectTheme — dropdown for switching themes
 */
const TopNavbarTheme = ({ themes, defaultTheme, size }) => {
  const [activeTheme, setActiveTheme] = useState(defaultTheme || null);

  useEffect(() => {
    setActiveTheme(resolveActiveTheme(themes, defaultTheme));
  }, [themes, defaultTheme]);

  return (
    <>
      {/* Inject CSS custom properties into :root */}
      <StoreTheme theme={activeTheme} />

      {/* Theme switcher dropdown */}
      <SelectTheme
        themes={themes}
        defaultTheme={defaultTheme}
        onThemeChange={(theme) => setActiveTheme(theme)}
        size={size}
      />
    </>
  );
};

export default TopNavbarTheme;
