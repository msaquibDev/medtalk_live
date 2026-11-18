import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getApiBaseUrl } from "@/lib/admin-auth";

export type ApiSpeciality = {
  _id: string;
  specialityName: string;
  usersCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export async function getAdminToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getApiSpecialitiesUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
}

export function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export function normalizeSpeciality(value: unknown): ApiSpeciality | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item._id !== "string" || typeof item.specialityName !== "string") return null;
  return {
    _id: item._id,
    specialityName: item.specialityName,
    ...(typeof item.usersCount === "number" ? { usersCount: item.usersCount } : {}),
    ...(typeof item.createdAt === "string" ? { createdAt: item.createdAt } : {}),
    ...(typeof item.updatedAt === "string" ? { updatedAt: item.updatedAt } : {}),
  };
}

export function findSpeciality(value: unknown): ApiSpeciality | null {
  const direct = normalizeSpeciality(value);
  if (direct) return direct;
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findSpeciality(child);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      const found = findSpeciality(child);
      if (found) return found;
    }
  }
  return null;
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function forwardJsonResponse(response: Response, fallback: string) {
  const payload = await readJson(response);
  if (payload !== null) return NextResponse.json(payload, { status: response.status });
  if (response.ok) return NextResponse.json({ success: true });
  return errorResponse(fallback, response.status);
}
