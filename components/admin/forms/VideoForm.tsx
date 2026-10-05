"use client";

import type { FormEvent } from "react";
import { X } from "lucide-react";
import { Field } from "@/components/admin/PageHeading";
import { SelectField } from "@/components/admin/SelectField";
import type { Speciality } from "@/components/admin/model";

export type FacultyVideo = {
  id: number;
  title: string;
  speciality: string;
  link: string;
  type: "Paid" | "Free";
  amount: string;
};

export function VideoForm({
  initial,
  specialities,
  onSave,
  onCancel,
}: {
  initial?: FacultyVideo;
  specialities: Speciality[];
  onSave: (video: Omit<FacultyVideo, "id">) => void;
  onCancel: () => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type")) as FacultyVideo["type"];
    onSave({
      title: String(data.get("title")),
      speciality: String(data.get("speciality")),
      link: String(data.get("link")),
      type,
      amount:
        type === "Free"
          ? "Free"
          : `INR ${Number(data.get("amount") || 0).toLocaleString("en-IN")}`,
    });
  }
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
            {/* <div className="eyebrow">FACULTY CONTENT</div> */}
            <h2>{initial ? "Edit Video" : "Add Video"}</h2>
            {/* <p>Publish a learning video on this faculty profile.</p> */}
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
        <Field label="Video title" required>
          <input
            name="title"
            defaultValue={initial?.title}
            placeholder="Video title"
            required
          />
        </Field>
        <Field label="Speciality" required>
          <SelectField
            name="speciality"
            defaultValue={initial?.speciality || options[0]?.name}
            required
            options={options.map(({ name }) => ({ label: name, value: name }))}
          />
        </Field>
        <Field label="Video link" required>
          <input
            name="link"
            type="url"
            defaultValue={initial?.link}
            placeholder="https://"
            required
          />
        </Field>
        <Field label="Access type">
          <SelectField
            name="type"
            defaultValue={initial?.type || "Free"}
            options={["Free", "Paid"].map((value) => ({ label: value, value }))}
          />
        </Field>
        <Field label="Amount (INR)">
          <input
            name="amount"
            type="number"
            min="0"
            defaultValue={
              initial?.type === "Paid"
                ? Number(initial.amount.replace(/[^0-9]/g, ""))
                : ""
            }
            placeholder="0"
          />
        </Field>
        <div className="drawer-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary">
            {initial ? "Save changes" : "Add video"}
          </button>
        </div>
      </form>
    </div>
  );
}
