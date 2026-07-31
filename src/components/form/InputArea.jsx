import React from "react";
import { Input } from "@components/ui/input";

const InputArea = ({
  name,
  label,
  type,
  Icon,
  register,
  defaultValue,
  autocomplete,
  placeholder,
  hasError,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-muted-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <Input
          {...register(name)}
          id={name}
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete={autocomplete}
          hasError={hasError}
          className={Icon ? "pl-12" : ""}
        />
      </div>
    </div>
  );
};

export default InputArea;
