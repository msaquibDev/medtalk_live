"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import { ExportButton } from "@/components/admin/TableToolbar";
import { TablePagination } from "@/components/admin/TablePagination";
import { downloadCsv } from "@/lib/csv";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import type { RegisteredUser } from "@/components/admin/model";
import {
  UserProfileForm,
  type UserProfileFormValue,
} from "@/components/admin/forms/UserProfileForm";

export function UsersPage() {
  const { users, setUsers, specialities } = useAdminData();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<RegisteredUser | undefined>();
  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.name} ${user.email} ${user.phoneCode} ${user.mobile} ${user.hospital} ${user.speciality}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [users, search],
  );
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const allSelected =
    rows.length > 0 && rows.every((user) => selected.includes(user.id));
  function toggleAll(checked: boolean | "indeterminate") {
    setSelected(
      checked
        ? Array.from(new Set([...selected, ...rows.map((row) => row.id)]))
        : selected.filter((id) => !rows.some((row) => row.id === id)),
    );
  }
  function saveProfile(value: UserProfileFormValue) {
    if (!editing) return;
    setUsers((current) =>
      current.map((user) =>
        user.id === editing.id ? { ...user, ...value } : user,
      ),
    );
    setEditing(undefined);
  }
  return (
    <>
      <PageHeading
        title="Registered users"
        action={
          <ExportButton
            onClick={() =>
              downloadCsv("meditalk-registered-users.csv", [
                [
                  "Full name",
                  "Email",
                  "Phone code",
                  "Mobile",
                  "Hospital / Institute",
                  "Speciality",
                  "Registered at",
                ],
                ...filteredUsers.map((user) => [
                  user.name,
                  user.email,
                  user.phoneCode,
                  user.mobile,
                  user.hospital,
                  user.speciality,
                  user.registeredAt,
                ]),
              ])
            }
            label="Download CSV"
          />
        }
      />
      <div className="metric-strip">
        <strong>
          1,284 <small>total users</small>
        </strong>
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search users..."
        />
      </div>
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all visible users"
                  />
                </th>
                <th>FULL NAME</th>
                <th>EMAIL ADDRESS</th>
                <th>MOBILE</th>
                <th>REGISTERED AT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user, index) => (
                <tr key={user.id}>
                  <td>
                    <Checkbox
                      checked={selected.includes(user.id)}
                      onCheckedChange={(checked) =>
                        setSelected(
                          checked
                            ? [...selected, user.id]
                            : selected.filter((id) => id !== user.id),
                        )
                      }
                      aria-label={`Select ${user.name}`}
                    />
                  </td>
                  <td>
                    <span className="person">
                      <span className={`mini-avatar c${index % 4}`}>
                        {user.name
                          .split(" ")
                          .slice(1)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <strong>{user.name}</strong>
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {user.phoneCode} {user.mobile}
                  </td>
                  <td>{user.registeredAt}</td>
                  <td>
                    <span className="status-pill active-pill">
                      <i />
                      Active
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="secondary edit-profile-button"
                      onClick={() => setEditing(user)}
                    >
                      Edit Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty-state">No users match your search.</div>
          )}
        </div>
        <TablePagination
          totalItems={filteredUsers.length}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setPage}
          itemLabel="users"
        />
      </section>
      {editing && (
        <UserProfileForm
          user={editing}
          specialities={specialities.map((item) => item.name)}
          onSave={saveProfile}
          onCancel={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
