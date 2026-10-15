import { getCountries, getCountryCallingCode } from "libphonenumber-js";

export type CountryCallingCode = { code: string; countries: string[] };

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
export const COUNTRY_OPTIONS = getCountries().map((country) => ({
  value: country,
  country: regionNames.of(country) || country,
  code: `+${getCountryCallingCode(country)}`,
})).sort((a, b) => a.value === "IN" ? -1 : b.value === "IN" ? 1 : a.country.localeCompare(b.country));

const codesByCallingCode = new Map<string, string[]>();
for (const entry of COUNTRY_OPTIONS) {
  const countries = codesByCallingCode.get(entry.code) || [];
  countries.push(entry.country);
  codesByCallingCode.set(entry.code, countries);
}

export const COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  ...codesByCallingCode.entries(),
]
  .map(([code, countries]) => ({ code, countries }))
  .sort((a, b) =>
    a.code === "+91" ? -1 : b.code === "+91" ? 1 : a.countries[0].localeCompare(b.countries[0]),
  );

export function splitPhoneNumber(phone: string, fallbackCode = "+91") {
  const trimmed = phone.trim();
  const match = COUNTRY_CALLING_CODES
    .filter(({ code }) => trimmed.startsWith(code))
    .sort((a, b) => b.code.length - a.code.length)[0];
  const phoneCode = match?.code || fallbackCode;
  const mobile = (match ? trimmed.slice(phoneCode.length) : trimmed).replace(/\D/g, "");
  return { phoneCode, mobile };
}
