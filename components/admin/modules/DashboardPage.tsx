"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { PageHeading, StatCard } from "@/components/admin/PageHeading";
import { ConferenceTable } from "@/components/admin/tables/ConferenceTable";

export function DashboardPage() {
  const { conferences, faculty } = useAdminData();
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase();

  return (
    <>
      <PageHeading
        eyebrow={currentDate}
        title="Hello, Admin"
        description="Here is what is happening across your Meditalk community."
        action={
          <button className="secondary" type="button">
            Refresh
          </button>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Total registered users"
          value="1,284"
          change="+12.8%"
          icon={<Users size={19} />}
        />
        <StatCard
          label="Upcoming conferences"
          value={String(
            conferences.filter((c) => c.status === "Upcoming").length + 8,
          )}
          change="+2 new"
          icon={<CalendarDays size={19} />}
        />
        <StatCard
          label="Active faculty"
          value={String(faculty.length + 42)}
          change="+4.2%"
          icon={<Stethoscope size={19} />}
        />
        <StatCard
          label="Course enrolments"
          value="3,642"
          change="+18.6%"
          icon={<BookOpen size={19} />}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h2>Community growth</h2>
              <p>Registration activity over the past 7 months</p>
            </div>
            <span className="status-pill active-pill">+18.6% this period</span>
          </div>
          <div className="chart">
            <div className="chart-body">
              <div className="grid-lines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <svg
                viewBox="0 0 720 205"
                preserveAspectRatio="none"
                className="chart-svg"
                aria-label="Community registrations increased over seven months"
              >
                <path
                  d="M0 168 C42 160 53 140 103 145 S165 120 206 128 S264 108 309 112 S363 78 412 88 S476 64 515 73 S577 39 618 53 S680 27 720 22"
                  fill="none"
                  stroke="#167967"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="x-labels">
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
            </div>
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="panel-head">
            <div>
              <h2>Quick actions</h2>
              <p>Jump back into your work</p>
            </div>
          </div>
          <Link href="/conferences" className="quick-action">
            <span className="quick-icon mint">
              <Plus size={20} />
            </span>
            <span>
              <strong>Create conference</strong>
              <small>Set up your next event</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/faculty" className="quick-action">
            <span className="quick-icon peach">
              <Stethoscope size={17} />
            </span>
            <span>
              <strong>Add faculty member</strong>
              <small>Grow your expert network</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/users" className="quick-action">
            <span className="quick-icon lavender">
              <Users size={17} />
            </span>
            <span>
              <strong>View registrations</strong>
              <small>Browse your community</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-head">
          <div>
            <h2>Recent conferences</h2>
            <p>A snapshot of your latest events</p>
          </div>
          <Link className="text-button" href="/conferences">
            View all conferences <ArrowRight size={15} />
          </Link>
        </div>
        <ConferenceTable rows={conferences.slice(0, 3)} compact />
      </section>
    </>
  );
}
