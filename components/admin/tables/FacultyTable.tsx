"use client";

import type { Faculty } from "@/components/admin/model";
import { RowActions } from "@/components/admin/RowActions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function FacultyTable({ rows, onEdit, onDelete }: { rows: Faculty[]; onEdit: (faculty: Faculty) => void; onDelete: (id: number) => void }) {
  return <div className="table-scroll"><table><thead><tr><th>FACULTY NAME</th><th>EMAIL</th><th>MOBILE</th><th>HOSPITAL / INSTITUTE</th><th>SPECIALITY</th><th>ACTION</th></tr></thead><tbody>{rows.map((row,index)=><tr key={row.id}><td><span className="person"><span className={`mini-avatar c${index%4}`}>{row.name.split(" ").slice(1).map((part)=>part[0]).join("").slice(0,2)}</span><strong>{row.name}</strong></span></td><td>{row.email}</td><td>{row.phone}</td><td>{row.institute}</td><td><span className="speciality">{row.speciality}</span></td><td className="action-cell"><RowActions label={row.name} manageHref={`/faculty/${row.id}`} manageLabel="Manage" onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)}/></td></tr>)}</tbody></table>{rows.length===0&&<div className="empty-state">No faculty members match your search.</div>}</div>;
}
