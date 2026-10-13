"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import { Field } from "@/components/admin/PageHeading";
import { SelectField } from "@/components/admin/SelectField";

export type Hall = {
  id: number;
  name: string;
  link: string;
  status: "Active" | "Inactive";
};

export function HallForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Hall;
  onSave: (hall: Omit<Hall, "id">) => void;
  onCancel: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")),
      link: String(data.get("link")),
      status: String(data.get("status")) as Hall["status"],
    });
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
            {/* <div className="eyebrow">CONFERENCE SETUP</div> */}
            <h2>{initial ? "Edit Hall" : "Add Hall"}</h2>
            {/* <p>Set the hall name and the attendee streaming link.</p> */}
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
        <Field label="Hall name" required>
          <input
            name="name"
            defaultValue={initial?.name}
            placeholder="Main auditorium"
            required
          />
        </Field>
        <Field label="Video or streaming link" required>
          <input
            name="link"
            type="url"
            defaultValue={initial?.link}
            placeholder="https://"
            required
          />
        </Field>
        <Field label="Status">
          <SelectField
            name="status"
            defaultValue={initial?.status || "Active"}
            options={["Active", "Inactive"].map((value) => ({
              label: value,
              value,
            }))}
          />
        </Field>
        <div className="drawer-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary">
            {initial ? "Save changes" : "Add hall"}
          </button>
        </div>
      </form>
    </div>
  );
}
