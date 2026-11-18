"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { SpecialityForm, type SpecialityFormValue } from "@/components/admin/forms/SpecialityForm";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import { RowActions } from "@/components/admin/RowActions";
import type { Speciality } from "@/components/admin/model";

export function SpecialitiesPage() {
  const {
    specialities,
    setSpecialities,
    specialitiesLoading,
    specialitiesError,
    specialitiesCountWarning,
    refreshSpecialities,
  } = useAdminData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Speciality | undefined>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [viewed, setViewed] = useState<Speciality | undefined>();
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const rows = useMemo(
    () => specialities.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())),
    [specialities, search],
  );

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
    setFormError("");
  }

  async function readResult(response: Response) {
    if (response.ok) return;
    const messages: Record<number, string> = {
      400: "The speciality name is invalid. Check it and try again.",
      401: "Your admin session has expired. Sign in again.",
      403: "You do not have permission to manage specialities.",
      404: "This speciality could not be found.",
      409: "A speciality with this name already exists.",
    };
    throw new Error(messages[response.status] || "The request could not be completed. Try again shortly.");
  }

  async function saveSpeciality(value: SpecialityFormValue) {
    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const response = await fetch(
        editing ? `/api/admin/specialities/${encodeURIComponent(editing.id)}` : "/api/admin/specialities",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specialityName: value.name }),
        },
      );
      await readResult(response);
      await refreshSpecialities();
      setNotice(editing ? "Speciality updated." : "Speciality created.");
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save the speciality.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSpeciality(item: Speciality) {
    setDeleting(true);
    setActionError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/specialities/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      await readResult(response);
      const deletedId = item.id;
      setSpecialities((current) => current.filter((item) => item.id !== deletedId));
      await refreshSpecialities();
      setNotice("Speciality deleted.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete the speciality.");
    } finally {
      setDeleting(false);
    }
  }

  async function viewSpeciality(item: Speciality) {
    setViewed(item);
    setViewLoading(true);
    setViewError("");
    try {
      const response = await fetch(`/api/admin/specialities/${encodeURIComponent(item.id)}`, { cache: "no-store" });
      const result = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        data?: { id?: unknown; name?: unknown; usersCount?: unknown; createdAt?: unknown; updatedAt?: unknown };
      };
      if (!response.ok || result.success !== true || typeof result.data?.name !== "string") {
        throw new Error(result.message || "Could not load speciality details.");
      }
      setViewed({
        id: item.id,
        name: result.data.name,
        ...(typeof result.data.usersCount === "number" ? { usersCount: result.data.usersCount } : {}),
        ...(typeof result.data.createdAt === "string" ? { createdAt: result.data.createdAt } : {}),
        ...(typeof result.data.updatedAt === "string" ? { updatedAt: result.data.updatedAt } : {}),
      });
    } catch (error) {
      setViewError(error instanceof Error ? error.message : "Could not load speciality details.");
    } finally {
      setViewLoading(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }

  return (
    <>
      <PageHeading
        title="Specialities"
        action={
          <button
            className="primary"
            type="button"
            onClick={() => {
              setEditing(undefined);
              setFormError("");
              setFormOpen(true);
            }}
          >
            + Add speciality
          </button>
        }
      />
      <section className="panel speciality-panel">
        <div className="panel-head">
          <div>
            <h2>All specialities</h2>
            <p>{specialities.length} options available in faculty forms.</p>
          </div>
        </div>
        <div className="table-toolbar speciality-search">
          <SearchField value={search} onChange={setSearch} placeholder="Search specialities..." />
        </div>
        {specialitiesError && (
          <div className="empty-state" role="alert">
            <p>{specialitiesError}</p>
            <button className="secondary" type="button" onClick={() => void refreshSpecialities()}>Retry</button>
          </div>
        )}
        {specialitiesCountWarning && !specialitiesError && (
          <p role="status" style={{ margin: "0 16px 12px", padding: "10px 12px", borderRadius: 6, background: "#fff8e6", color: "#755600", fontSize: 13 }}>
            Specialities are loaded. User counts unavailable: {specialitiesCountWarning}
          </p>
        )}
        {actionError && <p className="form-error" role="alert">{actionError}</p>}
        {deleting && <p className="empty-state" role="status">Deleting speciality…</p>}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SPECIALITY NAME</th>
                <th>REGISTERED USERS</th>
                <th className="action-cell">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{typeof item.usersCount === "number" ? item.usersCount : "—"}</td>
                  <td className="action-cell">
                    <RowActions
                      label={item.name}
                      onView={() => void viewSpeciality(item)}
                      onEdit={() => {
                        setEditing(item);
                        setFormError("");
                        setFormOpen(true);
                      }}
                      onDelete={() => void deleteSpeciality(item)}
                      deleteDescription={typeof item.usersCount === "number" && item.usersCount > 0
                        ? `${item.usersCount} registered users are associated with this speciality. Continue with deleting it?`
                        : "This speciality will be removed from the available list."}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {specialitiesLoading ? (
            <div className="empty-state" role="status">Loading specialities…</div>
          ) : !specialitiesError && rows.length === 0 ? (
            <div className="empty-state">
              {specialities.length === 0 ? "No specialities are available yet." : "No specialities match your search."}
            </div>
          ) : null}
        </div>
      </section>
      {notice && <div className="toast" role="status"><Check size={15} /><span>{notice}</span></div>}
      {formOpen && (
        <SpecialityForm
          initial={editing}
          existingNames={specialities.map((item) => item.name)}
          onSave={saveSpeciality}
          onCancel={closeForm}
          saving={saving}
          serverError={formError}
        />
      )}
      {viewed && (
        <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setViewed(undefined)}>
          <section className="drawer speciality-detail" role="dialog" aria-modal="true" aria-labelledby="speciality-detail-title">
            <div className="drawer-head">
              <div><h2 id="speciality-detail-title">Speciality details</h2></div>
              <button type="button" className="close-button" onClick={() => setViewed(undefined)} aria-label="Close details"><X size={17} /></button>
            </div>
            {viewLoading ? <p role="status">Loading details…</p> : viewError ? <p className="form-error" role="alert">{viewError}</p> : (
              <dl className="speciality-detail-list">
                <dt>Speciality name</dt><dd>{viewed.name}</dd>
                <dt>Registered users</dt><dd>{typeof viewed.usersCount === "number" ? viewed.usersCount : "—"}</dd>
                <dt>Created</dt><dd>{formatDate(viewed.createdAt)}</dd>
                <dt>Last updated</dt><dd>{formatDate(viewed.updatedAt)}</dd>
              </dl>
            )}
            <div className="drawer-actions">
              <button type="button" className="secondary" onClick={() => setViewed(undefined)}>Close</button>
              <button type="button" className="primary" onClick={() => { setViewed(undefined); setEditing(viewed); setFormError(""); setFormOpen(true); }} disabled={viewLoading || Boolean(viewError)}>
                <Eye size={15} /> Edit speciality
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
