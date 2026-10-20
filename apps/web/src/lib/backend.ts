export const AUTH_COOKIE_NAME = "mf_token";

export function getServerBackendUrl() {
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL not configured");
  }

  // O binding vem da Vercel e acompanha cada preview; o fallback serve ao ambiente local.
  return backendUrl.replace(/\/+$/, "");
}

export function createJsonHeaders(token?: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
