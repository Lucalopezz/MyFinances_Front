import { test, expect } from "./fixtures";

// As fixtures criam conta e banco descartáveis na API local; nenhum dado pessoal é utilizado.
for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`wishlist mantém painéis e formulário legíveis em ${theme} com ${width}px`, async ({
      page,
      signedIn,
    }) => {
      void signedIn;
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.goto("/wishlist");
      await expect(
        page.getByRole("heading", { name: "Minha Lista de Desejos" }),
      ).toBeVisible();
      const shellColor = await page
        .getByRole("main")
        .evaluate((element) => getComputedStyle(element).backgroundColor);
      // Um painel sem fundo herda a cor do shell e desaparece visualmente, como na regressão original.
      const panel = await page
        .getByText("Saldo registrado")
        .first()
        .evaluate((element) => {
          let current: Element | null = element;
          while (current) {
            const color = getComputedStyle(current).backgroundColor;
            if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent")
              return { color, ownSurface: current.tagName !== "MAIN" };
            current = current.parentElement;
          }
          return { color: "transparent", ownSurface: false };
        });
      expect(panel.ownSurface).toBe(true);
      if (theme === "dark") expect(panel.color).not.toBe(shellColor);
      await expect(
        page.getByRole("button", { name: "Ativas", pressed: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Concluídas" }).click();
      await expect(
        page.getByRole("button", { name: "Concluídas", pressed: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Adicionar novo desejo" }).click();
      const dialog = page.getByRole("dialog", {
        name: "Adicionar Novo Desejo",
      });
      await expect(dialog.getByLabel("Nome", { exact: true })).toBeVisible();
      await expect(dialog.getByLabel("Preço", { exact: true })).toBeVisible();
      const backgroundIsLight = await dialog.evaluate((element) => {
        const channels = getComputedStyle(element)
          .backgroundColor.match(/[\d.]+/g)!
          .map(Number);
        return (channels[0] + channels[1] + channels[2]) / 3 > 128;
      });
      expect(backgroundIsLight).toBe(theme === "light");
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await dialog.getByRole("button", { name: "Cancelar" }).click();
      await expect(dialog).not.toBeVisible();
    });
  }
}
