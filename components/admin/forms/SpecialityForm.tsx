"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { Speciality } from "@/components/admin/model";
import { Field } from "@/components/admin/PageHeading";

export type SpecialityFormValue = Pick<Speciality, "name">;

export function SpecialityForm({
  initial,
  existingNames,
  onSave,
  onCancel,
}: {
  initial?: Speciality;
  existingNames: string[];
  onSave: (value: SpecialityFormValue) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (
      existingNames.some(
        (existing) =>
          existing.toLowerCase() === name.toLowerCase() &&
          existing !== initial?.name,
      )
    ) {
      setError("This speciality is already in the list.");
      return;
    }
    onSave({ name });
  }
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
            {/* <div className="eyebrow">FACULTY SETTINGS</div> */}
            <h2>{initial ? "Edit speciality" : "Add speciality"}</h2>
            {/* <p>Enter a speciality name for faculty and video forms.</p> */}
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
        <Field label="Speciality name" required>
          <input
            name="name"
            defaultValue={initial?.name}
            placeholder="e.g. Uro-Oncology"
            onChange={() => setError("")}
            required
          />
        </Field>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="drawer-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary">
            {initial ? "Save changes" : "Add speciality"}
          </button>
        </div>
      </form>
    </div>
  );
}
