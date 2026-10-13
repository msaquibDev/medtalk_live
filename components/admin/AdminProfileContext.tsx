"use client";

import { createContext, useContext } from "react";

export type AdminProfile = {
  name: string;
  email: string;
  mobile: string;
};

export const defaultAdminProfile: AdminProfile = {
  name: "Admin Sharma",
  email: "admin@meditalk.in",
  mobile: "",
};

type AdminProfileContextValue = {
  profile: AdminProfile;
  updateProfile: (profile: AdminProfile) => void;
};

export const AdminProfileContext = createContext<AdminProfileContextValue | null>(null);

export function useAdminProfile() {
  const context = useContext(AdminProfileContext);
  if (!context) throw new Error("useAdminProfile must be used within AdminProfileContext");
  return context;
}
