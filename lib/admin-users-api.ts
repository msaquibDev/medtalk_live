import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, getApiBaseUrl } from "@/lib/admin-auth";
import { splitPhoneNumber } from "@/components/admin/countryCallingCodes";

export type ApiUser = {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  affiliation: string;
  specialityId?: { _id?: string; specialityName?: string } | string | null;
  profileImage?: string | null;
  status?: "pending" | "active";
  createdAt?: string;
  updatedAt?: string;
};

export async function getAdminToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export function getUsersUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
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

export function normalizeUser(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item._id !== "string" ||
    typeof item.fullName !== "string" ||
    typeof item.email !== "string" ||
    typeof item.mobile !== "string" ||
    typeof item.affiliation !== "string"
  ) return null;

  let specialityId: ApiUser["specialityId"];
  let speciality = "";
  if (typeof item.specialityId === "string") specialityId = item.specialityId;
  else if (item.specialityId && typeof item.specialityId === "object") {
    const specialityData = item.specialityId as Record<string, unknown>;
    specialityId = {
      ...(typeof specialityData._id === "string" ? { _id: specialityData._id } : {}),
      ...(typeof specialityData.specialityName === "string" ? { specialityName: specialityData.specialityName } : {}),
    };
    if (typeof specialityData.specialityName === "string") speciality = specialityData.specialityName;
  } else specialityId = null;

  const phone = splitPhoneNumber(item.mobile);
  return {
    id: item._id,
    name: item.fullName,
    email: item.email,
    phoneCode: phone.phoneCode,
    mobile: phone.mobile,
    hospital: item.affiliation,
    speciality,
    specialityId: typeof item.specialityId === "string"
      ? item.specialityId
      : specialityId && typeof specialityId === "object"
        ? specialityId._id || ""
        : "",
    registeredAt: typeof item.createdAt === "string" ? item.createdAt : "",
    ...(item.status === "pending" || item.status === "active" ? { status: item.status } : {}),
    ...(typeof item.profileImage === "string" || item.profileImage === null ? { profileImage: item.profileImage } : {}),
  };
}

export async function forwardJsonResponse(response: Response, fallback: string) {
  const payload = await readJson(response);
  if (payload !== null) return NextResponse.json(payload, { status: response.status });
  if (response.ok) return NextResponse.json({ success: true }, { status: response.status });
  return errorResponse(fallback, response.status);
}
