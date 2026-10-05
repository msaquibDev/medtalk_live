"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { initialUsers } from "@/components/admin/model";
import { VideoForm, type FacultyVideo } from "@/components/admin/forms/VideoForm";
import { RowActions } from "@/components/admin/RowActions";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { downloadCsv } from "@/lib/csv";

const demoVideos: FacultyVideo[] = [
  { id: 1, title: "Robotic surgery: the next frontier", speciality: "Uro-Oncology", link: "https://video.meditalk.in/robotics", type: "Free", amount: "Free" },
  { id: 2, title: "A practical guide to ureteroscopy", speciality: "Endourology", link: "https://video.meditalk.in/ureteroscopy", type: "Paid", amount: "INR 499" },
];

export function FacultyManagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { faculty, specialities } = useAdminData();
  const member = faculty.find((item) => item.id === Number(id));
  const [tab, setTab] = useState("Videos");
  const [videos, setVideos] = useState(demoVideos);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FacultyVideo | undefined>();
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("All access");
  const videoRows = useMemo(() => videos, [videos]);
  const registrationRows = useMemo(() => initialUsers.slice(0, 4).map((user, index) => ({ ...user, access: index === 1 ? "INR 499" : "Free" })).filter((user) => `${user.name} ${user.email} ${user.mobile}`.toLowerCase().includes(userSearch.toLowerCase()) && (userFilter === "All access" || (userFilter === "Free" ? user.access === "Free" : user.access !== "Free"))), [userSearch, userFilter]);

  function saveVideo(value: Omit<FacultyVideo, "id">) { if (editing) setVideos((current) => current.map((video) => video.id === editing.id ? { ...video, ...value } : video)); else setVideos((current) => [{ ...value, id: Date.now() }, ...current]); setFormOpen(false); setEditing(undefined); }
  function exportUsers() { downloadCsv(`meditalk-${member?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-registrations.csv`, [["Full name", "Email", "Mobile", "Registered at", "Amount paid"], ...registrationRows.map((user) => [user.name, user.email, user.mobile, user.registeredAt, user.access])]); }

  if (!member) return <div className="empty-route"><h1>Faculty member not found</h1><button className="secondary" onClick={() => router.push("/faculty")}>Back to faculty</button></div>;
  return <>
    <button className="back-link" onClick={() => router.push("/faculty")}>Back to faculty</button>
    <div className="manage-heading"><div><h1>{member.name}</h1><p>{member.speciality} | {member.institute}</p></div><span className="status-pill active-pill"><i/>Active</span></div>
    <div className="manage-tabs">{["Videos", "Registered users"].map((item) => <button type="button" key={item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
    <section className="panel manage-panel"><div className="manage-panel-head"><div><h2>{tab}</h2><p>{tab === "Videos" ? "Educational videos published by this faculty member." : "People who registered for this faculty content."}</p></div>{tab === "Videos" && <button className="primary" type="button" onClick={() => { setEditing(undefined); setFormOpen(true); }}>+ Add video</button>}</div>
      {tab === "Videos" && <div className="table-scroll"><table><thead><tr><th>VIDEO TITLE</th><th>SPECIALITY</th><th>VIDEO LINK</th><th>ACCESS</th><th>ACTION</th></tr></thead><tbody>{videoRows.map((video) => <tr key={video.id}><td><strong>{video.title}</strong></td><td><span className="speciality">{video.speciality}</span></td><td><a className="table-link" href={video.link} target="_blank" rel="noreferrer">{video.link}</a></td><td>{video.amount}</td><td className="action-cell"><RowActions label={video.title} onEdit={() => { setEditing(video); setFormOpen(true); }} onDelete={() => setVideos((current) => current.filter((item) => item.id !== video.id))}/></td></tr>)}</tbody></table>{videoRows.length===0 && <div className="empty-state">No videos have been added yet.</div>}</div>}
      {tab === "Registered users" && <><TableToolbar search={userSearch} onSearch={setUserSearch} placeholder="Search registered users..." filter={userFilter} onFilter={setUserFilter} filterOptions={["All access", "Paid", "Free"].map((value) => ({ label: value, value }))} onExport={exportUsers}/><div className="table-scroll"><table><thead><tr><th>FULL NAME</th><th>EMAIL ADDRESS</th><th>MOBILE</th><th>REGISTERED AT</th><th>AMOUNT PAID</th></tr></thead><tbody>{registrationRows.map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.mobile}</td><td>{user.registeredAt}</td><td>{user.access}</td></tr>)}</tbody></table>{registrationRows.length===0 && <div className="empty-state">No registered users match your search.</div>}</div></>}
    </section>
    {formOpen && <VideoForm initial={editing} specialities={specialities} onSave={saveVideo} onCancel={() => { setFormOpen(false); setEditing(undefined); }}/>}
  </>;
}
