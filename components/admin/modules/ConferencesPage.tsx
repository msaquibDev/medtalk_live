"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { ConferenceForm, type ConferenceFormValue } from "@/components/admin/forms/ConferenceForm";
import { ConferenceTable } from "@/components/admin/tables/ConferenceTable";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import type { Conference } from "@/components/admin/model";

export function ConferencesPage() {
  const { conferences, setConferences } = useAdminData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Conference | undefined>();
  const rows = useMemo(() => conferences.filter((conference) => `${conference.name} ${conference.venue} ${conference.status}`.toLowerCase().includes(search.toLowerCase())), [conferences, search]);

  function saveConference(value: ConferenceFormValue) {
    if (editing) setConferences((current) => current.map((conference) => conference.id === editing.id ? { ...conference, ...value } : conference));
    else setConferences((current) => [{ ...value, id: Date.now(), status: "Upcoming", attendees: 0 }, ...current]);
    closeForm();
  }
  function closeForm() { setFormOpen(false); setEditing(undefined); }

  return <>
    <PageHeading eyebrow="EVENT MANAGEMENT" title="Conferences" description="Create and manage online and in-person medical events." action={<button className="primary" type="button" onClick={() => setFormOpen(true)}>+ Add conference</button>} />
    <div className="metric-strip"><strong>{conferences.length} <small>all conferences</small></strong><span>{conferences.filter((conference) => conference.status === "Upcoming").length} upcoming</span><SearchField value={search} onChange={setSearch} placeholder="Search conferences..." /></div>
    <section className="panel table-panel"><ConferenceTable rows={rows} onEdit={(conference) => { setEditing(conference); setFormOpen(true); }} onDelete={(id) => setConferences((current) => current.filter((conference) => conference.id !== id))} /></section>
    {formOpen && <ConferenceForm initial={editing} onSave={saveConference} onCancel={closeForm} />}
  </>;
}
