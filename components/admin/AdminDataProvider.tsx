"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Conference, Faculty, RegisteredUser, Speciality } from "@/components/admin/model";
import { initialConferences, initialFaculty, initialSpecialities, initialUsers } from "@/components/admin/model";
import type { Coupon } from "@/components/admin/CouponManager";

type AdminData = {
  conferences: Conference[];
  setConferences: Dispatch<SetStateAction<Conference[]>>;
  faculty: Faculty[];
  setFaculty: Dispatch<SetStateAction<Faculty[]>>;
  users: RegisteredUser[];
  setUsers: Dispatch<SetStateAction<RegisteredUser[]>>;
  specialities: Speciality[];
  setSpecialities: Dispatch<SetStateAction<Speciality[]>>;
  specialitiesLoading: boolean;
  specialitiesError: string;
  specialitiesCountWarning: string;
  refreshSpecialities: () => Promise<void>;
  couponsByConference: Record<number, Coupon[]>;
  setCouponsByConference: Dispatch<SetStateAction<Record<number, Coupon[]>>>;
};

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [conferences, setConferences] = useState(initialConferences);
  const [faculty, setFaculty] = useState(initialFaculty);
  const [users, setUsers] = useState(initialUsers);
  const [specialities, setSpecialities] = useState(initialSpecialities);
  const [specialitiesLoading, setSpecialitiesLoading] = useState(true);
  const [specialitiesError, setSpecialitiesError] = useState("");
  const [specialitiesCountWarning, setSpecialitiesCountWarning] = useState("");
  const [couponsByConference, setCouponsByConference] = useState<Record<number, Coupon[]>>({
    1: [
      { id: 101, code: "AX72BZ", userName: "Mintu Nath", status: "Redeemed", date: "Oct 02, 11:42 AM" },
      { id: 102, code: "URO26VIP", userName: "Dr. Raj Malhotra", status: "Active", date: "Oct 03, 2026" },
      { id: 103, code: "MEDI2026", userName: "Dr. S. Reddy", status: "Active", date: "Oct 04, 2026" },
    ],
  });

  const refreshSpecialities = useCallback(async () => {
    startTransition(() => {
      setSpecialitiesLoading(true);
      setSpecialitiesError("");
    });
    try {
      const response = await fetch("/api/admin/specialities", { cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        countWarning?: string;
        data?: { id?: unknown; name?: unknown; usersCount?: unknown; createdAt?: unknown; updatedAt?: unknown }[];
      };
      if (!response.ok || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error(payload.message || "Could not load specialities.");
      }
      const next = payload.data.flatMap((item) =>
        typeof item.id === "string" && typeof item.name === "string"
          ? [{
              id: item.id,
              name: item.name,
              ...(typeof item.usersCount === "number" ? { usersCount: item.usersCount } : {}),
              ...(typeof item.createdAt === "string" ? { createdAt: item.createdAt } : {}),
              ...(typeof item.updatedAt === "string" ? { updatedAt: item.updatedAt } : {}),
            }]
          : [],
      );
      startTransition(() => setSpecialities(next));
      startTransition(() => setSpecialitiesCountWarning(payload.countWarning || ""));
    } catch (error) {
      startTransition(() => {
        setSpecialities([]);
        setSpecialitiesError(error instanceof Error ? error.message : "Could not load specialities.");
        setSpecialitiesCountWarning("");
      });
    } finally {
      startTransition(() => setSpecialitiesLoading(false));
    }
  }, []);

  useEffect(() => {
    void refreshSpecialities();
  }, [refreshSpecialities]);

  const value = useMemo(() => ({ conferences, setConferences, faculty, setFaculty, users, setUsers, specialities, setSpecialities, specialitiesLoading, specialitiesError, specialitiesCountWarning, refreshSpecialities, couponsByConference, setCouponsByConference }), [conferences, faculty, users, specialities, specialitiesLoading, specialitiesError, specialitiesCountWarning, refreshSpecialities, couponsByConference]);
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const value = useContext(AdminDataContext);
  if (!value) throw new Error("useAdminData must be used within AdminDataProvider");
  return value;
}
