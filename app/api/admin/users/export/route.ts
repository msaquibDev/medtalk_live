import { NextResponse } from "next/server";
import {
  errorResponse,
  getAdminToken,
  getMessage,
  getUsersUrl,
  normalizeUser,
  readJson,
} from "@/lib/admin-users-api";

export async function GET() {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  try {
    const response = await fetch(getUsersUrl("/users"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await readJson(response) as { success?: unknown; data?: unknown } | null;
    if (!response.ok) return errorResponse(getMessage(payload, "Could not export registered users."), response.status);
    if (payload?.success !== true || !Array.isArray(payload.data)) {
      return errorResponse("The user list did not match the documented response schema.", 502);
    }
    const data = payload.data.map(normalizeUser).filter((user) => user !== null);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Could not reach the user service. Try again shortly." }, { status: 502 });
  }
}
