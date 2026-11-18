import { NextResponse } from "next/server";
import { getApiBaseUrl, isValidEmail } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Enter your email address." }, { status: 400 });
  }
  if (!isValidEmail(body.email)) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${getApiBaseUrl()}/auth/admin/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email }),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({}));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Could not reach the authentication service. Try again shortly." }, { status: 502 });
  }
}
