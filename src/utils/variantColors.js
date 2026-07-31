// A handful of common color-name -> CSS color fallbacks for attribute
// values that have no hex_color set on the backend.
export const NAMED_COLORS = {
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#eab308",
  black: "#111827",
  white: "#f9fafb",
  grey: "#6b7280",
  gray: "#6b7280",
  orange: "#ea580c",
  purple: "#9333ea",
  pink: "#ec4899",
  brown: "#78350f",
  navy: "#1e3a8a",
  gold: "#ca8a04",
  silver: "#9ca3af",
  beige: "#d6cbb3",
  maroon: "#7f1d1d",
  cream: "#fefce8",
};

export const resolveSwatchColor = (attrName, value) => {
  if (!/colou?r/i.test(attrName || "")) return null;
  if (value?.hexColor) return value.hexColor;
  return NAMED_COLORS[String(value?.value || "").toLowerCase().trim()] || null;
};
