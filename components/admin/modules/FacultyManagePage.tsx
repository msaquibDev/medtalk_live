"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { SelectField } from "@/components/admin/SelectField";
import { initialUsers } from "@/components/admin/model";

type Video = { id: number; title: string; speciality: string; link: string; type: string; amount: string };

export function FacultyManagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { faculty } = useAdminData();
  const member = faculty.find((item) => item.id === Number(id));
  const [tab, setTab] = useState("Videos");
  const [adding, setAdding] = useState(false);
  const [videos, setVideos] = useState<Video[]>([
    { id: 1, title: "Robotic surgery: the next frontier", speciality: "Uro-Oncology", link: "https://video.meditalk.in/robotics", type: "Free", amount: "Free" },
    { id: 2, title: "A practical guide to ureteroscopy", speciality: "Endourology", link: "https://video.meditalk.in/ureteroscopy", type: "Paid", amount: "INR 499" },
  ]);

  if (!member) return <div className="empty-route"><h1>Faculty member not found</h1><button className="secondary" onClick={() => router.push("/faculty")}>Back to faculty</button></div>;
  function addVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = String(data.get("type"));
    setVideos((current) => [{ id: Date.now(), title: String(data.get("title")), speciality: String(data.get("speciality")), link: String(data.get("link")), type, amount: type === "Free" ? "Free" : `INR ${data.get("amount") || 0}` }, ...current]);
    setAdding(false);
  }

  return <>
    <button className="back-link" onClick={() => router.push("/faculty")}>Back to faculty</button>
    <div className="manage-heading"><div><div className="eyebrow">FACULTY MANAGEMENT</div><h1>{member.name}</h1><p>{member.speciality} | {member.institute}</p></div><span className="status-pill active-pill"><i/>Active</span></div>
    <div className="manage-tabs">{["Videos", "Registered users"].map((item)=><button type="button" key={item} className={tab===item?"selected":""} onClick={()=>setTab(item)}>{item}</button>)}</div>
    <section className="panel manage-panel"><div className="manage-panel-head"><div><h2>{tab}</h2><p>{tab === "Videos" ? "Educational videos published by this faculty member." : "People who registered for this faculty content."}</p></div>{tab === "Videos" && <button className="primary" type="button" onClick={()=>setAdding((value)=>!value)}>+ Add video</button>}</div>
      {adding && tab === "Videos" && <form className="video-form" onSubmit={addVideo}><label className="field"><span>Video title</span><input name="title" required placeholder="Video title"/></label><label className="field"><span>Speciality</span><SelectField name="speciality" defaultValue={member.speciality} options={[member.speciality,"Uro-Oncology","Endourology","Andrology"].filter((value,index,array)=>array.indexOf(value)===index).map((value)=>({label:value,value}))}/></label><label className="field"><span>Video link</span><input name="link" type="url" required placeholder="https://"/></label><label className="field"><span>Access type</span><SelectField name="type" defaultValue="Free" options={["Free","Paid"].map((value)=>({label:value,value}))}/></label><label className="field"><span>Amount (INR)</span><input name="amount" type="number" min="0" placeholder="0"/></label><div className="video-form-actions"><button type="button" className="secondary" onClick={()=>setAdding(false)}>Cancel</button><button className="primary">Save video</button></div></form>}
      {tab === "Videos" && <div className="video-list">{videos.map((video)=><article className="video-row" key={video.id}><div className="video-thumb"><VideoIcon/></div><div className="video-copy"><strong>{video.title}</strong><small>{video.speciality} | {video.amount}</small><a href={video.link} target="_blank" rel="noreferrer">{video.link}</a></div><button className="manage-button" type="button" onClick={()=>setVideos((current)=>current.filter((item)=>item.id!==video.id))}>Remove</button></article>)}</div>}
      {tab === "Registered users" && <div className="table-scroll"><table><thead><tr><th>FULL NAME</th><th>EMAIL ADDRESS</th><th>MOBILE</th><th>REGISTERED AT</th></tr></thead><tbody>{initialUsers.slice(0,4).map((user)=><tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.mobile}</td><td>{user.registeredAt}</td></tr>)}</tbody></table></div>}
    </section>
  </>;
}

function VideoIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></svg>; }
