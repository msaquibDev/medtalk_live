import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getApiBaseUrl } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token)
    return NextResponse.json(
      { message: "Please sign in again." },
      { status: 401 },
    );

  let body: {
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmPassword?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Complete all password fields." },
      { status: 400 },
    );
  }
  if (
    [body.currentPassword, body.newPassword, body.confirmPassword].some(
      (value) => typeof value !== "string" || !value,
    )
  ) {
    return NextResponse.json(
      { message: "Complete all password fields." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(
      `${getApiBaseUrl()}/auth/admin/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
          confirmPassword: body.confirmPassword,
        }),
        cache: "no-store",
      },
    );
    const payload = await upstream.json().catch(() => ({}));
    const response = NextResponse.json(payload, { status: upstream.status });
    if (upstream.ok) {
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete("refreshToken");
    }
    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Could not reach the authentication service. Try again shortly.",
      },
      { status: 502 },
    );
  }
}
