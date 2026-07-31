"use client";

import { useEffect, useState } from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

/**
 * Floating theme toggle for testing dark/light mode in the store.
 * By default, the theme comes from global settings.
 * This toggle is for development/testing only.
 */
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark class is already on <html>
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("store-theme-mode", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("store-theme-mode", "dark");
    }
    setIsDark(!isDark);
  };

  // Restore saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("store-theme-mode");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-white shadow-lg transition-all hover:bg-foreground/80 dark:bg-background dark:text-foreground dark:hover:bg-muted"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <IoSunnyOutline className="h-5 w-5" />
      ) : (
        <IoMoonOutline className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
