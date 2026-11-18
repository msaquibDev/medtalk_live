import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getApiBaseUrl, REFRESH_TOKEN_COOKIE } from "@/lib/admin-auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  try {
    if (refreshToken) {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: "POST",
        headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
        cache: "no-store",
      });
    }
  } catch {
    // Always clear the browser session, even if the remote logout request fails.
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
