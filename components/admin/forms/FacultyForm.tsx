"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { Faculty, Speciality } from "@/components/admin/model";
import { Field } from "@/components/admin/PageHeading";
import { SelectField } from "@/components/admin/SelectField";
import { DigitsOnlyInput } from "@/components/admin/DigitsOnlyInput";
import { CountryCodeField } from "@/components/admin/CountryCodeField";
import { splitPhoneNumber } from "@/components/admin/countryCallingCodes";

export type FacultyFormValue = Omit<Faculty, "id">;
type Props = {
  initial?: Faculty;
  onSave: (value: FacultyFormValue) => Promise<void> | void;
  onCancel: () => void;
  saving?: boolean;
  serverError?: string;
};

export function FacultyForm({
  initial,
  specialities,
  onSave,
  onCancel,
  saving = false,
  serverError = "",
}: Props & { specialities: Speciality[] }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const specialityId = String(data.get("specialityId") || "");
    await onSave({
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: `${String(data.get("phoneCode"))} ${String(data.get("phone"))}`,
      institute: String(data.get("institute")),
      speciality: specialities.find((item) => item.id === specialityId)?.name || "",
      specialityId,
    });
  }
  const options = specialities;
  const initialPhone = splitPhoneNumber(initial?.phone || "");
  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <form className="drawer" onSubmit={submit}>
        <div className="drawer-head">
          <div>
            {/* <div className="eyebrow">EXPERT NETWORK</div> */}
            <h2>{initial ? "Edit Faculty" : "Add Faculty"}</h2>
            {/* <p>Add an expert to your faculty network.</p> */}
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onCancel}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>
        <Field label="Full name" required>
          <input
            name="name"
            defaultValue={initial?.name}
            placeholder="Dr. Full Name"
            required
          />
        </Field>
        <Field label="Email address" required>
          <input
            name="email"
            type="email"
            defaultValue={initial?.email}
            placeholder="name@hospital.com"
            required
          />
        </Field>
        <Field label="Mobile number" required>
          <div className="phone-number-fields">
            <CountryCodeField name="phoneCode" defaultValue={initialPhone.phoneCode} />
            <DigitsOnlyInput
              name="phone"
              defaultValue={initialPhone.mobile}
              placeholder="9876543210"
              autoComplete="tel-national"
              required
            />
          </div>
        </Field>
        <Field label="Speciality" required>
          <SelectField
            name="specialityId"
            defaultValue={initial?.specialityId || options.find((item) => item.name === initial?.speciality)?.id || options[0]?.id}
            required
            placeholder="Select speciality"
            options={options.map(({ id, name }) => ({ value: id, label: name }))}
          />
        </Field>
        <Field label="Hospital / medical college / institute" required>
          <input
            name="institute"
            defaultValue={initial?.institute}
            placeholder="Institution name"
            required
          />
        </Field>
        {serverError && <p className="form-error" role="alert">{serverError}</p>}
        {options.length === 0 && <p className="form-error" role="alert">No specialities are available. Load specialities before adding faculty.</p>}
        <div className="drawer-actions">
          <button type="button" className="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button className="primary" disabled={saving || options.length === 0}>
            {saving ? "Saving…" : initial ? "Save changes" : "Add faculty member"}
          </button>
        </div>
      </form>
    </div>
  );
}
