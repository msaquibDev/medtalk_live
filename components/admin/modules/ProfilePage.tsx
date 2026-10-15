"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeading, Field } from "@/components/admin/PageHeading";
import { useAdminProfile } from "@/components/admin/AdminProfileContext";
import { DigitsOnlyInput } from "@/components/admin/DigitsOnlyInput";
import { CountryCodeField } from "@/components/admin/CountryCodeField";

export function ProfilePage() {
  const { profile, updateProfile } = useAdminProfile();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <PageHeading
        eyebrow="ACCOUNT SETTINGS"
        title="Admin Profile"
        description="Update the contact details associated with your administrator account."
      />
      <section className="panel profile-settings-panel">
        <div className="profile-settings-heading">
          <span className="avatar profile-settings-avatar">
            {form.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h2>Profile Details</h2>
            <p>These details are used for your admin profile.</p>
          </div>
        </div>
        <form className="profile-settings-form" onSubmit={submit}>
          <Field label="Full Name" required>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Email Address" required>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Mobile Number">
            <div className="phone-number-fields">
              <CountryCodeField
                name="profilePhoneCode"
                value={form.phoneCode || "+91"}
                onValueChange={(phoneCode) => setForm((current) => ({ ...current, phoneCode }))}
              />
              <DigitsOnlyInput
                value={form.mobile.replace(/\D/g, "")}
                onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))}
                autoComplete="tel-national"
                placeholder="Enter mobile number"
              />
            </div>
          </Field>
          <div className="profile-settings-actions">
            {saved && <span role="status">Profile updated.</span>}
            <button className="primary" type="submit">Save Profile</button>
          </div>
        </form>
      </section>
    </>
  );
}
