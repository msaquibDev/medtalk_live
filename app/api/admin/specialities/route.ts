import { NextResponse } from "next/server";
import {
  errorResponse,
  forwardJsonResponse,
  getAdminToken,
  getApiSpecialitiesUrl,
  getMessage,
  normalizeSpeciality,
  readJson,
  type ApiSpeciality,
} from "@/lib/admin-specialities-api";

type ListPayload = { data?: unknown; meta?: { totalPages?: unknown }; message?: string };

export async function GET() {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const baseUrl = await getApiSpecialitiesUrl("/specialities");
    const adminUrl = await getApiSpecialitiesUrl("/specialities/admin?page=1&limit=100");
    const [catalogResponse, firstAdminResponse] = await Promise.all([
      fetch(`${baseUrl}?sortBy=specialityName&order=asc`, { cache: "no-store" }),
      fetch(adminUrl, { headers, cache: "no-store" }),
    ]);

    if (!catalogResponse.ok) {
      const payload = await readJson(catalogResponse);
      return errorResponse(getMessage(payload, "Could not load specialities."), catalogResponse.status);
    }

    const catalogPayload = (await readJson(catalogResponse)) as ListPayload | null;
    const catalogData = Array.isArray(catalogPayload?.data) ? catalogPayload.data : null;
    if (!catalogData) {
      return errorResponse("The speciality list response did not match the documented schema.", 502);
    }

    let countWarning = "";
    let adminRows: unknown[] = [];
    if (!firstAdminResponse.ok) {
      const payload = await readJson(firstAdminResponse);
      countWarning = getMessage(payload, "Registered user counts could not be loaded.");
    } else {
      const firstAdminPayload = (await readJson(firstAdminResponse)) as ListPayload | null;
      if (!Array.isArray(firstAdminPayload?.data)) {
        countWarning = "Registered user counts were not returned in the documented format.";
      } else {
        adminRows = firstAdminPayload.data;
        const totalPages = typeof firstAdminPayload.meta?.totalPages === "number"
          ? Math.max(1, firstAdminPayload.meta.totalPages)
          : 1;
        const remainingPages = await Promise.allSettled(
          Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map(async (page) => {
            const response = await fetch(await getApiSpecialitiesUrl(`/specialities/admin?page=${page}&limit=100`), {
              headers,
              cache: "no-store",
            });
            const payload = await readJson(response) as ListPayload | null;
            if (!response.ok || !Array.isArray(payload?.data)) {
              throw new Error(getMessage(payload, "Could not load all registered user counts."));
            }
            return payload.data;
          }),
        );
        for (const page of remainingPages) {
          if (page.status === "fulfilled") adminRows.push(...page.value);
          else countWarning ||= page.reason instanceof Error ? page.reason.message : "Some registered user counts could not be loaded.";
        }
      }
    }

    const byId = new Map<string, ApiSpeciality>();
    for (const raw of [...adminRows, ...catalogData]) {
      const item = normalizeSpeciality(raw);
      if (!item) continue;
      const existing = byId.get(item._id);
      byId.set(item._id, existing ? { ...item, usersCount: existing.usersCount ?? item.usersCount } : item);
    }

    const data = [...byId.values()]
      .sort((left, right) => left.specialityName.localeCompare(right.specialityName))
      .map((item) => ({
        id: item._id,
        name: item.specialityName,
        ...(typeof item.usersCount === "number" ? { usersCount: item.usersCount } : {}),
        ...(item.createdAt ? { createdAt: item.createdAt } : {}),
        ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
      }));
    return NextResponse.json({ success: true, data, ...(countWarning ? { countWarning } : {}) });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Could not load specialities.", 502);
  }
}

export async function POST(request: Request) {
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
    const response = await fetch(await getApiSpecialitiesUrl("/specialities"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ specialityName: body.specialityName.trim() }),
      cache: "no-store",
    });
    return forwardJsonResponse(response, "Could not create the speciality.");
  } catch {
    return errorResponse("Could not reach the speciality service. Try again shortly.", 502);
  }
}
