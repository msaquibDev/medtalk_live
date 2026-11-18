import { NextResponse } from "next/server";
import {
  errorResponse,
  findSpeciality,
  forwardJsonResponse,
  getAdminToken,
  getApiSpecialitiesUrl,
  getMessage,
  readJson,
} from "@/lib/admin-specialities-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);
  const { id } = await context.params;

  try {
    const response = await fetch(await getApiSpecialitiesUrl(`/specialities/${encodeURIComponent(id)}`), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await readJson(response) as { data?: unknown } | null;
    if (!response.ok) return errorResponse(getMessage(payload, "Could not load speciality details."), response.status);

    const speciality = findSpeciality(payload);
    if (!speciality) return errorResponse("The speciality details response did not match the documented schema.", 502);
    return NextResponse.json({
      success: true,
      data: {
        id: speciality._id,
        name: speciality.specialityName,
        ...(typeof speciality.usersCount === "number" ? { usersCount: speciality.usersCount } : {}),
        ...(speciality.createdAt ? { createdAt: speciality.createdAt } : {}),
        ...(speciality.updatedAt ? { updatedAt: speciality.updatedAt } : {}),
      },
    });
  } catch {
    return errorResponse("Could not reach the speciality service. Try again shortly.", 502);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  let body: { specialityName?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Enter a speciality name.", 400);
  }
  if (typeof body.specialityName !== "string" || !body.specialityName.trim()) {
    return errorResponse("Enter a speciality name.", 400);
  }

  try {
    const { id } = await context.params;
    const response = await fetch(await getApiSpecialitiesUrl(`/specialities/${encodeURIComponent(id)}`), {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ specialityName: body.specialityName.trim() }),
      cache: "no-store",
    });
    return forwardJsonResponse(response, "Could not update the speciality.");
  } catch {
    return errorResponse("Could not reach the speciality service. Try again shortly.", 502);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  try {
    const { id } = await context.params;
    const response = await fetch(await getApiSpecialitiesUrl(`/specialities/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return forwardJsonResponse(response, "Could not delete the speciality.");
  } catch {
    return errorResponse("Could not reach the speciality service. Try again shortly.", 502);
  }
}
