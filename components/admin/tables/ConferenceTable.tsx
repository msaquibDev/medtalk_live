"use client";

import Image from "next/image";
import Link from "next/link";
import { Conference } from "@/components/admin/model";
import { RowActions } from "@/components/admin/RowActions";

export function ConferenceTable({ rows, onEdit, onDelete, compact = false }: { rows: Conference[]; onEdit?: (conference: Conference) => void; onDelete?: (id: number) => void; compact?: boolean }) {
  return <div className="table-scroll"><table><thead><tr><th>CONFERENCE NAME</th><th>DATE &amp; TIME</th><th>VENUE</th><th>AMOUNT</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><div className="event-name"><Image src={row.banner || "/conference-placeholder.svg"} alt={`${row.name} banner`} width={56} height={42} unoptimized className="conference-table-image" /><span><strong>{row.name}</strong><small>{row.attendees.toLocaleString()} registered</small></span></div></td><td>{row.start}</td><td>{row.venue}</td><td>{row.amount}</td><td><span className={`status-pill ${row.status.toLowerCase()}-pill`}><i/>{row.status}</span></td><td className="action-cell">{compact ? <Link className="manage-button" href={`/conferences/${row.id}`}>Manage</Link> : <RowActions label={row.name} manageHref={`/conferences/${row.id}`} onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row.id)}/>}</td></tr>)}</tbody></table>{rows.length===0&&<div className="empty-state">No conferences match your search.</div>}</div>;
}
