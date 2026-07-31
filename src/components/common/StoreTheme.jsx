"use client";

import { useLayoutEffect } from "react";

/**
 * StoreTheme — Receives the active theme data and injects CSS custom
 * properties into :root so every Tailwind utility picks up the admin's
 * chosen colors, typography, and border-radius dynamically.
 *
 * ── Tailwind v4 notes ──────────────────────────────────────────────
 * • Colors must be full values: hsl(160 84% 39%) — NOT raw components.
 * • `rounded-lg` → `var(--radius)`, `rounded-md` → `calc(var(--radius) - 2px)`.
 * • `font-sans` → `var(--font-sans)` — so we must override `--font-sans`.
 * • `--default-font-family` is Tailwind v4's cascade default.
 */

const colorVarMap = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
};

const sidebarVarMap = {
  bgColor: "--sidebar",
  textColor: "--sidebar-foreground",
  activeColor: "--sidebar-primary",
};

const resolveHsl = (token) => {
  if (!token) return null;
  if (typeof token === "string") return token;
  return token.hsl || null;
};

/**
 * Wrap raw HSL components in hsl() for Tailwind v4.
 * DB: "160.1 84.1% 39.4%" → "hsl(160.1 84.1% 39.4%)"
 * Already-wrapped (hsl, oklch, rgb, #) values pass through.
 */
