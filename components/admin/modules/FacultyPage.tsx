"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { useFacultyManagement } from "@/components/admin/FacultyManagementProvider";
import {
  FacultyForm,
  type FacultyFormValue,
} from "@/components/admin/forms/FacultyForm";
import { FacultyTable } from "@/components/admin/tables/FacultyTable";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import type { Faculty } from "@/components/admin/model";
import { splitPhoneNumber } from "@/components/admin/countryCallingCodes";

export function FacultyPage() {
  const { faculty, loading, error, refreshFaculty } = useFacultyManagement();
  const { specialities, specialitiesLoading, specialitiesError } = useAdminData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | undefined>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);
  const rows = useMemo(
    () =>
      faculty.filter((member) =>
        `${member.name} ${member.email} ${member.speciality} ${member.institute}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [faculty, search],
  );

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }
  async function readResult(response: Response) {
    if (response.ok) return;
    const messages: Record<number, string> = {
      400: "Check the faculty details and selected speciality.",
      401: "Your admin session has expired. Sign in again.",
      403: "You do not have permission to manage faculty.",
      404: "This faculty member could not be found.",
      409: "That email address or mobile number is already in use.",
    };
    throw new Error(messages[response.status] || "The request could not be completed. Try again shortly.");
  }

  async function saveFaculty(value: FacultyFormValue) {
    if (!value.specialityId) {
      setFormError("Select a speciality.");
      return;
    }
    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const response = await fetch(
        editing ? `/api/admin/faculties/${encodeURIComponent(String(editing.id))}` : "/api/admin/faculties",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: value.name.trim(),
            email: value.email.trim(),
            mobile: splitPhoneNumber(value.phone).mobile,
            affiliation: value.institute.trim(),
            specialityId: value.specialityId,
          }),
        },
      );
      await readResult(response);
      await refreshFaculty();
      setNotice(editing ? "Faculty member updated." : "Faculty member created.");
      closeForm();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Could not save the faculty member.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaculty(id: string | number) {
    setActionError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/faculties/${encodeURIComponent(String(id))}`, { method: "DELETE" });
      await readResult(response);
      await refreshFaculty();
      setNotice("Faculty member deleted.");
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "Could not delete the faculty member.");
    }
  }
  return (
    <>
      <PageHeading
        // eyebrow="EXPERT NETWORK"
        title="Faculty"
        // description="Build your faculty network and manage educational content."
        action={
          <button
            className="primary"
            type="button"
            disabled={specialitiesLoading || specialities.length === 0}
            onClick={() => { setEditing(undefined); setFormError(""); setFormOpen(true); }}
          >
            + Add faculty
          </button>
        }
      />
      <div className="metric-strip faculty-metric-strip">
        <strong>
          {faculty.length} <small>faculty members</small>
        </strong>
        <span>Across {specialities.length} Specialities</span>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search faculty..."
        />
      </div>
      <section className="panel table-panel">
        {specialitiesError && <p className="form-error" role="alert">Speciality choices could not be loaded: {specialitiesError}</p>}
        {actionError && <p className="form-error" role="alert">{actionError}</p>}
        {loading ? <div className="empty-state" role="status">Loading faculty…</div> : error ? (
          <div className="empty-state" role="alert">
            <p>{error}</p>
            <button className="secondary" type="button" onClick={() => void refreshFaculty()}>Retry</button>
          </div>
        ) : (
          <FacultyTable
            rows={rows}
            onEdit={(member) => { setEditing(member); setFormError(""); setFormOpen(true); }}
            onDelete={(id) => void deleteFaculty(id)}
          />
        )}
      </section>
      {notice && <div className="toast" role="status"><Check size={15} /><span>{notice}</span></div>}
      {formOpen && (
        <FacultyForm
          initial={editing}
          specialities={specialities}
          onSave={saveFaculty}
          onCancel={closeForm}
          saving={saving}
          serverError={formError}
        />
      )}
    </>
  );
}
