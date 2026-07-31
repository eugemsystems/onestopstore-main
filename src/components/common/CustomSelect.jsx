import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

const CustomSelect = ({
  value,
  onChange,
  children,
  placeholder = "Select Variant",
  className = "",
  triggerClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        className={`flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors hover:bg-muted/50 ${triggerClassName}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {value
            ? children.find((child) => child.props.value === value)?.props
                .children
            : placeholder}
        </span>
        <ChevronDownIcon
          className={`size-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="max-h-60 overflow-y-auto p-1">{children}</div>
        </div>
      )}
    </div>
  );
};

const CustomSelectItem = ({ value, children, onSelect, className = "" }) => {
  return (
    <div
      className={`flex cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-7 text-sm hover:bg-accent hover:text-accent-foreground ${className}`}
      onClick={() => onSelect(value)}
    >
      {children}
    </div>
  );
};

export { CustomSelect, CustomSelectItem };
