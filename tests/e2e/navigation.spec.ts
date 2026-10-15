import { test, expect } from "./fixtures";

test("rotas privadas sem cookie voltam ao login", async ({ page }) => {
  await page.goto("/transactions");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("button", { name: "Entrar", exact: true }),
  ).toBeVisible();
});

test("cadastro, login HTTP-only e logout funcionam pelo navegador", async ({
  page,
}) => {
  const email = `browser-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  await page.goto("/register");
  await page.getByLabel("Nome", { exact: true }).fill("Pessoa do navegador");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("browser-password-123");
  await page.getByLabel("Confirme sua senha").fill("browser-password-123");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill("browser-password-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const cookie = (await page.context().cookies()).find(
    (value) => value.name === "mf_token",
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("mf_token");
  await page.getByRole("button", { name: /Sair|Logout/i }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (await page.context().cookies()).some((value) => value.name === "mf_token"),
  ).toBe(false);
});

test("cadastro duplicado mostra a resposta da API", async ({
  page,
  account,
}) => {
  await page.goto("/register");
  await page.getByLabel("Nome", { exact: true }).fill("Pessoa repetida");
  await page.getByLabel("E-mail", { exact: true }).fill(account.email);
  await page.getByLabel("Senha", { exact: true }).fill(account.password);
  await page.getByLabel("Confirme sua senha").fill(account.password);
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "E-mail já cadastrado" }),
  ).toBeVisible();
});

test("navegação financeira funciona no desktop e no menu móvel", async ({
  page,
  signedIn,
  isMobile,
}) => {
  void signedIn;
  await page.goto("/dashboard");
  if (isMobile) await page.getByRole("button", { name: /menu/i }).click();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Transações", exact: true })
    .click();
  await expect(page).toHaveURL(/\/transactions/);
  await expect(
    page.getByRole("heading", { name: /Transações/ }).first(),
  ).toBeVisible();
  if (isMobile)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
});
