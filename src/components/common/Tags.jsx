import React from "react";

const Tags = ({ product }) => {
  // Handle all possible tag formats from the database:
  // 1. tag: '["tag1","tag2"]'              — JSON string
  // 2. tag: ["tag1", "tag2"]               — plain array
  // 3. tag: ['["tag1","tag2"]']            — array with a single JSON string inside (common DB format)
  // 4. tag: ["[]"]                         — array with empty brackets string
  let tags = [];
  try {
    const raw = product?.tag;
    if (Array.isArray(raw)) {
      if (raw.length === 1 && typeof raw[0] === "string") {
        // Case 3 & 4: array with a single string — try to parse it
        try {
          const parsed = JSON.parse(raw[0]);
          tags = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // If parsing fails, treat as a plain string tag
          tags = raw[0] && raw[0] !== "[]" ? [raw[0]] : [];
        }
      } else {
        // Case 2: plain array of tag strings
        tags = raw;
      }
    } else if (typeof raw === "string" && raw.trim()) {
      // Case 1: JSON string
      try {
        const parsed = JSON.parse(raw);
        tags = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Plain string tag
        tags = [raw];
      }
    }
    // Filter out empty/invalid values and sanitize
    tags = (tags || [])
      .filter((t) => t && typeof t === "string" && t !== "[]" && t.trim())
      .map((t) => t.trim());
  } catch (e) {
    tags = [];
  }

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap">
      {tags.map((t, i) => (
        <span
          key={i + 1}
          className="bg-muted px-2 py-1 mr-2 border-0 text-muted-foreground rounded inline-flex items-center justify-center text-xs mt-2"
        >
          {t}
        </span>
      ))}
    </div>
  );
};

export default Tags;
