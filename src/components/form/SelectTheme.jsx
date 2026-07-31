"use client";

import React, { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import Cookies from "js-cookie";
import {
  isLocalStorePreview,
  STORE_THEME_COOKIE,
} from "@utils/localStorePreview";
import { resolveActiveTheme } from "@utils/resolveActiveTheme";

/**
 * SelectTheme — Hover dropdown for switching the active store theme.
 * Local/dev only. Production always uses the API default theme.
 */
const SelectTheme = ({
  themes,
  defaultTheme,
  onThemeChange,
  size = "text-sm",
}) => {
  const [activeTheme, setActiveTheme] = useState(defaultTheme || null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveTheme(resolveActiveTheme(themes, defaultTheme));
  }, [themes, defaultTheme]);

  const handleSelect = (theme) => {
    if (!isLocalStorePreview) return;
    setActiveTheme(theme);
    Cookies.set(STORE_THEME_COOKIE, theme._id, { expires: 365, path: "/" });
    onThemeChange?.(theme);
  };

  // Only show in development mode
  if (!isLocalStorePreview) return null;
  if (!themes?.length) return null;
  if (!mounted) return null;

  return (
    <div className="relative group">
      {/* Trigger */}
      <button className={`flex items-center justify-center ${size}`}>
        <span className="font-medium hover:text-primary flex gap-1 items-center">
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-20">
            {activeTheme?.name || "Theme"}
          </span>
          <svg
            className="ml-0.5 h-3 w-3 group-hover:rotate-180 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Hover dropdown panel */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute right-0 top-full pt-2 z-50 transition-all duration-200 ease-in-out">
        <div className="w-48 origin-top-right rounded-lg bg-card py-2 shadow-xl ring-1 ring-border">
          {themes.map((theme) => (
            <div key={theme._id} className="px-4 py-1.5 hover:bg-accent">
              <button
                onClick={() => handleSelect(theme)}
                className="flex w-full items-center gap-3 px-2 py-0.5 text-sm leading-6 text-foreground hover:text-primary"
              >
                {/* Color preview swatch */}
                <span
                  className="inline-block w-4 h-4 rounded-full border border-border shrink-0"
                  style={{
                    background: theme.colors?.primary?.hsl
                      ? `hsl(${theme.colors.primary.hsl})`
                      : theme.colors?.primary || "#10b981",
                  }}
                />
                <span className="truncate">{theme.name}</span>
                {activeTheme?._id === theme._id && (
                  <span className="ml-auto text-emerald-600 dark:text-emerald-400 text-xs">
                    ✓
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectTheme;
