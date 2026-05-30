import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { AUTH_COOKIE_NAME } from "@/lib/backend";

export async function getServerToken(): Promise<string | null> {
  noStore();

  try {
    const tokenCookie = (await cookies()).get(AUTH_COOKIE_NAME);
    return tokenCookie?.value ?? null;
  } catch (error) {
    return null;
  }
}

export async function clearServerToken() {
  try {
    (await cookies()).set({
      name: AUTH_COOKIE_NAME,
      value: "",
      maxAge: 0,
      path: "/",
    });
  } catch (e) {
    // noop
  }
}
