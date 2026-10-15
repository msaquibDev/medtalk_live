import type {
  ChangeEvent,
  InputHTMLAttributes,
} from "react";

type DigitsOnlyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "pattern" | "onChange"
> & {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

/** Mobile-number input that strips non-digit characters as the user types or pastes. */
export function DigitsOnlyInput({ onChange, ...props }: DigitsOnlyInputProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      onChange={(event) => {
        const digits = event.currentTarget.value.replace(/\D/g, "");
        if (event.currentTarget.value !== digits) {
          event.currentTarget.value = digits;
        }
        onChange?.(event);
      }}
    />
  );
}
