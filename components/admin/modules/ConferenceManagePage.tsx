"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { CouponManager } from "@/components/admin/CouponManager";
import { HallForm, type Hall } from "@/components/admin/forms/HallForm";
import { RowActions } from "@/components/admin/RowActions";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { downloadCsv } from "@/lib/csv";

const tabs = ["Halls & video link", "Live Q&A", "Registered users", "Coupons"];
const demoHalls: Hall[] = [
  { id: 1, name: "Main Auditorium", link: "https://meet.meditalk.in/main", status: "Active" },
  { id: 2, name: "Workshop Room A", link: "https://meet.meditalk.in/workshop-a", status: "Inactive" },
];

export function ConferenceManagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { conferences, users, couponsByConference, setCouponsByConference } = useAdminData();
  const conference = conferences.find((item) => item.id === Number(id));
  const [tab, setTab] = useState(tabs[0]);
  const [hallRows, setHallRows] = useState(demoHalls);
  const [hallFormOpen, setHallFormOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | undefined>();
  const [hallSearch, setHallSearch] = useState("");
  const [hallFilter, setHallFilter] = useState("All statuses");
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("All access");
  const [questions, setQuestions] = useState([
    ["When should patients begin screening?", "Dr. Ananya Bose", "2 min ago"],
    ["What is the role of robotic surgery?", "Dr. Vikram Rao", "18 min ago"],
    ["Can you share the latest guidelines?", "Dr. Kavita Shah", "42 min ago"],
  ]);
  const coupons = conference ? couponsByConference[conference.id] || [] : [];
  const hallList = useMemo(() => hallRows.filter((hall) => `${hall.name} ${hall.link} ${hall.status}`.toLowerCase().includes(hallSearch.toLowerCase()) && (hallFilter === "All statuses" || hall.status === hallFilter)), [hallRows, hallSearch, hallFilter]);
  const registrationRows = useMemo(() => users.slice(0, 5).map((user) => ({ ...user, access: conference?.type === "Paid" ? conference.amount : "Free" })).filter((user) => `${user.name} ${user.email} ${user.mobile}`.toLowerCase().includes(userSearch.toLowerCase()) && (userFilter === "All access" || (userFilter === "Free" ? user.access === "Free" : user.access !== "Free"))), [users, conference, userSearch, userFilter]);

  function saveHall(value: Omit<Hall, "id">) {
    if (editingHall) setHallRows((current) => current.map((hall) => hall.id === editingHall.id ? { ...hall, ...value } : hall));
    else setHallRows((current) => [{ ...value, id: Date.now() }, ...current]);
    setHallFormOpen(false); setEditingHall(undefined);
  }
  function exportUsers() {
    downloadCsv(`meditalk-${conference?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-registrations.csv`, [["Full name", "Email", "Mobile", "Registered at", "Amount paid"], ...registrationRows.map((user) => [user.name, user.email, user.mobile, user.registeredAt, user.access])]);
  }
  function exportCoupons() {
    downloadCsv("meditalk-coupons.csv", [["Coupon code", "Assigned to", "Status", "Date"], ...coupons.map((coupon) => [coupon.code, coupon.userName, coupon.status, coupon.date || ""])]);
  }

  if (!conference) return <div className="empty-route"><h1>Conference not found</h1><button className="secondary" onClick={() => router.push("/conferences")}>Back to conferences</button></div>;
  return <>
    <button className="back-link" onClick={() => router.push("/conferences")}>Back to conferences</button>
    <div className="manage-heading"><div><h1>{conference.name}</h1><p>{conference.start} | {conference.venue}</p></div><span className={`status-pill ${conference.status.toLowerCase()}-pill`}><i/>{conference.status}</span></div>
    <div className="manage-tabs">{tabs.map((item) => <button type="button" key={item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>{item}{item === "Live Q&A" && <span className="tab-count">{questions.length}</span>}</button>)}</div>
    <section className="panel manage-panel">
      <div className="manage-panel-head"><div><h2>{tab}</h2><p>{tab === "Halls & video link" ? "Set up rooms and streaming links for this conference." : tab === "Live Q&A" ? "Review questions submitted by your attendees." : tab === "Registered users" ? "Attendees registered for this event." : "Generate, assign and update coupon codes."}</p></div>{tab === "Halls & video link" && <button className="primary" type="button" onClick={() => { setEditingHall(undefined); setHallFormOpen(true); }}>+ Add hall</button>}</div>
      {tab === "Halls & video link" && <><TableToolbar search={hallSearch} onSearch={setHallSearch} placeholder="Search halls..." filter={hallFilter} onFilter={setHallFilter} filterOptions={["All statuses", "Active", "Inactive"].map((value) => ({ label: value, value }))}/><div className="table-scroll"><table><thead><tr><th>HALL NAME</th><th>STREAMING LINK</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{hallList.map((hall) => <tr key={hall.id}><td><strong>{hall.name}</strong></td><td><a className="table-link" href={hall.link} target="_blank" rel="noreferrer">{hall.link}</a></td><td><span className={`status-pill ${hall.status.toLowerCase()}-pill`}><i/>{hall.status}</span></td><td className="action-cell"><RowActions label={hall.name} onEdit={() => { setEditingHall(hall); setHallFormOpen(true); }} onDelete={() => setHallRows((current) => current.filter((item) => item.id !== hall.id))}/></td></tr>)}</tbody></table>{hallList.length === 0 && <div className="empty-state">No halls match your search.</div>}</div></>}
      {tab === "Live Q&A" && <div className="qa-list">{questions.map((question, index) => <div className="qa-item" key={index}><div className="question-mark">Q</div><div className="qa-body"><strong>{question[0]}</strong><small>{question[1]} | {question[2]}</small></div><button type="button" className="secondary small" onClick={() => setQuestions((current) => current.filter((_, row) => row !== index))}>Mark answered</button></div>)}</div>}
      {tab === "Registered users" && <><TableToolbar search={userSearch} onSearch={setUserSearch} placeholder="Search registered users..." filter={userFilter} onFilter={setUserFilter} filterOptions={["All access", "Paid", "Free"].map((value) => ({ label: value, value }))} onExport={exportUsers}/><div className="table-scroll"><table><thead><tr><th>FULL NAME</th><th>EMAIL ADDRESS</th><th>REGISTERED AT</th><th>AMOUNT PAID</th><th>STATUS</th></tr></thead><tbody>{registrationRows.map((user) => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.registeredAt}</td><td>{user.access}</td><td><span className="status-pill active-pill"><i/>Confirmed</span></td></tr>)}</tbody></table>{registrationRows.length === 0 && <div className="empty-state">No registered users match your search.</div>}</div></>}
      {tab === "Coupons" && <CouponManager coupons={coupons} onCreate={(batch) => setCouponsByConference((current) => ({ ...current, [conference.id]: [...batch, ...(current[conference.id] || [])] }))} onUpdate={(couponId, changes) => setCouponsByConference((current) => ({ ...current, [conference.id]: (current[conference.id] || []).map((coupon) => coupon.id === couponId ? { ...coupon, ...changes } : coupon) }))} onExport={exportCoupons}/>}
    </section>
    {hallFormOpen && <HallForm initial={editingHall} onSave={saveHall} onCancel={() => { setHallFormOpen(false); setEditingHall(undefined); }}/>}
  </>;
}
