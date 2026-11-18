"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

type AuthMode = "login" | "forgot" | "reset" | "change";

const config: Record<AuthMode, { title: string; description: string; endpoint: string; submit: string }> = {
  login: { title: "Admin sign in", description: "Sign in to manage your MedTalk workspace.", endpoint: "/api/auth/admin/login", submit: "Sign in" },
  forgot: { title: "Forgot password?", description: "Enter your admin email and we’ll send password reset instructions.", endpoint: "/api/auth/admin/forgot-password", submit: "Send reset link" },
  reset: { title: "Set a new password", description: "Choose a new password for your admin account.", endpoint: "", submit: "Reset password" },
  change: { title: "Change password", description: "Update the password for your admin account.", endpoint: "/api/auth/admin/change-password", submit: "Update password" },
};

export function AdminAuthForm({ mode, token }: { mode: AuthMode; token?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const hasToken = Boolean(token && token.trim());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (mode === "reset" && !hasToken) {
      setError("This reset link is missing its token. Request a new reset link.");
      return;
    }
    if ((mode === "reset" || mode === "change") && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if ((mode === "reset" || mode === "change") && (password.length < 8 || password.length > 128)) {
      setError("Your new password must be between 8 and 128 characters.");
      return;
    }

    const body = mode === "login"
      ? { email: email.trim(), password }
      : mode === "forgot"
        ? { email: email.trim() }
        : mode === "reset"
          ? { password, confirmPassword }
          : { currentPassword, newPassword: password, confirmPassword };
    const endpoint = mode === "reset"
      ? `/api/auth/admin/reset-password/${encodeURIComponent(token ?? "")}`
      : config[mode].endpoint;

    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({})) as { success?: boolean; message?: string };
      if (!response.ok || result.success !== true) {
        setError(result.message || "The request could not be completed. Please try again.");
        return;
      }

      if (mode === "login") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      if (mode === "change") {
        setSuccess(result.message || "Password changed. Please sign in again.");
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
        return;
      }
      setSuccess(result.message || (mode === "forgot"
        ? "If an admin account exists for that email, reset instructions have been sent."
        : "Your password has been reset. You can now sign in."));
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Could not reach the authentication service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { width: "100%" } as const;

  return (
    <section className={mode === "change" ? "password-panel" : "login-page"}>
      <div className={mode === "change" ? "password-card" : "login-card"}>
        {mode === "login" && <Image src="/MedTalkLogin.png" alt="Meditalk" width={220} height={80} priority style={{ objectFit: "contain", display: "block", margin: "0 auto 26px" }} />}
        <div className="login-copy">
          <h1>{config[mode].title}</h1>
          <p>{config[mode].description}</p>
        </div>
        <form onSubmit={submit} className="login-form">
          {(mode === "login" || mode === "forgot") && (
            <label>
              Email address
              <input style={fieldStyle} required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@meditalk.in" />
            </label>
          )}
          {mode === "change" && (
            <label>
              Current password
              <input style={fieldStyle} required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </label>
          )}
          {(mode === "login" || mode === "reset" || mode === "change") && (
            <label>
              {mode === "login" ? "Password" : "New password"}
              <input style={fieldStyle} required type="password" minLength={mode === "login" ? undefined : 8} maxLength={mode === "login" ? undefined : 128} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"} />
            </label>
          )}
          {(mode === "reset" || mode === "change") && (
            <label>
              Confirm new password
              <input style={fieldStyle} required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </label>
          )}
          {error && <p role="alert" style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{error}</p>}
          {success && <p role="status" style={{ color: "#137547", fontSize: 13, margin: 0 }}>{success}</p>}
          <button className="primary wide" type="submit" disabled={busy || (mode === "reset" && !hasToken)}>
            {busy ? "Please wait…" : config[mode].submit}{!busy && <span aria-hidden="true"><ChevronRight size={13} /></span>}
          </button>
        </form>
        <div className="auth-links">
          {mode === "login" && <Link href="/forgot-password">Forgot password?</Link>}
          {mode === "forgot" && <Link href="/">Back to sign in</Link>}
          {mode === "reset" && <Link href="/">Back to sign in</Link>}
          {mode === "change" && success && <Link href="/">Return to sign in</Link>}
        </div>
        {mode === "login" && (
          <div className="login-foot" style={{ justifyContent: "center", textAlign: "center" }}>
            <span>© 2026 medtalk.live by SaaScraft Studio (India) Pvt. Ltd. All rights reserved.</span>
          </div>
        )}
      </div>
    </section>
  );
}
