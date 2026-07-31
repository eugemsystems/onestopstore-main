"use client";

import React from "react";
import { FiTruck } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";

const InputShipping = ({
  value,
  name,
  register,
  description,
  handleShippingCost,
}) => {
  const { formatPrice } = useUtilsFunction();

  return (
    <div>
      <div className="p-3 card border border-border bg-background rounded-md">
        <label className="cursor-pointer label">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3 text-muted-foreground">
                <FiTruck />
              </span>
              <div>
                <h6 className="font-medium text-sm text-muted-foreground">{name}</h6>
                <p className="text-xs text-muted-foreground font-medium">
                  {description}
                  <span className="font-medium text-muted-foreground">
                    {formatPrice(value)}
                  </span>
                </p>
              </div>
            </div>
            <input
              onClick={() => handleShippingCost(value)}
              {...register(`shippingOption`, {
                required: `Shipping Option is required!`,
              })}
              name="shippingOption"
              type="radio"
              value={name}
              className="form-radio outline-none focus:ring-0 text-primary"
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default InputShipping;
