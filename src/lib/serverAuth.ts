import { cookies } from "next/headers";

export function getServerToken(): string | null {
  try {
    const tokenCookie = cookies().get("mf_token");
    return tokenCookie?.value ?? null;
  } catch (error) {
    return null;
  }
}

export function clearServerToken() {
  try {
    cookies().set({ name: "mf_token", value: "", maxAge: 0, path: "/" });
  } catch (e) {
    // noop
  }
}
