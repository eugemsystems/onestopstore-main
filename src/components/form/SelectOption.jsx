import React from "react";
import Label from "@components/form/Label";

const SelectOption = ({ name, label, options, onChange, value }) => {
  return (
    <>
      <Label label={label} />
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="py-2 px-4 md:px-5 w-full appearance-none border text-sm text-muted-foreground rounded-md h-10 mt-1.5 transition duration-200 focus:ring-0 ease-in-out border-border focus:outline-none focus:border-border"
        >
          <option value="">Select {label}</option>
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default SelectOption;
