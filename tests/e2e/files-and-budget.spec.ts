import { test, expect, apiUrl } from "./fixtures";
import { readFile } from "node:fs/promises";
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );

test("importa um CSV pela prévia e só grava após confirmar", async ({
  page,
  signedIn,
  request,
  account,
}) => {
  void signedIn;
  await page.goto("/transactions");
  await page.getByRole("button", { name: "Importar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const civil = today().split("-").reverse().join("/");
  await dialog.getByLabel("Arquivo CSV ou OFX").setInputFiles({
    name: "extrato.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      `data;descricao;valor\n${civil};Mercado importado;-10,25\n`,
    ),
  });
  await dialog.getByLabel("Origem do extrato").fill("Banco do navegador");
  await dialog
    .getByRole("button", { name: "Gerar prévia", exact: true })
    .click();
  await expect(
    dialog.getByText("Mercado importado", { exact: true }),
  ).toBeVisible();
  const before = await request.get(`${apiUrl}/transactions/balance`, {
    headers: { Authorization: `Bearer ${account.token}` },
  });
  expect((await before.json()).count).toBe(0);
  await dialog
    .getByRole("button", { name: "Revisar confirmação (1)", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Confirmar importação", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "Mercado importado" }),
  ).toHaveCount(1);
});

test("exporta CSV e baixa o arquivo gerado pela fila real", async ({
  page,
  signedIn,
  request,
  account,
}) => {
  void signedIn;
  const response = await request.post(`${apiUrl}/transactions`, {
    headers: { Authorization: `Bearer ${account.token}` },
    data: {
      type: "EXPENSE",
      value: 10.25,
      date: today(),
      category: "FOOD",
      description: "Mercado exportado",
    },
  });
  expect(response.status()).toBe(201);
  await page.goto("/transactions");
  await page
    .getByRole("button", { name: "Exportar transações", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Formato da exportação" }).click();
  await page
    .getByRole("option", { name: "Abrir no Excel (.csv)", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Confirmar exportação", exact: true })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /Baixar.*CSV/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  expect(await readFile(path!, "utf8")).toContain("Mercado exportado");
});

test("cria orçamento e acompanha gastos realizados na dashboard", async ({
  page,
  signedIn,
  request,
  account,
}) => {
  void signedIn;
  const response = await request.post(`${apiUrl}/transactions`, {
    headers: { Authorization: `Bearer ${account.token}` },
    data: { type: "EXPENSE", value: 25, date: today(), category: "FOOD" },
  });
  expect(response.status()).toBe(201);
  await page.goto("/dashboard");
  await page
    .getByRole("button", { name: "Novo orçamento", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Categoria", exact: true })
    .click();
  await page.getByRole("option", { name: "Alimentação", exact: true }).click();
  await dialog.getByLabel("Limite (R$)", { exact: true }).fill("100");
  await dialog.getByRole("button", { name: /Salvar/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText(/Gasto.*25,00.*100,00/)).toBeVisible();
  await expect(page.getByText(/Restam.*75,00/)).toBeVisible();
});
