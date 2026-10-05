"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

/** Shared accessible select that submits through native FormData via Radix's hidden input. */
export function SelectField({ name, options, placeholder = "Select an option", defaultValue, value, onValueChange, required, className }: SelectFieldProps) {
  return (
    <Select name={name} defaultValue={defaultValue} value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger className={`form-select-trigger ${className || ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
