"use client";

import React, { useState, useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import {
  isLocalStorePreview,
  STORE_LAYOUT_COOKIE,
} from "@utils/localStorePreview";

const layouts = [
  { value: "default", label: "Grocery", icon: "🛒" },
  { value: "modern", label: "Modern", icon: "✨" },
  { value: "minimal", label: "Minimal", icon: "🎯" },
  { value: "clothing", label: "Fashion", icon: "👗" },
  { value: "electronic", label: "Electronics", icon: "💻" },
];

/**
 * SelectLayout — Hover dropdown for switching the store layout.
 * Local/dev only. Production always uses admin globalSetting.store_layout.
 */
const SelectLayout = ({ currentLayout = "default", size = "text-sm" }) => {
  const [activeLayout, setActiveLayout] = useState(currentLayout);

  useEffect(() => {
    if (!isLocalStorePreview) {
      Cookies.remove(STORE_LAYOUT_COOKIE, { path: "/" });
      return;
    }

    const cookieVal = Cookies.get(STORE_LAYOUT_COOKIE);
    if (cookieVal && cookieVal !== activeLayout) {
      setActiveLayout(cookieVal);
    }
  }, []);

  const handleSelect = (layout) => {
    if (!isLocalStorePreview) return;
    setActiveLayout(layout);
    Cookies.set(STORE_LAYOUT_COOKIE, layout, { expires: 365, path: "/" });
    window.location.reload();
  };

  const currentLabel =
    layouts.find((l) => l.value === activeLayout)?.label || "Layout";

  // Only show in development mode
  if (!isLocalStorePreview) return null;

  return (
    <div className="relative group">
      {/* Trigger */}
      <button className={`flex items-center justify-center ${size}`}>
        <span className="font-medium hover:text-primary flex gap-1 items-center">
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-20">{currentLabel}</span>
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
          {layouts.map((layout) => (
            <div key={layout.value} className="px-4 py-1.5 hover:bg-accent">
              <button
                onClick={() => handleSelect(layout.value)}
                className="flex w-full items-center gap-3 px-2 py-0.5 text-sm leading-6 text-foreground hover:text-primary"
              >
                <span className="text-base">{layout.icon}</span>
                <span className="truncate">{layout.label}</span>
                {activeLayout === layout.value && (
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

export default dynamic(() => Promise.resolve(SelectLayout), { ssr: false });
