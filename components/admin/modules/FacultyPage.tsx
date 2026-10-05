"use client";

import { useMemo, useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { FacultyForm, type FacultyFormValue } from "@/components/admin/forms/FacultyForm";
import { FacultyTable } from "@/components/admin/tables/FacultyTable";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";
import type { Faculty } from "@/components/admin/model";

export function FacultyPage() {
  const { faculty, setFaculty } = useAdminData();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | undefined>();
  const rows = useMemo(() => faculty.filter((member) => `${member.name} ${member.email} ${member.speciality} ${member.institute}`.toLowerCase().includes(search.toLowerCase())), [faculty, search]);

  function closeForm() { setFormOpen(false); setEditing(undefined); }
  function saveFaculty(value: FacultyFormValue) {
    if (editing) setFaculty((current) => current.map((member) => member.id === editing.id ? { ...member, ...value } : member));
    else setFaculty((current) => [{ ...value, id: Date.now() }, ...current]);
    closeForm();
  }

  return <>
    <PageHeading eyebrow="EXPERT NETWORK" title="Faculty" description="Build your faculty network and manage educational content." action={<button className="primary" type="button" onClick={() => setFormOpen(true)}>+ Add faculty</button>} />
    <div className="metric-strip"><strong>{faculty.length} <small>faculty members</small></strong><span>Across 12 specialities</span><SearchField value={search} onChange={setSearch} placeholder="Search faculty..." /></div>
    <section className="panel table-panel"><FacultyTable rows={rows} onEdit={(member) => { setEditing(member); setFormOpen(true); }} onDelete={(id) => setFaculty((current) => current.filter((member) => member.id !== id))} /></section>
    {formOpen && <FacultyForm initial={editing} onSave={saveFaculty} onCancel={closeForm} />}
  </>;
}
