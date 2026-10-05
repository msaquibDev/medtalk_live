"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import {
  SpecialityForm,
  type SpecialityFormValue,
} from "@/components/admin/forms/SpecialityForm";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import { RowActions } from "@/components/admin/RowActions";
import type { Speciality } from "@/components/admin/model";

export function SpecialitiesPage() {
  const { faculty, specialities, setSpecialities, setFaculty } = useAdminData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Speciality | undefined>();
  const rows = useMemo(
    () =>
      specialities.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [specialities, search],
  );

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }
  function saveSpeciality(value: SpecialityFormValue) {
    if (editing) {
      setSpecialities((current) =>
        current.map((item) =>
          item.id === editing.id ? { ...item, ...value } : item,
        ),
      );
      if (editing.name !== value.name)
        setFaculty((current) =>
          current.map((member) =>
            member.speciality === editing.name
              ? { ...member, speciality: value.name }
              : member,
          ),
        );
    } else
      setSpecialities((current) => [{ ...value, id: Date.now() }, ...current]);
    closeForm();
  }
  function deleteSpeciality(item: Speciality) {
    const next = specialities.filter((speciality) => speciality.id !== item.id);
    const replacement = next[0]?.name || "Other";
    setFaculty((current) =>
      current.map((member) =>
        member.speciality === item.name
          ? { ...member, speciality: replacement }
          : member,
      ),
    );
    setSpecialities(next);
  }

  return (
    <>
      <PageHeading
        // eyebrow="FACULTY SETTINGS"
        title="Specialities"
        // description="Manage the speciality options used across faculty profiles and videos."
        action={
          <button
            className="primary"
            type="button"
            onClick={() => {
              setEditing(undefined);
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
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search specialities..."
          />
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SPECIALITY NAME</th>
                <th>FACULTY MEMBERS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    {
                      faculty.filter(
                        (member) => member.speciality === item.name,
                      ).length
                    }
                  </td>
                  <td className="action-cell">
                    <RowActions
                      label={item.name}
                      onEdit={() => {
                        setEditing(item);
                        setFormOpen(true);
                      }}
                      onDelete={
                        specialities.length > 1
                          ? () => deleteSpeciality(item)
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty-state">
              No specialities match your search.
            </div>
          )}
        </div>
      </section>
      {formOpen && (
        <SpecialityForm
          initial={editing}
          existingNames={specialities.map((item) => item.name)}
          onSave={saveSpeciality}
          onCancel={closeForm}
        />
      )}
    </>
  );
}
