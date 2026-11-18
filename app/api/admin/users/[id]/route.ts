import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/admin-auth";
import { errorResponse, forwardJsonResponse, getMessage, getUsersUrl, readJson } from "@/lib/admin-users-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return errorResponse("Please sign in again.", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid user profile data.", 400);
  }

  const allowedFields = ["fullName", "email", "mobile", "affiliation", "specialityId", "profileImage"] as const;
  const payload: Record<string, string | null> = {};
  for (const field of allowedFields) {
    const value = body[field];
    if (value === undefined) continue;
    if (field === "profileImage" && value === null) {
      payload.profileImage = null;
      continue;
    }
    if (typeof value !== "string") return errorResponse("Invalid user profile data.", 400);
    payload[field] = value.trim();
  }
  if (Object.keys(payload).length === 0) return errorResponse("Provide at least one profile field to update.", 400);

  try {
    const { id } = await context.params;
    const response = await fetch(getUsersUrl(`/users/${encodeURIComponent(id)}`), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!response.ok) {
      const errorPayload = await readJson(response);
      return errorResponse(getMessage(errorPayload, "Could not update the user profile."), response.status);
    }
    return forwardJsonResponse(response, "Could not update the user profile.");
  } catch {
    return NextResponse.json({ success: false, message: "Could not reach the user service. Try again shortly." }, { status: 502 });
  }
}
