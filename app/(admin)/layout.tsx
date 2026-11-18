import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ACCESS_TOKEN_COOKIE, getApiBaseUrl } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) redirect("/");

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) redirect("/");
  } catch {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
