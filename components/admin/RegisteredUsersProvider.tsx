"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { RegisteredUser } from "@/components/admin/model";

export type RegisteredUsersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  from?: number;
  to?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

type RegisteredUsersContextValue = {
  users: RegisteredUser[];
  pagination: RegisteredUsersPagination;
  search: string;
  loading: boolean;
  error: string;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  refreshUsers: () => Promise<void>;
};

const defaultPagination: RegisteredUsersPagination = { page: 1, limit: 5, total: 0, totalPages: 1 };
const RegisteredUsersContext = createContext<RegisteredUsersContextValue | null>(null);

export function RegisteredUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUsers = useCallback(async () => {
    startTransition(() => {
      setLoading(true);
      setError("");
    });
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(defaultPagination.limit) });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({})) as {
        success?: boolean;
        message?: string;
        data?: unknown;
        pagination?: RegisteredUsersPagination;
      };
      if (!response.ok || payload.success !== true || !Array.isArray(payload.data) || !payload.pagination) {
        throw new Error(payload.message || "Could not load registered users.");
      }
      const rows = payload.data.filter((value): value is RegisteredUser => {
        if (!value || typeof value !== "object") return false;
        const item = value as RegisteredUser;
        return typeof item.id === "string" && typeof item.name === "string" && typeof item.email === "string" &&
          typeof item.phoneCode === "string" && typeof item.mobile === "string" && typeof item.hospital === "string" &&
          typeof item.speciality === "string" && typeof item.registeredAt === "string";
      });
      startTransition(() => {
        setUsers(rows);
        setPagination(payload.pagination as RegisteredUsersPagination);
      });
    } catch (loadError) {
      startTransition(() => {
        setUsers([]);
        setPagination(defaultPagination);
        setError(loadError instanceof Error ? loadError.message : "Could not load registered users.");
      });
    } finally {
      startTransition(() => setLoading(false));
    }
  }, [page, search]);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

  const setSearch = useCallback((nextSearch: string) => {
    setSearchValue(nextSearch);
    setPage(1);
  }, []);

  const value = useMemo(() => ({ users, pagination, search, loading, error, setPage, setSearch, refreshUsers }), [users, pagination, search, loading, error, setSearch, refreshUsers]);
  return <RegisteredUsersContext.Provider value={value}>{children}</RegisteredUsersContext.Provider>;
}

export function useRegisteredUsers() {
  const value = useContext(RegisteredUsersContext);
  if (!value) throw new Error("useRegisteredUsers must be used within RegisteredUsersProvider");
  return value;
}
