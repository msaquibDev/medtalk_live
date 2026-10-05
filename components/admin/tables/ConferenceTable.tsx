"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Conference } from "@/components/admin/model";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ConferenceTable({ rows, onEdit, onDelete, compact = false }: { rows: Conference[]; onEdit?: (conference: Conference) => void; onDelete?: (id: number) => void; compact?: boolean }) {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  return <div className="table-scroll"><table><thead><tr><th>CONFERENCE NAME</th><th>DATE &amp; TIME</th><th>VENUE</th><th>AMOUNT</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><div className="event-name"><Image src={row.banner || "/conference-placeholder.svg"} alt={`${row.name} banner`} width={56} height={42} unoptimized className="conference-table-image" /><span><strong>{row.name}</strong><small>{row.attendees.toLocaleString()} registered</small></span></div></td><td>{row.start}</td><td>{row.venue}</td><td>{row.amount}</td><td><span className={`status-pill ${row.status.toLowerCase()}-pill`}><i/>{row.status}</span></td><td className="action-cell">{compact ? <Link className="manage-button" href={`/conferences/${row.id}`}>Manage</Link> : <Popover open={openMenu===row.id} onOpenChange={(open)=>setOpenMenu(open?row.id:null)}><PopoverTrigger asChild><button className="dots-button" type="button" aria-label={`Actions for ${row.name}`}><MoreHorizontal size={20}/></button></PopoverTrigger><PopoverContent align="end" className="action-menu-popover"><button type="button" onClick={()=>{onEdit?.(row);setOpenMenu(null)}}>Edit details</button><Link href={`/conferences/${row.id}`}>Manage</Link><button className="danger" type="button" onClick={()=>{onDelete?.(row.id);setOpenMenu(null)}}>Delete</button></PopoverContent></Popover>}</td></tr>)}</tbody></table>{rows.length===0&&<div className="empty-state">No conferences match your search.</div>}</div>;
}
