"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Conference, Faculty } from "@/components/admin/model";
import { initialConferences, initialFaculty } from "@/components/admin/model";
import type { Coupon } from "@/components/admin/CouponManager";

type AdminData = {
  conferences: Conference[];
  setConferences: Dispatch<SetStateAction<Conference[]>>;
  faculty: Faculty[];
  setFaculty: Dispatch<SetStateAction<Faculty[]>>;
  couponsByConference: Record<number, Coupon[]>;
  setCouponsByConference: Dispatch<SetStateAction<Record<number, Coupon[]>>>;
};

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [conferences, setConferences] = useState(initialConferences);
  const [faculty, setFaculty] = useState(initialFaculty);
  const [couponsByConference, setCouponsByConference] = useState<Record<number, Coupon[]>>({
    1: [
      { id: 101, code: "AX72BZ", userName: "Mintu Nath", status: "Redeemed", date: "Oct 02, 11:42 AM" },
      { id: 102, code: "URO26VIP", userName: "Dr. Raj Malhotra", status: "Active", date: "Oct 03, 2026" },
      { id: 103, code: "MEDI2026", userName: "Dr. S. Reddy", status: "Active", date: "Oct 04, 2026" },
    ],
  });
  const value = useMemo(() => ({ conferences, setConferences, faculty, setFaculty, couponsByConference, setCouponsByConference }), [conferences, faculty, couponsByConference]);
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const value = useContext(AdminDataContext);
  if (!value) throw new Error("useAdminData must be used within AdminDataProvider");
  return value;
}
