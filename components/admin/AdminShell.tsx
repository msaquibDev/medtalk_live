"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Tags,
  Users,
} from "lucide-react";
import { AdminDataProvider } from "@/components/admin/AdminDataProvider";
import type { ReactNode } from "react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Conferences", href: "/conferences", icon: CalendarDays },
  { label: "Faculty", href: "/faculty", icon: Stethoscope },
  { label: "Speciality", href: "/specialities", icon: Tags },
  // { label: "Courses", href: "/courses", icon: BookOpen },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("meditalk-admin") !== "signed-in") {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  function logout() {
    sessionStorage.removeItem("meditalk-admin");
    router.replace("/");
  }

  if (!ready)
    return (
      <div className="admin-loading" aria-label="Loading admin workspace" />
    );

  return (
    <AdminDataProvider>
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
            <button type="button" className="profile" onClick={logout}>
              <div className="avatar">AS</div>
              <div>
                <strong>Admin Sharma</strong>
                <small>Administrator</small>
              </div>
              <LogOut className="logout-icon" size={16} />
            </button>
          </div>
        </aside>
        <main className="main-area">
          <header className="topbar">
            <div className="crumb">
              Workspace <span>/</span>{" "}
              <b>
                {navigation.find((item) => path.startsWith(item.href))?.label ||
                  "Manage"}
              </b>
            </div>
            <div className="top-actions">
              <button
                className="icon-button"
                type="button"
                aria-label="Notifications"
              >
                <Bell size={17} />
                <i />
              </button>
              <div className="top-avatar">AS</div>
              <div className="admin-meta">
                <strong>Admin Sharma</strong>
                <small>Super admin</small>
              </div>
            </div>
          </header>
          <div className="page-content">{children}</div>
        </main>
      </div>
    </AdminDataProvider>
  );
}
