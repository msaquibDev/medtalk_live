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

type ListPayload = {
  data?: unknown;
  pagination?: { totalPages?: unknown };
};

export async function GET() {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const firstResponse = await fetch(getFacultiesUrl("?page=1&limit=100&sortBy=fullName&order=asc"), {
      headers,
      cache: "no-store",
    });
    const firstPayload = await readJson(firstResponse) as ListPayload | null;
    if (!firstResponse.ok) {
      return errorResponse(getMessage(firstPayload, "Could not load faculty members."), firstResponse.status);
    }
    if (!Array.isArray(firstPayload?.data)) {
      return errorResponse("The faculty list did not match the documented response schema.", 502);
    }

    const totalPages = typeof firstPayload.pagination?.totalPages === "number"
      ? Math.max(1, firstPayload.pagination.totalPages)
      : 1;
    const pages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map(async (page) => {
        const response = await fetch(getFacultiesUrl(`?page=${page}&limit=100&sortBy=fullName&order=asc`), {
          headers,
          cache: "no-store",
        });
        const payload = await readJson(response) as ListPayload | null;
        if (!response.ok || !Array.isArray(payload?.data)) {
          throw new Error(getMessage(payload, "Could not load all faculty members."));
        }
        return payload.data;
      }),
    );

    const members = [...firstPayload.data, ...pages.flat()]
      .map(normalizeFaculty)
      .filter((item) => item !== null)
      .map(toFacultyView);
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Could not load faculty members.", 502);
  }
}

export async function POST(request: Request) {
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
    const response = await fetch(getFacultiesUrl(), {
      method: "POST",
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
    return forwardJsonResponse(response, "Could not create the faculty member.");
  } catch {
    return errorResponse("Could not reach the faculty service. Try again shortly.", 502);
  }
}
