import { test, expect, apiUrl } from "./fixtures";

const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );

test("cria, edita, duplica e exclui transações sem sair da listagem", async ({
  page,
  signedIn,
}) => {
  void signedIn;
  await page.goto("/transactions");
  await page
    .getByRole("button", { name: "Adicionar transação", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel(/Valor/).fill("25.50");
  await dialog
    .getByLabel("Descrição", { exact: true })
    .fill("Mercado pelo navegador");
  await dialog.getByRole("button", { name: "Salvar transação" }).click();
  await expect(dialog).not.toBeVisible();
  let row = page.getByRole("row").filter({ hasText: "Mercado pelo navegador" });
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: "Editar transação" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel(/Valor/).fill("30");
  await dialog
    .getByLabel("Descrição", { exact: true })
    .fill("Mercado atualizado");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(dialog).not.toBeVisible();
  row = page.getByRole("row").filter({ hasText: "Mercado atualizado" });
  await expect(row).toContainText("30,00");
  await row.getByRole("button", { name: "Duplicar transação" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar transação" })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(row).toHaveCount(2);
  page.once("dialog", (confirmation) => confirmation.accept());
  await row.first().getByRole("button", { name: "Excluir transação" }).click();
  await expect(row).toHaveCount(1);
});

test("filtra o mês sem alterar o saldo acumulado", async ({
  page,
  signedIn,
  request,
  account,
}) => {
  void signedIn;
  for (const data of [
    {
      type: "INCOME",
      value: 100,
      date: today(),
      category: "SALARY",
      description: "Salário do mês",
    },
    {
      type: "EXPENSE",
      value: 25.5,
      date: today(),
      category: "FOOD",
      description: "Mercado filtrado",
    },
    {
      type: "EXPENSE",
      value: 10,
      date: today(),
      category: "HEALTH",
      description: "Farmácia",
    },
  ]) {
    const response = await request.post(`${apiUrl}/transactions`, {
      headers: { Authorization: `Bearer ${account.token}` },
      data,
    });
    expect(response.status()).toBe(201);
  }
  await page.goto("/transactions");
  await expect(page.getByRole("region", { name: "Saldo total" })).toContainText(
    "64,50",
  );
  await page
    .getByRole("textbox", { name: "Buscar", exact: true })
    .fill("Mercado filtrado");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page).toHaveURL(/search=Mercado/);
  await expect(
    page.getByRole("row").filter({ hasText: "Mercado filtrado" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("row").filter({ hasText: "Farmácia" }),
  ).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Saldo total" })).toContainText(
    "64,50",
  );
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Farmácia" }),
  ).toHaveCount(1);
});

test("cria uma meta, aporta saldo e conclui a compra com uma despesa", async ({
  page,
  signedIn,
  request,
  account,
}) => {
  void signedIn;
  const response = await request.post(`${apiUrl}/transactions`, {
    headers: { Authorization: `Bearer ${account.token}` },
    data: { type: "INCOME", value: 100, date: today(), category: "SALARY" },
  });
  expect(response.status()).toBe(201);
  await page.goto("/wishlist");
  await page.getByRole("button", { name: "Adicionar novo desejo" }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome", { exact: true }).fill("Livros do navegador");
  await dialog.getByLabel("Preço").fill("100");
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Livros do navegador" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Aportar", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Valor", { exact: true }).fill("80");
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Progresso de Livros do navegador" }),
  ).toHaveAttribute("aria-valuenow", "80");
  await page
    .getByRole("button", { name: "Concluir compra", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Valor pago").fill("60");
  await dialog
    .getByRole("combobox", { name: "Categoria", exact: true })
    .click();
  await page.getByRole("option", { name: "Outros", exact: true }).click();
  await dialog
    .getByLabel("Descrição", { exact: true })
    .fill("Compra de livros");
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Concluídas", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Livros do navegador" }),
  ).toBeVisible();
  const balance = await request.get(`${apiUrl}/transactions/balance`, {
    headers: { Authorization: `Bearer ${account.token}` },
  });
  expect(await balance.json()).toMatchObject({
    balance: 40,
    totalExpense: 60,
    count: 2,
  });
});

test("cadastra receita recorrente e confirma o recebimento no calendário", async ({
  page,
  signedIn,
}) => {
  void signedIn;
  await page.goto("/calendar");
  await page.getByRole("button", { name: /Nova receita/ }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Descrição", { exact: true })
    .fill("Salário do navegador");
  await dialog.getByLabel("Valor previsto (R$)", { exact: true }).fill("100");
  await dialog.getByLabel("Primeiro recebimento").fill(today());
  await dialog
    .getByRole("combobox", { name: "Categoria", exact: true })
    .click();
  await page.getByRole("option", { name: "Salário", exact: true }).click();
  await dialog.getByRole("button", { name: /Salvar/ }).click();
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Confirmar recebimento", exact: true })
    .first()
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Valor recebido (R$)", { exact: true }).fill("99");
  await dialog
    .getByRole("button", { name: "Confirmar recebimento", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText(/Recebido em/).first()).toBeVisible();
});

test("cria cartão e compra parcelada com faturas sem débito imediato no saldo", async ({
  page,
  signedIn,
  account,
  request,
}) => {
  void signedIn;
  await page.goto("/cards");
  await page.getByRole("button", { name: "Novo cartão", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome", { exact: true }).fill("Cartão do navegador");
  await dialog.getByLabel("Limite (R$)", { exact: true }).fill("500");
  await dialog.getByRole("button", { name: "Salvar cartão" }).click();
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", {
      name: /Nova compra|Registrar compra|Compra no crédito/,
    })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Descrição", { exact: true })
    .fill("Livros parcelados");
  await dialog.getByLabel("Valor total (R$)", { exact: true }).fill("100.01");
  await dialog.getByLabel("Parcelas", { exact: true }).fill("3");
  await dialog
    .getByRole("button", { name: "Registrar compra", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("region", { name: "Faturas", exact: true }),
  ).toContainText("33,34");
  const balance = await request.get(`${apiUrl}/transactions/balance`, {
    headers: { Authorization: `Bearer ${account.token}` },
  });
  expect(await balance.json()).toMatchObject({ balance: 0, count: 0 });
});

test("pagamento de despesa fixa atualiza o saldo e resolve o lembrete", async ({
  page,
  signedIn,
  account,
  request,
}) => {
  void signedIn;
  const response = await request.post(`${apiUrl}/fixed-expenses`, {
    headers: { Authorization: `Bearer ${account.token}` },
    data: {
      name: "Internet do navegador",
      amount: 100,
      category: "OTHER",
      dueDate: `${today()}T12:00:00Z`,
      recurrence: "MONTHLY",
    },
  });
  expect(response.status()).toBe(201);
  await page.goto("/fixed-expenses");
  await page
    .getByRole("button", { name: "Marcar como pago", exact: true })
    .click();
  await expect(page.getByText("Pago", { exact: true }).first()).toBeVisible();
  const balance = await request.get(`${apiUrl}/transactions/balance`, {
    headers: { Authorization: `Bearer ${account.token}` },
  });
  expect(await balance.json()).toMatchObject({
    balance: -100,
    totalExpense: 100,
    count: 1,
  });
  await page.getByRole("button", { name: "Notificações", exact: true }).click();
  await expect(page.getByText("Resolvida: despesa paga")).toBeVisible();
});

test("edita perfil e senha, exigindo a nova senha no próximo login", async ({
  page,
  signedIn,
  account,
  request,
}) => {
  void signedIn;
  await page.goto("/config");
  await page.getByLabel("Nome", { exact: true }).fill("Pessoa atualizada");
  await page
    .getByLabel("Nova senha", { exact: true })
    .fill("new-browser-password");
  await page
    .getByLabel("Confirmar nova senha", { exact: true })
    .fill("new-browser-password");
  await page
    .getByRole("button", { name: "Salvar alterações", exact: true })
    .click();
  await expect(
    page.getByText(/atualizados|atualizado|sucesso/i).first(),
  ).toBeVisible();
  const oldLogin = await request.post(`${apiUrl}/auth`, {
    data: { email: account.email, password: account.password },
  });
  expect(oldLogin.status()).toBe(401);
  const newLogin = await request.post(`${apiUrl}/auth`, {
    data: { email: account.email, password: "new-browser-password" },
  });
  expect(newLogin.status()).toBe(201);
});
