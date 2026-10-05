"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Faculty } from "@/components/admin/model";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function FacultyTable({ rows, onEdit, onDelete }: { rows: Faculty[]; onEdit: (faculty: Faculty) => void; onDelete: (id: number) => void }) {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  return <div className="table-scroll"><table><thead><tr><th>FACULTY NAME</th><th>EMAIL</th><th>MOBILE</th><th>HOSPITAL / INSTITUTE</th><th>SPECIALITY</th><th>ACTION</th></tr></thead><tbody>{rows.map((row,index)=><tr key={row.id}><td><span className="person"><span className={`mini-avatar c${index%4}`}>{row.name.split(" ").slice(1).map((part)=>part[0]).join("").slice(0,2)}</span><strong>{row.name}</strong></span></td><td>{row.email}</td><td>{row.phone}</td><td>{row.institute}</td><td><span className="speciality">{row.speciality}</span></td><td className="action-cell"><Link className="manage-button" href={`/faculty/${row.id}`}>Manage</Link><Popover open={openMenu===row.id} onOpenChange={(open)=>setOpenMenu(open?row.id:null)}><PopoverTrigger asChild><button className="dots-button" type="button" aria-label={`Actions for ${row.name}`}><MoreHorizontal size={18}/></button></PopoverTrigger><PopoverContent align="end" className="action-menu-popover"><button type="button" onClick={()=>{onEdit(row);setOpenMenu(null)}}>Edit details</button><Link href={`/faculty/${row.id}`}>Manage faculty</Link><button className="danger" type="button" onClick={()=>{onDelete(row.id);setOpenMenu(null)}}>Delete</button></PopoverContent></Popover></td></tr>)}</tbody></table>{rows.length===0&&<div className="empty-state">No faculty members match your search.</div>}</div>;
}
