import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getApiBaseUrl } from "@/lib/admin-auth";

export type ApiFaculty = {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  affiliation: string;
  specialityId?: { _id?: string; specialityName?: string } | string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getAdminToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export function getFacultiesUrl(path = "") {
  return `${getApiBaseUrl()}/faculties${path}`;
}

export async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export function getMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export function normalizeFaculty(value: unknown): ApiFaculty | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item._id !== "string" ||
    typeof item.fullName !== "string" ||
    typeof item.email !== "string" ||
    typeof item.mobile !== "string" ||
    typeof item.affiliation !== "string"
  ) return null;

  let specialityId: ApiFaculty["specialityId"];
  if (typeof item.specialityId === "string") specialityId = item.specialityId;
  else if (item.specialityId && typeof item.specialityId === "object") {
    const speciality = item.specialityId as Record<string, unknown>;
    specialityId = {
      ...(typeof speciality._id === "string" ? { _id: speciality._id } : {}),
      ...(typeof speciality.specialityName === "string" ? { specialityName: speciality.specialityName } : {}),
    };
  } else specialityId = null;

  return {
    _id: item._id,
    fullName: item.fullName,
    email: item.email,
    mobile: item.mobile,
    affiliation: item.affiliation,
    specialityId,
    ...(typeof item.createdAt === "string" ? { createdAt: item.createdAt } : {}),
    ...(typeof item.updatedAt === "string" ? { updatedAt: item.updatedAt } : {}),
  };
}

export function toFacultyView(item: ApiFaculty) {
  const speciality = typeof item.specialityId === "object" && item.specialityId
    ? item.specialityId
    : undefined;
  return {
    id: item._id,
    name: item.fullName,
    email: item.email,
    phone: item.mobile,
    institute: item.affiliation,
    speciality: speciality?.specialityName || "",
    specialityId: (typeof item.specialityId === "string" ? item.specialityId : speciality?._id) || "",
    ...(item.createdAt ? { createdAt: item.createdAt } : {}),
    ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}),
  };
}

export async function forwardJsonResponse(response: Response, fallback: string) {
  const payload = await readJson(response);
  if (payload !== null) return NextResponse.json(payload, { status: response.status });
  if (response.ok) return NextResponse.json({ success: true }, { status: response.status });
  return errorResponse(fallback, response.status);
}
