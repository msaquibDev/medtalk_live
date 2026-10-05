"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Download, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/admin/SelectField";

export type Coupon = {
  id: number;
  code: string;
  userName: string;
  status: "Active" | "Redeemed" | "Expired";
  date?: string;
};

type CouponChanges = Pick<Coupon, "code" | "userName" | "status">;
type CouponManagerProps = {
  coupons: Coupon[];
  onCreate: (coupons: Coupon[]) => void;
  onUpdate: (id: number, changes: CouponChanges) => void;
  onExport: () => void;
};

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(prefix: string, existing: Set<string>) {
  let code = "";
  do {
    const suffix = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    code = `${prefix}${prefix ? "-" : ""}${suffix}`;
  } while (existing.has(code));
  existing.add(code);
  return code;
}

/** Parent owns coupon data; these callbacks can be replaced with API mutations. */
export function CouponManager({ coupons, onCreate, onUpdate, onExport }: CouponManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [quantity, setQuantity] = useState("5");
  const [prefix, setPrefix] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<CouponChanges>({ code: "", userName: "", status: "Active" });
  const selectedCodes = new Set(coupons.map((coupon) => coupon.code.toUpperCase()));

  function createCoupons(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const count = Math.max(1, Math.min(100, Number(quantity) || 1));
    const batch = Array.from({ length: count }, (_, index): Coupon => ({
      id: Date.now() + index,
      code: makeCode(prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, ""), selectedCodes),
      userName: "-",
      status: "Active",
    }));
    onCreate(batch);
    setShowCreate(false);
  }

  function beginUpdate(coupon: Coupon) {
    setEditing(coupon.id);
    setDraft({ code: coupon.code, userName: coupon.userName, status: coupon.status });
  }

  return <div className="coupon-manager">
    <div className="coupon-toolbar"><div className="coupon-summary"><strong>{coupons.length}</strong><span>coupons generated</span></div><div className="coupon-toolbar-actions"><Button type="button" variant="outline" className="secondary" onClick={onExport}><Download size={15}/> Download CSV</Button><Button type="button" className="primary" onClick={() => setShowCreate((open) => !open)}><Plus size={16}/> Add coupons</Button></div></div>
    {showCreate && <form className="coupon-create-form" onSubmit={createCoupons}><div className="coupon-create-copy"><strong>Generate a coupon batch</strong><span>Every generated code will be unique.</span></div><label className="coupon-form-field"><span>Number of coupons</span><input type="number" min="1" max="100" value={quantity} onChange={(event) => setQuantity(event.target.value)} required/></label><label className="coupon-form-field"><span>Code prefix <small>optional</small></span><input value={prefix} onChange={(event) => setPrefix(event.target.value.toUpperCase())} maxLength={10} placeholder="Example: URO26"/></label><Button className="primary coupon-generate">Generate codes</Button></form>}
    <div className="table-scroll"><table><thead><tr><th>COUPON CODE</th><th>ASSIGNED TO</th><th>STATUS</th><th>CREATED / REDEEMED</th><th>ACTION</th></tr></thead><tbody>{coupons.map((coupon) => editing === coupon.id ? <tr key={coupon.id} className="coupon-edit-row"><td><input aria-label="Coupon code" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })}/></td><td><input aria-label="Assigned user" value={draft.userName} onChange={(event) => setDraft({ ...draft, userName: event.target.value })}/></td><td><SelectField name="status" value={draft.status} onValueChange={(status) => setDraft({ ...draft, status: status as Coupon["status"] })} options={["Active", "Redeemed", "Expired"].map((value) => ({ label: value, value }))}/></td><td><span className="muted">{coupon.date || "-"}</span></td><td className="coupon-action-buttons"><button type="button" className="manage-button" onClick={() => { onUpdate(coupon.id, draft); setEditing(null); }}>Save update</button><button type="button" className="coupon-cancel" onClick={() => setEditing(null)} aria-label="Cancel update"><X size={15}/></button></td></tr> : <tr key={coupon.id}><td><code className="coupon-code">{coupon.code}</code></td><td>{coupon.userName}</td><td><span className={`status-pill ${coupon.status.toLowerCase()}-pill`}><i/>{coupon.status}</span></td><td><small className="muted">{coupon.date || "Oct 04, 2026"}</small></td><td><button type="button" className="manage-button" onClick={() => beginUpdate(coupon)}>Update</button></td></tr>)}</tbody></table>{coupons.length===0&&<div className="empty-state">No coupons yet. Use Add coupons to create a batch.</div>}</div>
    <div className="coupon-note">Coupon codes are frontend demo data until the API is connected.</div>
  </div>;
}
