"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Faculty } from "@/components/admin/model";

type FacultyManagementValue = {
  faculty: Faculty[];
  loading: boolean;
  error: string;
  refreshFaculty: () => Promise<void>;
};

const FacultyManagementContext = createContext<FacultyManagementValue | null>(null);

export function FacultyManagementProvider({ children }: { children: ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshFaculty = useCallback(async () => {
    startTransition(() => {
      setLoading(true);
      setError("");
    });
    try {
      const response = await fetch("/api/admin/faculties", { cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        data?: unknown;
      };
      if (!response.ok || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error(payload.message || "Could not load faculty members.");
      }
      const records = payload.data.filter((item): item is Faculty =>
        Boolean(item) && typeof item === "object" &&
        typeof (item as Faculty).id === "string" &&
        typeof (item as Faculty).name === "string" &&
        typeof (item as Faculty).email === "string" &&
        typeof (item as Faculty).phone === "string" &&
        typeof (item as Faculty).institute === "string" &&
        typeof (item as Faculty).speciality === "string" &&
        typeof (item as Faculty).specialityId === "string",
      );
      startTransition(() => setFaculty(records));
    } catch (loadError) {
      startTransition(() => {
        setFaculty([]);
        setError(loadError instanceof Error ? loadError.message : "Could not load faculty members.");
      });
    } finally {
      startTransition(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    void refreshFaculty();
  }, [refreshFaculty]);

  const value = useMemo(() => ({ faculty, loading, error, refreshFaculty }), [faculty, loading, error, refreshFaculty]);
  return <FacultyManagementContext.Provider value={value}>{children}</FacultyManagementContext.Provider>;
}

export function useFacultyManagement() {
  const value = useContext(FacultyManagementContext);
  if (!value) throw new Error("useFacultyManagement must be used within FacultyManagementProvider");
  return value;
}
