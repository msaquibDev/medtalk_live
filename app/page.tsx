"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { ChevronRight, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sessionStorage.setItem("meditalk-admin", "signed-in");
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-copy">
          <h1>
            Sign in to your
            <br />
            <em>admin workspace.</em>
          </h1>
          <p>
            Manage conferences, faculty and your medical community from one
            place.
          </p>
        </div>
        <form onSubmit={login} className="login-form">
          <label>
            Email address
            <input
              required
              type="email"
              placeholder="admin@meditalk.in"
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>
          <button className="primary wide">
            Sign in{" "}
            <span aria-hidden="true">
              <ChevronRight size={13} />
            </span>
          </button>
        </form>
        <div className="login-foot">
          <span>
            <LockKeyhole size={13} /> Secure administrator access
          </span>
          <span>Copyright 2026 Meditalk</span>
        </div>
      </div>
    </main>
  );
}
