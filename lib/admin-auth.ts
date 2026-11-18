const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function getApiBaseUrl() {
  if (!configuredBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return `${configuredBaseUrl.replace(/\/+$/, "")}${configuredBaseUrl.replace(/\/+$/, "").endsWith("/api") ? "" : "/api"}`;
}

export const ACCESS_TOKEN_COOKIE = "meditalk_admin_access";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export function secureCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };
}

export async function readApiMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: unknown };
    return typeof payload.message === "string" ? payload.message : undefined;
  } catch {
    return undefined;
  }
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
