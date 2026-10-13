"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

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
          <Image
            src="/MedTalkLogin.png"
            alt="Meditalk"
            width={220}
            height={80}
            priority
            style={{ objectFit: "contain", margin: "0 auto" }}
          />
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
        <div
          className="login-foot"
          style={{ justifyContent: "center", textAlign: "center" }}
        >
          <span>
            © 2026 medtalk.live by SaaScraft Studio (India) Pvt. Ltd. All rights
            reserved.
          </span>
        </div>
      </div>
    </main>
  );
}
