import { test, expect } from "../../support/fixtures";
import { LoginPage } from "../../pages/LoginPage";
import users from "../../fixtures/users.json";

test.describe("Dia 008 - Login e Sessao | Sauce Demo", () => {
  test("deve logar ao pressionar Enter no campo de senha", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.usernameInput.fill(users.standard.username);
    await loginPage.passwordInput.fill(users.standard.password);
    await loginPage.passwordInput.press("Enter");
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("deve fechar a mensagem de erro ao clicar no botao X", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();

    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toHaveCount(0);
  });
});

test.describe("Dia 008 - Login e Sessao | Sauce Demo | Guarda de rota", () => {
  for (const path of ["/inventory.html", "/inventory-item.html"]) {
    test(`deve redirecionar ao acessar ${path} sem login`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/$/);
      await expect(loginPage.errorMessage).toContainText(
        `You can only access '${path}' when you are logged in.`
      );
    });
  }

  test("deve derrubar a sessao se o cookie for removido no meio do fluxo", async ({ page, context, loginAs }) => {
    const loginPage = new LoginPage(page);

    await loginAs(users.standard.username);

    // Simula expiração de sessão: o app autentica só pelo cookie
    await context.clearCookies();

    await page.goto("/cart.html", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.errorMessage).toContainText(
      "You can only access '/cart.html' when you are logged in."
    );
  });
});
