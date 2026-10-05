"use client";

import { useState } from "react";
import Image from "next/image";
import type { FormEvent } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import type { Conference } from "@/components/admin/model";
import { DatePickerField } from "@/components/admin/DatePickerField";
import { Field } from "@/components/admin/PageHeading";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type ConferenceFormValue = Omit<Conference, "id" | "status" | "attendees">;
type Props = { initial?: Conference; onSave: (value: ConferenceFormValue) => void; onCancel: () => void };

function existingDate(value?: string) {
  if (!value) return undefined;
  const dateText = value.split(" | ")[0];
  const parsed = new Date(dateText);
  return Number.isNaN(parsed.getTime()) ? undefined : format(parsed, "yyyy-MM-dd");
}
function existingTime(value?: string) {
  if (!value?.includes(" | ")) return "09:00";
  const parsed = new Date(`Jan 01, 2000 ${value.split(" | ")[1]}`);
  return Number.isNaN(parsed.getTime()) ? "09:00" : format(parsed, "HH:mm");
}

export function ConferenceForm({ initial, onSave, onCancel }: Props) {
  const [eventType, setEventType] = useState<"Paid" | "Free">(initial?.type || "Paid");
  const [banner, setBanner] = useState(initial?.banner || "/conference-placeholder.svg");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const startDate = String(data.get("start") || "");
    const endDate = String(data.get("end") || "");
    if (!startDate) { setError("Choose a start date for this conference."); return; }
    if (endDate && endDate < startDate) { setError("The end date must be on or after the start date."); return; }
    const startTime = String(data.get("time") || "09:00");
    const value: ConferenceFormValue = {
      name: String(data.get("name")),
      start: `${format(new Date(`${startDate}T00:00:00`), "MMM dd, yyyy")} | ${format(new Date(`2000-01-01T${startTime}`), "hh:mm a")}`,
      end: endDate ? format(new Date(`${endDate}T00:00:00`), "MMM dd, yyyy") : undefined,
      venue: String(data.get("venue") || "To be announced"),
      amount: eventType === "Free" ? "Free" : `INR ${Number(data.get("amount") || 0).toLocaleString("en-IN")}`,
      type: eventType,
      banner,
    };
    onSave(value);
  }

  const startTime = existingTime(initial?.start);
  return <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><form className="drawer" onSubmit={submit}>
    <div className="drawer-head"><div><div className="eyebrow">EVENT MANAGEMENT</div><h2>{initial ? "Edit conference" : "Add conference"}</h2><p>Set up the details for your medical event.</p></div><button type="button" className="close-button" onClick={onCancel} aria-label="Close"><X size={17}/></button></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <Field label="Conference name" required><input name="name" defaultValue={initial?.name} placeholder="e.g. Urology Annual Meet 2026" required /></Field>
    <div className="form-row"><Field label="Start date" required><DatePickerField name="start" initialValue={existingDate(initial?.start)} placeholder="Select start date" /></Field><Field label="Start time"><input type="time" name="time" defaultValue={startTime} /></Field></div>
    <Field label="End date"><DatePickerField name="end" initialValue={existingDate(initial?.end)} placeholder="Select end date" /></Field>
    <Field label="Venue"><input name="venue" defaultValue={initial?.venue} placeholder="Venue or online platform" /></Field>
    <div className="form-row"><Field label="Event type"><input type="hidden" name="type" value={eventType} /><RadioGroup value={eventType} onValueChange={(value) => setEventType(value as "Paid" | "Free")} className="event-type-options"><div className="radio-option"><RadioGroupItem value="Paid" id="event-paid" /><span>Paid event</span></div><div className="radio-option"><RadioGroupItem value="Free" id="event-free" /><span>Free event</span></div></RadioGroup></Field><Field label="Amount (INR)"><input name="amount" type="number" min="0" defaultValue={initial ? Number(initial.amount.replace(/[^0-9]/g, "")) : ""} placeholder="0" /></Field></div>
    <Field label="Conference banner">
      <div className="conference-banner-upload">
        <Image src={banner} alt="Conference banner preview" width={640} height={360} unoptimized className="conference-banner-preview" />
        <div className="banner-upload-controls">
          <div><b>Upload event artwork</b><small>PNG, JPG, or WebP. Maximum 5 MB.</small></div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="Upload conference banner"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
                setError("Choose an image smaller than 5 MB.");
                event.currentTarget.value = "";
                return;
              }
              setError("");
              const reader = new FileReader();
              reader.onload = () => { if (typeof reader.result === "string") setBanner(reader.result); };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      </div>
    </Field>
    <div className="drawer-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button className="primary">{initial ? "Save changes" : "Create conference"}</button></div>
  </form></div>;
}

