import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  getApiBaseUrl,
  isValidEmail,
  REFRESH_TOKEN_COOKIE,
  secureCookieOptions,
} from "@/lib/admin-auth";

type LoginResponse = {
  success?: boolean;
  message?: string;
  data?: { accessToken?: unknown } | null;
};

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Enter your email and password." }, { status: 400 });
  }

  if (!isValidEmail(body.email) || typeof body.password !== "string" || !body.password) {
    return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${getApiBaseUrl()}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: "no-store",
    });
    const payload = (await upstream.json().catch(() => ({}))) as LoginResponse;

    if (!upstream.ok || payload.success !== true) {
      return NextResponse.json(
        { message: payload.message || "Sign in failed. Check your details and try again." },
        { status: upstream.status || 502 },
      );
    }

    const accessToken = payload.data?.accessToken;
    if (typeof accessToken !== "string" || !accessToken) {
      return NextResponse.json(
        { message: "The login response did not include data.accessToken. Please check the backend response contract." },
        { status: 502 },
      );
    }

    const response = NextResponse.json({ success: true, message: payload.message });
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, secureCookieOptions());

    const upstreamRefresh = upstream.headers.get("set-cookie");
    const refreshValue = upstreamRefresh?.match(/(?:^|,\s*)refreshToken=([^;]+)/i)?.[1];
    if (refreshValue) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshValue, secureCookieOptions());
    }
    return response;
  } catch {
    return NextResponse.json({ message: "Could not reach the authentication service. Try again shortly." }, { status: 502 });
  }
}
