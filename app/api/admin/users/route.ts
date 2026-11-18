import { NextResponse } from "next/server";
import {
  errorResponse,
  getAdminToken,
  getMessage,
  getUsersUrl,
  normalizeUser,
  readJson,
} from "@/lib/admin-users-api";

type UsersListPayload = { success?: unknown; data?: unknown; pagination?: unknown };

export async function GET(request: Request) {
  const token = await getAdminToken();
  if (!token) return errorResponse("Please sign in again.", 401);

  const incomingUrl = new URL(request.url);
  const page = Number(incomingUrl.searchParams.get("page") || 1);
  const limit = Number(incomingUrl.searchParams.get("limit") || 5);
  const search = incomingUrl.searchParams.get("search")?.trim() || "";
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return errorResponse("Page must be 1 or greater and limit must be between 1 and 100.", 400);
  }

  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy: "createdAt",
      order: "desc",
    });
    if (search) params.set("search", search);

    const response = await fetch(getUsersUrl(`/users/admin?${params.toString()}`), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await readJson(response) as UsersListPayload | null;
    if (!response.ok) return errorResponse(getMessage(payload, "Could not load registered users."), response.status);
    if (payload?.success !== true || !Array.isArray(payload.data) || !payload.pagination || typeof payload.pagination !== "object") {
      return errorResponse("The paginated user response did not match the documented schema.", 502);
    }

    const pagination = payload.pagination as Record<string, unknown>;
    if (
      typeof pagination.page !== "number" ||
      typeof pagination.limit !== "number" ||
      typeof pagination.total !== "number" ||
      typeof pagination.totalPages !== "number"
    ) return errorResponse("The user pagination data did not match the documented schema.", 502);

    const data = payload.data.map(normalizeUser).filter((user) => user !== null);
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        ...(typeof pagination.from === "number" ? { from: pagination.from } : {}),
        ...(typeof pagination.to === "number" ? { to: pagination.to } : {}),
        ...(typeof pagination.hasPreviousPage === "boolean" ? { hasPreviousPage: pagination.hasPreviousPage } : {}),
        ...(typeof pagination.hasNextPage === "boolean" ? { hasNextPage: pagination.hasNextPage } : {}),
      },
    });
  } catch {
    return errorResponse("Could not reach the user service. Try again shortly.", 502);
  }
}
