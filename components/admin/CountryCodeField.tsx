"use client";

import { useEffect, useState } from "react";
import type { CountryCode } from "libphonenumber-js";
import { COUNTRY_OPTIONS } from "@/components/admin/countryCallingCodes";
import { SelectField } from "@/components/admin/SelectField";

type CountryCodeFieldProps = {
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
};

function countryForCallingCode(code: string): CountryCode {
  return COUNTRY_OPTIONS.find((country) => country.code === code)?.value || "IN";
}

export function CountryCodeField({
  name,
  defaultValue,
  value,
  onValueChange,
  required = true,
}: CountryCodeFieldProps) {
  const [country, setCountry] = useState<CountryCode>(() => countryForCallingCode(value || defaultValue || "+91"));
  const selectedCountry = COUNTRY_OPTIONS.find((option) => option.value === country) || COUNTRY_OPTIONS[0];

  useEffect(() => {
    if (value) setCountry(countryForCallingCode(value));
  }, [value]);

  function changeCountry(nextCountry: string) {
    const region = COUNTRY_OPTIONS.find((option) => option.value === nextCountry)?.value || "IN";
    setCountry(region);
    const callingCode = COUNTRY_OPTIONS.find((option) => option.value === region)?.code || "+91";
    onValueChange?.(callingCode);
  }

  return (
    <>
      <SelectField
        name={`${name}Country`}
        value={country}
        onValueChange={changeCountry}
        options={COUNTRY_OPTIONS.map(({ value: countryValue, country: countryName, code }) => ({
          value: countryValue,
          label: `${countryName} (${code})`,
        }))}
        placeholder="Select country"
        required={required}
      />
      <input type="hidden" name={name} value={selectedCountry?.code || "+91"} />
    </>
  );
}
