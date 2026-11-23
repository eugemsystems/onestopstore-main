"use client";

import { IoCheckmarkCircle, IoEllipseOutline } from "react-icons/io5";
import { BsTruck } from "react-icons/bs";
import useUtilsFunction from "@hooks/useUtilsFunction";

/**
 * One product, several prices by delivery time. Option names are admin-defined
 * (defaults: "Fastest Delivery" / "Best Price"). The customer must pick one; the chosen price is
 * only applied once picked.
 */
export default function DeliveryOptionList({ options = [], selectedId = null, onSelect }) {
  const { formatPrice } = useUtilsFunction();
  if (!options.length) return null;

  return (
    <div className="mb-6">
      <h4 className="flex items-center gap-1.5 py-1 text-sm font-medium text-foreground">
        <BsTruck /> Delivery options
        {selectedId == null && (
          <span className="text-xs font-normal text-red-500">— please select</span>
        )}
      </h4>
      <div className="mt-1 grid gap-2">
        {options.map((opt) => {
          const inStock = Number(opt.stock) > 0;
          const selected = selectedId === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onSelect?.(opt.id)}
              disabled={!inStock}
              aria-pressed={selected}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                selected
                  ? "border-2 border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-border bg-background hover:border-cyan-400"
              } ${inStock ? "cursor-pointer" : "cursor-not-allowed opacity-55"}`}
            >
              <span className="flex items-center gap-2">
                {selected ? (
                  <IoCheckmarkCircle className="text-lg text-cyan-600" />
                ) : (
                  <IoEllipseOutline className="text-lg text-muted-foreground" />
                )}
                <span>
                  <span className="block text-sm font-bold text-foreground">
                    {opt.label}
                    {opt.isDefault && (
                      <span className="ml-1.5 rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700">
                        Recommended
                      </span>
                    )}
                  </span>
                  {opt.deliveryText && (
                    <span className="block text-xs text-muted-foreground">{opt.deliveryText}</span>
                  )}
                  {!inStock && (
                    <span className="block text-xs font-semibold text-red-500">Out of stock</span>
                  )}
                </span>
              </span>
              <span className="whitespace-nowrap text-right">
                <span className="block text-[15px] font-extrabold text-foreground">
                  {formatPrice(opt.price)}
                </span>
                {opt.price < opt.originalPrice && (
                  <del className="block text-[11px] text-muted-foreground">
                    {formatPrice(opt.originalPrice)}
                  </del>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
