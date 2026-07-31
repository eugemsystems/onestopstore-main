"use client";

import Image from "next/image";
import { FiCheck } from "react-icons/fi";
import { resolveSwatchColor } from "@utils/variantColors";

/**
 * One attribute's value picker (e.g. "Colour: Red / Yellow"). Renders a real
 * swatch image if the variation has one, a color chip if it's a recognized
 * colour, or a text chip otherwise — every product with variations always
 * shows *something* to pick, matching the legacy ProductAttribute.jsx.
 */
const VariantList = ({ attribute, selectedValues, onSelect }) => {
  const selectedId = selectedValues?.[attribute.id];

  return (
    <div className="w-full flex flex-wrap gap-2.5">
      {attribute.values.map((value) => {
        const isActive = selectedId === value.id;
        const swatchColor = resolveSwatchColor(attribute.name, value);

        if (value.image) {
          return (
            <button
              key={value.id}
              type="button"
              title={value.value}
              onClick={() => onSelect(attribute.id, value.id)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                isActive
                  ? "border-primary shadow-md scale-105"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Image src={value.image} alt={value.value} fill sizes="56px" className="object-cover" />
              {isActive && (
                <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FiCheck size={10} />
                </span>
              )}
            </button>
          );
        }

        if (swatchColor) {
          return (
            <button
              key={value.id}
              type="button"
              title={value.value}
              onClick={() => onSelect(attribute.id, value.id)}
              className={`relative h-10 w-10 shrink-0 rounded-full border-2 transition-all flex items-center justify-center ${
                isActive ? "border-primary scale-110 shadow-md" : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: swatchColor }}
            >
              {isActive && (
                <FiCheck
                  size={16}
                  className={
                    swatchColor === "#f9fafb" || swatchColor === "#fefce8"
                      ? "text-foreground"
                      : "text-white"
                  }
                />
              )}
            </button>
          );
        }

        return (
          <button
            key={value.id}
            type="button"
            onClick={() => onSelect(attribute.id, value.id)}
            className={`h-9 rounded-full border px-4 text-xs font-semibold transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {value.value}
          </button>
        );
      })}
    </div>
  );
};

export default VariantList;
