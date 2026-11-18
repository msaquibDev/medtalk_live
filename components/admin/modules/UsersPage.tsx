"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import { ExportButton } from "@/components/admin/TableToolbar";
import { TablePagination } from "@/components/admin/TablePagination";
import { downloadCsv } from "@/lib/csv";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { useRegisteredUsers } from "@/components/admin/RegisteredUsersProvider";
import type { RegisteredUser } from "@/components/admin/model";
import { UserProfileForm, type UserProfileFormValue } from "@/components/admin/forms/UserProfileForm";

type UserApiResult = { success?: boolean; message?: string };

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function UsersPage() {
  const { specialities } = useAdminData();
  const { users, pagination, search, loading, error, setPage, setSearch, refreshUsers } = useRegisteredUsers();
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<RegisteredUser | undefined>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const allSelected = users.length > 0 && users.every((user) => selected.includes(String(user.id)));
  function toggleAll(checked: boolean | "indeterminate") {
    setSelected((current) => checked
      ? [...new Set([...current, ...users.map((user) => String(user.id))])]
      : current.filter((id) => !users.some((user) => String(user.id) === id)),
    );
  }

  async function saveProfile(value: UserProfileFormValue) {
    if (!editing) return;
    const selectedSpeciality = specialities.find((item) => item.name === value.speciality);
    const specialityId = selectedSpeciality?.id || (editing.speciality === value.speciality ? editing.specialityId : undefined);
    if (!specialityId) {
      setFormError("Select a speciality that exists in the speciality list.");
      return;
    }

    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(String(editing.id))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: value.name.trim(),
          email: value.email.trim(),
          mobile: value.mobile.replace(/\D/g, ""),
          affiliation: value.hospital.trim(),
          specialityId,
        }),
      });
      const result = await response.json().catch(() => ({})) as UserApiResult;
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Could not update the user profile.");
      }
      await refreshUsers();
      setEditing(undefined);
      setNotice(result.message || "User profile updated.");
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Could not update the user profile.");
    } finally {
      setSaving(false);
    }
  }

  async function exportUsers() {
    setExporting(true);
    setActionError("");
    try {
      const response = await fetch("/api/admin/users/export", { cache: "no-store" });
      const result = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        data?: RegisteredUser[];
      };
      if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
        throw new Error(result.message || "Could not export registered users.");
      }
      const term = search.trim().toLowerCase();
      const filtered = result.data.filter((user) =>
        !term || `${user.name} ${user.email} ${user.mobile} ${user.hospital} ${user.speciality}`.toLowerCase().includes(term),
      );
      downloadCsv("meditalk-registered-users.csv", [
        ["Full name", "Email", "Mobile", "Hospital / Institute", "Speciality", "Registered at", "Status"],
        ...filtered.map((user) => [
          user.name,
          user.email,
          user.mobile,
          user.hospital,
          user.speciality,
          formatDate(user.registeredAt),
          user.status || "",
        ]),
      ]);
    } catch (exportError) {
      setActionError(exportError instanceof Error ? exportError.message : "Could not export registered users.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeading
        title="Registered users"
        action={<ExportButton onClick={() => void exportUsers()} label={exporting ? "Preparing CSV…" : "Download CSV"} />}
      />
      <div className="metric-strip">
        <strong>{pagination.total.toLocaleString()} <small>total users</small></strong>
        <SearchField value={search} onChange={setSearch} placeholder="Search users..." />
      </div>
      <section className="panel table-panel">
        {actionError && <p className="form-error" role="alert">{actionError}</p>}
        {loading ? <div className="empty-state" role="status">Loading registered users…</div> : error ? (
          <div className="empty-state" role="alert">
            <p>{error}</p>
            <button type="button" className="secondary" onClick={() => void refreshUsers()}>Retry</button>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all visible users" /></th>
                    <th>FULL NAME</th>
                    <th>EMAIL ADDRESS</th>
                    <th>MOBILE</th>
                    <th>REGISTERED AT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <Checkbox
                          checked={selected.includes(String(user.id))}
                          onCheckedChange={(checked) => setSelected((current) => checked
                            ? [...new Set([...current, String(user.id)])]
                            : current.filter((id) => id !== String(user.id)))}
                          aria-label={`Select ${user.name}`}
                        />
                      </td>
                      <td>
                        <span className="person">
                          <span className={`mini-avatar c${index % 4}`}>
                            {user.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                          <strong>{user.name}</strong>
                        </span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>{formatDate(user.registeredAt)}</td>
                      <td>
                        {user.status ? <span className={`status-pill ${user.status === "active" ? "active-pill" : "inactive-pill"}`}><i />{user.status === "active" ? "Active" : "Pending"}</span> : "—"}
                      </td>
                      <td>
                        <button type="button" className="secondary edit-profile-button" onClick={() => { setEditing(user); setFormError(""); }}>
                          Edit Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="empty-state">{search ? "No users match your search." : "No registered users yet."}</div>}
            </div>
            <TablePagination
              totalItems={pagination.total}
              page={pagination.page}
              pageSize={pagination.limit}
              onPageChange={setPage}
              itemLabel="users"
            />
          </>
        )}
      </section>
      {notice && <div className="toast" role="status"><Check size={15} /><span>{notice}</span></div>}
      {editing && (
        <UserProfileForm
          user={editing}
          specialities={specialities.map((item) => item.name)}
          onSave={saveProfile}
          onCancel={() => !saving && setEditing(undefined)}
          saving={saving}
          serverError={formError}
        />
      )}
    </>
  );
}
