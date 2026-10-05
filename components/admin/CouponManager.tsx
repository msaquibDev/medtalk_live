"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Field } from "@/components/admin/PageHeading";
import { SelectField } from "@/components/admin/SelectField";
import { ExportButton, TableToolbar } from "@/components/admin/TableToolbar";

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
    const suffix = Array.from(
      { length: 6 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
    code = `${prefix}${prefix ? "-" : ""}${suffix}`;
  } while (existing.has(code));
  existing.add(code);
  return code;
}

export function CouponManager({
  coupons,
  onCreate,
  onUpdate,
  onExport,
}: CouponManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | undefined>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [quantity, setQuantity] = useState("5");
  const [prefix, setPrefix] = useState("");
  const rows = useMemo(
    () =>
      coupons.filter(
        (coupon) =>
          `${coupon.code} ${coupon.userName} ${coupon.status}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (filter === "All statuses" || coupon.status === filter),
      ),
    [coupons, search, filter],
  );
  function openCreate() {
    setEditing(undefined);
    setQuantity("5");
    setPrefix("");
    setFormOpen(true);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (editing) {
      onUpdate(editing.id, {
        code: String(data.get("code")).toUpperCase(),
        userName: String(data.get("userName")),
        status: String(data.get("status")) as Coupon["status"],
      });
    } else {
      const existing = new Set(
        coupons.map((coupon) => coupon.code.toUpperCase()),
      );
      const count = Math.max(
        1,
        Math.min(500, Number(data.get("quantity")) || 1),
      );
      const safePrefix = String(data.get("prefix") || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      onCreate(
        Array.from(
          { length: count },
          (_, index): Coupon => ({
            id: Date.now() + index,
            code: makeCode(safePrefix, existing),
            userName: "-",
            status: "Active",
          }),
        ),
      );
    }
    setFormOpen(false);
    setEditing(undefined);
  }
  return (
    <div className="coupon-manager">
      <div className="coupon-toolbar">
        <div className="coupon-summary">
          <strong>{coupons.length}</strong>
          <span>coupons generated</span>
        </div>
        <div className="coupon-toolbar-actions">
          <ExportButton onClick={onExport} />
          <button type="button" className="primary" onClick={openCreate}>
            <Plus size={16} /> Add coupons
          </button>
        </div>
      </div>
      <TableToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search coupons..."
        filter={filter}
        onFilter={setFilter}
        filterOptions={["All statuses", "Active", "Redeemed", "Expired"].map(
          (value) => ({ label: value, value }),
        )}
      />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>COUPON CODE</th>
              <th>ASSIGNED TO</th>
              <th>STATUS</th>
              <th>CREATED / REDEEMED</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((coupon) => (
              <tr key={coupon.id}>
                <td>
                  <code className="coupon-code">{coupon.code}</code>
                </td>
                <td>{coupon.userName}</td>
                <td>
                  <span
                    className={`status-pill ${coupon.status.toLowerCase()}-pill`}
                  >
                    <i />
                    {coupon.status}
                  </span>
                </td>
                <td>
                  <small className="muted">
                    {coupon.date || "Oct 04, 2026"}
                  </small>
                </td>
                <td>
                  <button
                    type="button"
                    className="manage-button"
                    onClick={() => {
                      setEditing(coupon);
                      setFormOpen(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="empty-state">No coupons match your search.</div>
        )}
      </div>
      <div className="coupon-note">
        Coupon codes are frontend demo data until the API is connected.
      </div>
      {formOpen && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setFormOpen(false);
              setEditing(undefined);
            }
          }}
        >
          <form className="drawer" onSubmit={submit}>
            <div className="drawer-head">
              <div>
                {/* <div className="eyebrow">COUPON MANAGEMENT</div> */}
                <h2>{editing ? "Edit Coupon" : "Add Coupons"}</h2>
                {/* <p>
                  {editing
                    ? "Update the coupon details and status."
                    : "Generate a batch of unique coupon codes."}
                </p> */}
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(undefined);
                }}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
            {editing ? (
              <>
                <Field label="Coupon code" required>
                  <input name="code" defaultValue={editing.code} required />
                </Field>
                <Field label="Assigned to">
                  <input name="userName" defaultValue={editing.userName} />
                </Field>
                <Field label="Status">
                  <SelectField
                    name="status"
                    defaultValue={editing.status}
                    options={["Active", "Redeemed", "Expired"].map((value) => ({
                      label: value,
                      value,
                    }))}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Number of coupons" required>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                  />
                </Field>
                <Field label="Code prefix">
                  <input
                    name="prefix"
                    value={prefix}
                    onChange={(event) =>
                      setPrefix(event.target.value.toUpperCase())
                    }
                    maxLength={10}
                    placeholder="Optional, e.g. URO26"
                  />
                </Field>
                <small className="drawer-hint">
                  You can generate up to 500 coupons per batch.
                </small>
              </>
            )}
            <div className="drawer-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(undefined);
                }}
              >
                Cancel
              </button>
              <button className="primary">
                {editing ? "Save changes" : "Generate coupons"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
