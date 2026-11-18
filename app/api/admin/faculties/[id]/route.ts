import { NextResponse } from "next/server";
import {
  errorResponse,
  forwardJsonResponse,
  getAdminToken,
  getFacultiesUrl,
  getMessage,
  normalizeFaculty,
  readJson,
  toFacultyView,
} from "@/lib/admin-faculties-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  try {
    const { id } = await context.params;
    const response = await fetch(getFacultiesUrl(`/${encodeURIComponent(id)}`), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await readJson(response) as { data?: unknown } | null;
    if (!response.ok) return errorResponse(getMessage(payload, "Could not load faculty details."), response.status);
    const faculty = normalizeFaculty(payload?.data);
    if (!faculty) return errorResponse("The faculty details did not match the documented response schema.", 502);
    return NextResponse.json({ success: true, data: toFacultyView(faculty) });
  } catch {
    return errorResponse("Could not reach the faculty service. Try again shortly.", 502);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);
  let body: { fullName?: unknown; email?: unknown; mobile?: unknown; affiliation?: unknown; specialityId?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Complete all faculty fields.", 400);
  }
  const required = [body.fullName, body.email, body.mobile, body.affiliation, body.specialityId];
  if (required.some((value) => typeof value !== "string" || !value.trim())) {
    return errorResponse("Complete all faculty fields.", 400);
  }

  try {
    const { id } = await context.params;
    const response = await fetch(getFacultiesUrl(`/${encodeURIComponent(id)}`), {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: (body.fullName as string).trim(),
        email: (body.email as string).trim(),
        mobile: (body.mobile as string).trim(),
        affiliation: (body.affiliation as string).trim(),
        specialityId: (body.specialityId as string).trim(),
      }),
      cache: "no-store",
    });
    return forwardJsonResponse(response, "Could not update the faculty member.");
  } catch {
    return errorResponse("Could not reach the faculty service. Try again shortly.", 502);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  try {
    const { id } = await context.params;
    const response = await fetch(getFacultiesUrl(`/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return forwardJsonResponse(response, "Could not delete the faculty member.");
  } catch {
    return errorResponse("Could not reach the faculty service. Try again shortly.", 502);
  }
}
