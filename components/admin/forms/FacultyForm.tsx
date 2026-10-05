"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { Faculty, Speciality } from "@/components/admin/model";
import { Field } from "@/components/admin/PageHeading";
import { SelectField } from "@/components/admin/SelectField";

export type FacultyFormValue = Omit<Faculty, "id">;
type Props = {
  initial?: Faculty;
  onSave: (value: FacultyFormValue) => void;
  onCancel: () => void;
};

export function FacultyForm({
  initial,
  specialities,
  onSave,
  onCancel,
}: Props & { specialities: Speciality[] }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: `${data.get("code")} ${data.get("phone")}`,
      institute: String(data.get("institute")),
      speciality: String(data.get("speciality")),
    });
  }
  const phoneParts = initial?.phone.split(" ") || ["+91", ""];
  const options = specialities;
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
        <div className="form-row">
          <Field label="Phone code" required>
            <SelectField
              name="code"
              defaultValue={phoneParts[0] || "+91"}
              required
              options={["+91", "+1", "+44", "+971"].map((value) => ({
                value,
                label: value,
              }))}
            />
          </Field>
          <Field label="Mobile number" required>
            <input
              name="phone"
              type="tel"
              defaultValue={phoneParts.slice(1).join(" ")}
              placeholder="98765 43210"
              required
            />
          </Field>
        </div>
        <Field label="Speciality" required>
          <SelectField
            name="speciality"
            defaultValue={initial?.speciality || options[0]?.name}
            required
            placeholder="Select speciality"
            options={options.map(({ name }) => ({ value: name, label: name }))}
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
        <div className="drawer-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary">
            {initial ? "Save changes" : "Add faculty member"}
          </button>
        </div>
      </form>
    </div>
  );
}
