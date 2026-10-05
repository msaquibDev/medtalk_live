"use client";

import { useMemo, useState } from "react";
import { SelectField } from "@/components/admin/SelectField";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import {
  ConferenceForm,
  type ConferenceFormValue,
} from "@/components/admin/forms/ConferenceForm";
import { ConferenceTable } from "@/components/admin/tables/ConferenceTable";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import type { Conference } from "@/components/admin/model";

export function ConferencesPage() {
  const { conferences, setConferences } = useAdminData();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Conference | undefined>();
  const rows = useMemo(
    () =>
      conferences.filter(
        (conference) =>
          `${conference.name} ${conference.venue} ${conference.status}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (status === "All statuses" || conference.status === status),
      ),
    [conferences, search, status],
  );

  function saveConference(value: ConferenceFormValue) {
    if (editing)
      setConferences((current) =>
        current.map((conference) =>
          conference.id === editing.id
            ? { ...conference, ...value }
            : conference,
        ),
      );
    else
      setConferences((current) => [
        { ...value, id: Date.now(), status: "Upcoming", attendees: 0 },
        ...current,
      ]);
    closeForm();
  }
  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }

  return (
    <>
      <PageHeading
        title="Conferences"
        action={
          <button
            className="primary"
            type="button"
            onClick={() => setFormOpen(true)}
          >
            + Add conference
          </button>
        }
      />
      <div className="metric-strip">
        <strong>
          {conferences.length} <small>all conferences</small>
        </strong>
        <span>
          {
            conferences.filter((conference) => conference.status === "Upcoming")
              .length
          }{" "}
          upcoming
        </span>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search conferences..."
        />
        <SelectField
          name="conference-status-filter"
          value={status}
          onValueChange={setStatus}
          options={["All statuses", "Upcoming", "Live", "Recorded"].map(
            (value) => ({ label: value, value }),
          )}
          className="conference-filter-select"
        />
      </div>
      <section className="panel table-panel">
        <ConferenceTable
          rows={rows}
          onEdit={(conference) => {
            setEditing(conference);
            setFormOpen(true);
          }}
          onDelete={(id) =>
            setConferences((current) =>
              current.filter((conference) => conference.id !== id),
            )
          }
        />
      </section>
      {formOpen && (
        <ConferenceForm
          initial={editing}
          onSave={saveConference}
          onCancel={closeForm}
        />
      )}
    </>
  );
}
