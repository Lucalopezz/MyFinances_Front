import { test as base, expect, type APIRequestContext } from "@playwright/test";
import { randomBytes } from "node:crypto";

export const apiUrl = `http://127.0.0.1:${process.env.E2E_API_PORT ?? 3101}`;
export const frontendUrl = `http://127.0.0.1:${process.env.E2E_FRONTEND_PORT ?? 3100}`;
export type Account = {
  id: string;
  email: string;
  password: string;
  token: string;
};

/** Cada teste tem uma conta própria; preparação por HTTP evita depender de testes anteriores. */
export async function registerAccount(
  request: APIRequestContext,
): Promise<Account> {
  const email = `frontend-${randomBytes(10).toString("hex")}@example.test`;
  const password = "frontend-test-password";
  const created = await request.post(`${apiUrl}/user`, {
    data: { name: "Pessoa de teste", email, password },
  });
  expect(created.status()).toBe(201);
  const user = await created.json();
  const login = await request.post(`${apiUrl}/auth`, {
    data: { email, password },
  });
  expect(login.status()).toBe(201);
  return {
    id: user.user.id,
    email,
    password,
    token: (await login.json()).accessToken,
  };
}

export const test = base.extend<{ account: Account; signedIn: void }>({
  account: async ({ request }, use) => {
    await use(await registerAccount(request));
  },
  signedIn: async ({ context, account }, use) => {
    await context.addCookies([
      {
        name: "mf_token",
        value: account.token,
        url: frontendUrl,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await use();
  },
});
export { expect };
