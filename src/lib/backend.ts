export const AUTH_COOKIE_NAME = "mf_token";

export function getServerBackendUrl() {
  const backendUrl =
    process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL not configured");
  }

  return backendUrl;
}

export function createJsonHeaders(token?: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
