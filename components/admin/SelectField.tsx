"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SelectOption = { label: string; value: string };
type SelectFieldProps = {
  name: string;
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  className?: string;
};

/** Shared select styled for the admin UI without opening a scroll-locking portal. */
export function SelectField({ name, options, placeholder = "Select an option", defaultValue, value, onValueChange, required, className }: SelectFieldProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const selectedValue = value ?? internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  function changeValue(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  return (
    <>
      <select
        className="select-field-validation-proxy"
        name={name}
        value={selectedValue}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        onChange={() => undefined}
      >
        <option value="" />
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`form-select-trigger ${className || ""}`}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-required={required || undefined}
          >
            <span className={selectedOption ? "" : "select-field-placeholder"}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown className="select-field-chevron" size={17} aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="select-field-menu">
          <DropdownMenuRadioGroup value={selectedValue} onValueChange={changeValue}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
