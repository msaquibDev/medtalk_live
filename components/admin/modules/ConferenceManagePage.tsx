"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { CouponManager } from "@/components/admin/CouponManager";
import { initialUsers } from "@/components/admin/model";

const tabs = ["Halls & video link", "Live Q&A", "Registered users", "Coupons"];

export function ConferenceManagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { conferences, couponsByConference, setCouponsByConference } = useAdminData();
  const conference = conferences.find((item) => item.id === Number(id));
  const [tab, setTab] = useState(tabs[0]);
  const [hallRows, setHallRows] = useState([["Main Auditorium", "meet.meditalk.in/main", "Live"], ["Workshop Room A", "meet.meditalk.in/workshop-a", "Upcoming"]]);
  const [addingHall, setAddingHall] = useState(false);
  const [hallName, setHallName] = useState("");
  const [hallLink, setHallLink] = useState("");
  const [questions, setQuestions] = useState([["When should patients begin screening?", "Dr. Ananya Bose", "2 min ago"], ["What is the role of robotic surgery?", "Dr. Vikram Rao", "18 min ago"], ["Can you share the latest guidelines?", "Dr. Kavita Shah", "42 min ago"]]);

  function downloadCoupons() {
    const rows = [["Coupon code", "Assigned to", "Status", "Date"], ...coupons.map((coupon) => [coupon.code, coupon.userName, coupon.status, coupon.date || ""])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "meditalk-coupons.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!conference) return <div className="empty-route"><h1>Conference not found</h1><button className="secondary" onClick={() => router.push("/conferences")}>Back to conferences</button></div>;
  const coupons = couponsByConference[conference.id] || [];
  return <>
    <button className="back-link" onClick={() => router.push("/conferences")}>Back to conferences</button>
    <div className="manage-heading"><div><div className="eyebrow">CONFERENCE MANAGEMENT</div><h1>{conference.name}</h1><p>{conference.start} | {conference.venue}</p></div><span className={`status-pill ${conference.status.toLowerCase()}-pill`}><i/>{conference.status}</span></div>
    <div className="manage-tabs">{tabs.map((item) => <button type="button" key={item} className={tab===item?"selected":""} onClick={()=>setTab(item)}>{item}{item==="Live Q&A"&&<span className="tab-count">{questions.length}</span>}</button>)}</div>
    <section className="panel manage-panel"><div className="manage-panel-head"><div><h2>{tab}</h2><p>{tab === "Halls & video link" ? "Set up rooms and streaming links for this conference." : tab === "Live Q&A" ? "Review questions submitted by your attendees." : tab === "Registered users" ? "Attendees registered for this event." : "Generate, assign and update coupon codes."}</p></div>{tab === "Halls & video link" && <button className="primary" type="button" onClick={()=>setAddingHall((open)=>!open)}>+ Add hall</button>}</div>
      {tab === "Halls & video link" && <>{addingHall&&<form className="inline-form" onSubmit={(event)=>{event.preventDefault();setHallRows((current)=>[[hallName,hallLink,"Upcoming"],...current]);setHallName("");setHallLink("");setAddingHall(false)}}><input value={hallName} onChange={(event)=>setHallName(event.target.value)} placeholder="Hall name" required/><input value={hallLink} onChange={(event)=>setHallLink(event.target.value)} placeholder="Streaming link" required/><button className="primary">Save hall</button></form>}<div className="table-scroll"><table><thead><tr><th>HALL NAME</th><th>STREAMING LINK</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{hallRows.map((hall,index)=><tr key={`${hall[0]}-${index}`}><td><strong>{hall[0]}</strong></td><td>{hall[1]}</td><td><span className={`status-pill ${hall[2].toLowerCase()}-pill`}><i/>{hall[2]}</span></td><td><button type="button" className="manage-button" onClick={()=>setHallRows((current)=>current.filter((_,row)=>row!==index))}>Remove</button></td></tr>)}</tbody></table></div></>}
      {tab === "Live Q&A" && <div className="qa-list">{questions.map((question,index)=><div className="qa-item" key={index}><div className="question-mark">Q</div><div className="qa-body"><strong>{question[0]}</strong><small>{question[1]} | {question[2]}</small></div><button type="button" className="secondary small" onClick={()=>setQuestions((current)=>current.filter((_,row)=>row!==index))}>Mark answered</button></div>)}</div>}
      {tab === "Registered users" && <div className="table-scroll"><table><thead><tr><th>FULL NAME</th><th>EMAIL ADDRESS</th><th>REGISTERED AT</th><th>STATUS</th></tr></thead><tbody>{initialUsers.slice(0,5).map((user)=><tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.registeredAt}</td><td><span className="status-pill active-pill"><i/>Confirmed</span></td></tr>)}</tbody></table></div>}
      {tab === "Coupons" && <CouponManager coupons={coupons} onCreate={(batch)=>setCouponsByConference((current)=>({...current,[conference.id]:[...batch,...(current[conference.id]||[])]}))} onUpdate={(couponId,changes)=>setCouponsByConference((current)=>({...current,[conference.id]:(current[conference.id]||[]).map((coupon)=>coupon.id===couponId?{...coupon,...changes}:coupon)}))} onExport={downloadCoupons} />}
    </section>
  </>;
}
