import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/admin-auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  let body: { password?: unknown; confirmPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Enter and confirm your new password." }, { status: 400 });
  }
  if (typeof body.password !== "string" || typeof body.confirmPassword !== "string") {
    return NextResponse.json({ message: "Enter and confirm your new password." }, { status: 400 });
  }

  try {
    const { token } = await context.params;
    const upstream = await fetch(`${getApiBaseUrl()}/auth/admin/reset-password/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: body.password, confirmPassword: body.confirmPassword }),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({}));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Could not reach the authentication service. Try again shortly." }, { status: 502 });
  }
}
