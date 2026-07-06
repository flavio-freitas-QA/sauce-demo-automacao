import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import users from "../../fixtures/users.json";

test.describe("Dia 001 - Fluxo de Login | Sauce Demo (Playwright)", () => {
  test("deve logar com sucesso usando usuário padrão", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator(".title")).toHaveText("Products");
  });

  test("deve exibir erro ao tentar logar com senha inválida", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(users.invalidPassword.username, users.invalidPassword.password);
    await loginPage.expectError("Username and password do not match");
  });

  test("deve bloquear acesso de usuário marcado como locked_out", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectError("has been locked out");
  });
});
