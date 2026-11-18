"use client";

import Link from "next/link";
import { Eye, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function RowActions({ label, manageHref, manageLabel = "Manage", onView, onEdit, onDelete, deleteDescription }: { label: string; manageHref?: string; manageLabel?: string; onView?: () => void; onEdit?: () => void; onDelete?: () => void; deleteDescription?: string }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return <>
    <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button className="dots-button" type="button" aria-label={`Actions for ${label}`}><MoreHorizontal size={19}/></button></PopoverTrigger><PopoverContent align="end" className="action-menu-popover">{onView && <button type="button" onClick={() => { setOpen(false); onView(); }}><Eye size={14}/>View</button>}{onEdit && <button type="button" onClick={() => { setOpen(false); onEdit(); }}>Edit</button>}{manageHref && <Link href={manageHref} onClick={() => setOpen(false)}>{manageLabel}</Link>}{onDelete && <button className="danger" type="button" onClick={() => { setOpen(false); setConfirming(true); }}>Delete</button>}</PopoverContent></Popover>
    {confirming && <ConfirmDialog title={`Delete ${label}?`} description={deleteDescription || "This item will be removed from the admin list."} onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); onDelete?.(); }}/>}
  </>;
}
