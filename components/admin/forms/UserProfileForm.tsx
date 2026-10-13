"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { RegisteredUser } from "@/components/admin/model";
import { Field } from "@/components/admin/PageHeading";
import { SelectField } from "@/components/admin/SelectField";

export type UserProfileFormValue = Pick<
  RegisteredUser,
  "name" | "email" | "phoneCode" | "mobile" | "hospital" | "speciality"
>;

export function UserProfileForm({
  user,
  specialities,
  onSave,
  onCancel,
}: {
  user: RegisteredUser;
  specialities: string[];
  onSave: (value: UserProfileFormValue) => void;
  onCancel: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")),
      email: String(data.get("email")),
      phoneCode: String(data.get("phoneCode")),
      mobile: String(data.get("mobile")),
      hospital: String(data.get("hospital")),
      speciality: String(data.get("speciality")),
    });
  }
  const codes = ["+91", "+1", "+44", "+971"];
  if (!codes.includes(user.phoneCode)) codes.unshift(user.phoneCode);
  const specialityOptions = specialities.includes(user.speciality)
    ? specialities
    : [user.speciality, ...specialities];
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
            <div className="eyebrow">REGISTERED USER</div>
            <h2>Edit Profile</h2>
            <p>Update the profile details provided during signup.</p>
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
          <input name="name" defaultValue={user.name} required />
        </Field>
        <Field label="Email address" required>
          <input
            name="email"
            type="email"
            defaultValue={user.email}
            autoComplete="email"
            required
          />
        </Field>
        <div className="form-row">
          <Field label="Phone code" required>
            <SelectField
              name="phoneCode"
              defaultValue={user.phoneCode}
              required
              options={codes.map((value) => ({ value, label: value }))}
            />
          </Field>
          <Field label="Mobile number" required>
            <input
              name="mobile"
              type="tel"
              defaultValue={user.mobile}
              required
            />
          </Field>
        </div>
        <Field label="Hospital / Medical College / Institute Name" required>
          <input name="hospital" defaultValue={user.hospital} required />
        </Field>
        <Field label="Speciality" required>
          <SelectField
            name="speciality"
            defaultValue={user.speciality}
            required
            options={specialityOptions.map((value) => ({
              value,
              label: value,
            }))}
          />
        </Field>
        <div className="drawer-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary">Save profile</button>
        </div>
      </form>
    </div>
  );
}
