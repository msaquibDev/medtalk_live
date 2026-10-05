"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { initialUsers } from "@/components/admin/model";
import { PageHeading, SearchField } from "@/components/admin/PageHeading";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const rows = useMemo(() => initialUsers.filter((user) => `${user.name} ${user.email} ${user.mobile}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const allSelected = rows.length > 0 && rows.every((user) => selected.includes(user.id));
  function toggleAll(checked: boolean | "indeterminate") {
    setSelected(checked ? Array.from(new Set([...selected, ...rows.map((row) => row.id)])) : selected.filter((id) => !rows.some((row) => row.id === id)));
  }
  return <>
    <PageHeading eyebrow="COMMUNITY" title="Registered users" description="Browse people who have joined your Meditalk events." action={<button className="secondary" type="button">Download CSV</button>} />
    <div className="metric-strip"><strong>1,284 <small>total users</small></strong><span>+12.8% <small>compared to last month</small></span><SearchField value={search} onChange={setSearch} placeholder="Search users..." /></div>
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all visible users" /></th><th>FULL NAME</th><th>EMAIL ADDRESS</th><th>MOBILE</th><th>REGISTERED AT</th><th>STATUS</th></tr></thead><tbody>{rows.map((user, index) => <tr key={user.id}><td><Checkbox checked={selected.includes(user.id)} onCheckedChange={(checked) => setSelected(checked ? [...selected, user.id] : selected.filter((id) => id !== user.id))} aria-label={`Select ${user.name}`} /></td><td><span className="person"><span className={`mini-avatar c${index % 4}`}>{user.name.split(" ").slice(1).map((part) => part[0]).join("").slice(0,2)}</span><strong>{user.name}</strong></span></td><td>{user.email}</td><td>{user.mobile}</td><td>{user.registeredAt}</td><td><span className="status-pill active-pill"><i/>Active</span></td></tr>)}</tbody></table>{rows.length===0&&<div className="empty-state">No users match your search.</div>}</div><div className="table-footer">Showing {rows.length} users <div className="pagination"><button type="button">Previous</button><button type="button" className="current">1</button><button type="button">Next</button></div></div></section>
  </>;
}
