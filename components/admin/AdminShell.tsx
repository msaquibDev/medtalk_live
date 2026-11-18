"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { startTransition } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Tags,
  Users,
} from "lucide-react";
import { AdminDataProvider } from "@/components/admin/AdminDataProvider";
import { AdminProfileContext, defaultAdminProfile, type AdminProfile } from "@/components/admin/AdminProfileContext";
import type { ReactNode } from "react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Conferences", href: "/conferences", icon: CalendarDays },
  { label: "Faculty", href: "/faculty", icon: Stethoscope },
  { label: "Speciality", href: "/specialities", icon: Tags },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile>(defaultAdminProfile);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("meditalk-admin-profile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        startTransition(() => setProfile({ ...defaultAdminProfile, ...parsedProfile }));
      }
    } catch {
      localStorage.removeItem("meditalk-admin-profile");
    }
  }, []);

  function updateProfile(nextProfile: AdminProfile) {
    setProfile(nextProfile);
    localStorage.setItem("meditalk-admin-profile", JSON.stringify(nextProfile));
  }

  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function logout() {
    await fetch("/api/auth/admin/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/");
    router.refresh();
  }

  return (
    <AdminDataProvider>
      <AdminProfileContext.Provider value={{ profile, updateProfile }}>
      <div className="app-shell">
        <aside className="sidebar">
          <Link
            className="brand"
            href="/dashboard"
            aria-label="Meditalk admin overview"
          >
            <Image
              src="/medtalk.png"
              alt="Meditalk"
              width={150}
              height={48}
              priority
              className="brand-image-desktop"
            />
            <Image
              src="/brand-image.png"
              alt="Meditalk"
              width={96}
              height={96}
              priority
              className="brand-image-mobile"
            />
          </Link>
          <nav aria-label="Main navigation">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-item ${path.startsWith(href) ? "active" : ""}`}
              >
                <Icon size={19} strokeWidth={1.7} />
                <span>{label}</span>
                {label === "Users" && <b className="nav-count">1,284</b>}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-profile-row">
            <Link href="/profile" className="profile" aria-label="Edit admin profile">
              <div className="avatar">{initials}</div>
              <div>
                <strong>{profile.name}</strong>
                <small>Administrator</small>
              </div>
            </Link>
            <button type="button" className="profile-logout" onClick={logout} aria-label="Log out">
              <LogOut className="logout-icon" size={16} />
            </button>
            </div>
          </div>
        </aside>
        <main className="main-area">
          <header className="topbar">
            <div className="crumb">
              Workspace <span>/</span>{" "}
              <b>
                {(path.startsWith("/profile") ? "Profile" : navigation.find((item) => path.startsWith(item.href))?.label) ||
                  "Manage"}
              </b>
            </div>
            <div className="top-actions">
              <Link href="/change-password" className="auth-change-password">Change password</Link>
              <Link href="/profile" className="header-profile" aria-label="Open admin profile">
                <div className="top-avatar">{initials}</div>
                <div className="admin-meta"><strong>{profile.name}</strong></div>
              </Link>
            </div>
          </header>
          <div className="page-content">{children}</div>
        </main>
      </div>
      </AdminProfileContext.Provider>
    </AdminDataProvider>
  );
}