const wrapHsl = (value) => {
  if (!value) return null;
  if (/^(hsl|oklch|rgb|#)/i.test(value.trim())) return value;
  return `hsl(${value})`;
};

const loadGoogleFont = (fontFamily) => {
  if (!fontFamily) return;
  const primaryFont = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
  const systemFonts = [
    "system-ui",
    "sans-serif",
    "serif",
    "monospace",
    "Inter",
    "Arial",
    "Helvetica",
  ];
  if (systemFonts.some((f) => f.toLowerCase() === primaryFont.toLowerCase()))
    return;

  const linkId = "store-theme-font";
  const existing = document.getElementById(linkId);
  const encodedFont = primaryFont.replace(/\s+/g, "+");
  const href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@300;400;500;600;700;800&display=swap`;

  if (existing && existing.getAttribute("href") === href) return;
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
};

export default function StoreTheme({ theme }) {
  useLayoutEffect(() => {
    if (!theme || !theme._id) return;

    // ── 1. Build light-mode :root CSS vars ──────────────────────────
    const lightVars = [];

    // 1a. Color tokens
    if (theme.colors) {
      Object.entries(colorVarMap).forEach(([key, varName]) => {
        const hsl = resolveHsl(theme.colors[key]);
        const color = wrapHsl(hsl);
        if (color) lightVars.push(`  ${varName}: ${color};`);
      });
    }

    // 1b. Sidebar variables
    if (theme.sidebar) {
      Object.entries(sidebarVarMap).forEach(([key, varName]) => {
        const hsl = resolveHsl(theme.sidebar[key]);
        const color = wrapHsl(hsl);
        if (color) lightVars.push(`  ${varName}: ${color};`);
      });
      const activeHsl = resolveHsl(theme.sidebar.activeColor);
      lightVars.push(`  --sidebar-primary-foreground: hsl(0 0% 100%);`);
      lightVars.push(`  --sidebar-accent: hsl(220 14.3% 95.9%);`);
      lightVars.push(`  --sidebar-accent-foreground: hsl(220.9 39.3% 11%);`);
      lightVars.push(`  --sidebar-border: hsl(220 13% 91%);`);
      lightVars.push(
        `  --sidebar-ring: ${wrapHsl(activeHsl) || "hsl(160.1 84.1% 39.4%)"};`,
      );
    }

    // 1c. Border radius — drives rounded-lg, rounded-md, rounded-sm, etc.
    if (theme.sizing) {
      if (theme.sizing.radius) {
        lightVars.push(`  --radius: ${theme.sizing.radius};`);
      }
      if (theme.sizing.radiusSm) {
        lightVars.push(`  --radius-sm: ${theme.sizing.radiusSm};`);
      }
      if (theme.sizing.radiusMd) {
        lightVars.push(`  --radius-md: ${theme.sizing.radiusMd};`);
      }
      if (theme.sizing.radiusLg) {
        lightVars.push(`  --radius-lg: ${theme.sizing.radiusLg};`);
      }
      if (theme.sizing.radiusXl) {
        lightVars.push(`  --radius-xl: ${theme.sizing.radiusXl};`);
      }
    }

    // 1d. Typography — drives font-family across ALL elements
    if (theme.typography) {
      const ff = theme.typography.fontFamily;
      if (ff) {
        // --font-family: consumed by body { font-family: var(--font-family) }
        lightVars.push(`  --font-family: ${ff};`);
        // --font-sans: consumed by Tailwind v4's font-sans utility class
        lightVars.push(`  --font-sans: ${ff};`);
        // --default-font-family: Tailwind v4's internal cascade var
        lightVars.push(`  --default-font-family: ${ff};`);
      }
      if (theme.typography.fontSizeBase) {
        lightVars.push(`  --font-size-base: ${theme.typography.fontSizeBase};`);
      }
      if (theme.typography.fontSizeSm) {
        lightVars.push(`  --font-size-sm: ${theme.typography.fontSizeSm};`);
      }
      if (theme.typography.fontSizeLg) {
        lightVars.push(`  --font-size-lg: ${theme.typography.fontSizeLg};`);
      }
      if (theme.typography.fontSizeXl) {
        lightVars.push(`  --font-size-xl: ${theme.typography.fontSizeXl};`);
      }
      if (theme.typography.lineHeight) {
        lightVars.push(`  --line-height: ${theme.typography.lineHeight};`);
      }
    }

    // 1e. Borders
    if (theme.borders?.borderWidth) {
      lightVars.push(`  --border-width: ${theme.borders.borderWidth};`);
    }

    // ── Inject light-mode <style> ───────────────────────────────────
    let lightStyleEl = document.getElementById("store-dynamic-theme");
    if (!lightStyleEl) {
      lightStyleEl = document.createElement("style");
      lightStyleEl.id = "store-dynamic-theme";
      document.head.appendChild(lightStyleEl);
    }
    lightStyleEl.textContent = `:root {\n${lightVars.join("\n")}\n}`;

    // Load Google Font
    if (theme.typography?.fontFamily) {
      loadGoogleFont(theme.typography.fontFamily);
    }

    // ── 2. Build dark-mode .dark CSS vars ───────────────────────────
    const darkVars = [];

    if (theme.darkColors) {
      Object.entries(colorVarMap).forEach(([key, varName]) => {
        const hsl = resolveHsl(theme.darkColors[key]);
        const color = wrapHsl(hsl);
        if (color) darkVars.push(`  ${varName}: ${color};`);
      });
    }

    // Dark sidebar — smooth market-nest style
    const darkPrimary =
      wrapHsl(resolveHsl(theme.darkColors?.primary)) ||
      wrapHsl(resolveHsl(theme.colors?.primary)) ||
      "hsl(160.1 84.1% 39.4%)";
    const darkRing =
      wrapHsl(resolveHsl(theme.darkColors?.ring)) ||
      wrapHsl(resolveHsl(theme.colors?.ring)) ||
      "hsl(160.1 84.1% 39.4%)";
    darkVars.push(`  --sidebar: hsl(229 84.6% 5.1%);`);
    darkVars.push(`  --sidebar-foreground: hsl(210 40% 98%);`);
    darkVars.push(`  --sidebar-primary: ${darkPrimary};`);
    darkVars.push(`  --sidebar-primary-foreground: hsl(0 0% 100%);`);
    darkVars.push(`  --sidebar-accent: hsl(217.5 35.6% 17.6%);`);
    darkVars.push(`  --sidebar-accent-foreground: hsl(210 40% 98%);`);
    darkVars.push(`  --sidebar-border: hsl(228 27% 14.5%);`);
    darkVars.push(`  --sidebar-ring: ${darkRing};`);

    let darkStyleEl = document.getElementById("store-dynamic-theme-dark");
    if (!darkStyleEl) {
      darkStyleEl = document.createElement("style");
      darkStyleEl.id = "store-dynamic-theme-dark";
      document.head.appendChild(darkStyleEl);
    }
    darkStyleEl.textContent = `.dark {\n${darkVars.join("\n")}\n}`;

    // ── Cleanup ─────────────────────────────────────────────────────
    return () => {
      const el = document.getElementById("store-dynamic-theme");
      if (el) el.remove();
      const darkEl = document.getElementById("store-dynamic-theme-dark");
      if (darkEl) darkEl.remove();
    };
  }, [theme]);

  return null;
}
