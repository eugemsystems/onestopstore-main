"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  IoGridOutline,
  IoLayersOutline,
  IoEllipsisHorizontalOutline,
} from "react-icons/io5";
import { FiLayout, FiChevronUp } from "react-icons/fi";

const layouts = [
  {
    value: "default",
    icon: IoGridOutline,
    label: "Default",
    color: "text-blue-500",
  },
  {
    value: "modern",
    icon: IoLayersOutline,
    label: "Modern",
    color: "text-purple-500",
  },
  {
    value: "minimal",
    icon: IoEllipsisHorizontalOutline,
    label: "Minimal",
    color: "text-emerald-500",
  },
  {
    value: "clothing",
    icon: FiLayout,
    label: "Clothing",
    color: "text-pink-500",
  },
  {
    value: "electronic",
    icon: IoGridOutline,
    label: "Electronic",
    color: "text-cyan-500",
  },
];

const LayoutSwitcher = ({ currentLayout = "default" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLayout, setActiveLayout] = useState(currentLayout);
  const router = useRouter();
  const pathname = usePathname();

  // Only show on homepage
  if (pathname !== "/") return null;

  const handleLayoutChange = (layout) => {
    setActiveLayout(layout);
    setIsOpen(false);
    // Navigate with query param to switch layout on client side
    router.push(`/?layout=${layout}`);
    router.refresh();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Layout options - shown when open */}
      {isOpen && (
        <div className="bg-background border border-border rounded-2xl shadow-2xl p-2 mb-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 pt-1 pb-2">
            Switch Layout
          </p>
          {layouts.map((layout) => {
            const Icon = layout.icon;
            const isActive = activeLayout === layout.value;
            return (
              <button
                key={layout.value}
                onClick={() => handleLayoutChange(layout.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-primary" : layout.color}`}
                />
                <span>{layout.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        title="Switch homepage layout"
      >
        <FiLayout className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Layout</span>
        <FiChevronUp
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default LayoutSwitcher;
