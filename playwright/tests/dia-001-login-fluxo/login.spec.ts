import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { SidebarPage } from "../../pages/SidebarPage";
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

  test("deve exigir preenchimento de usuário e senha", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();
    await loginPage.expectError("Username is required");
  });

  test("deve exibir erro ao preencher apenas o usuário e deixar senha vazia", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.usernameInput.fill(users.standard.username);
    await loginPage.loginButton.click();
    await loginPage.expectError("Password is required");
  });

  test("deve exibir erro ao preencher apenas a senha e deixar usuário vazio", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.passwordInput.fill(users.standard.password);
    await loginPage.loginButton.click();
    await loginPage.expectError("Username is required");
  });

  test("deve permitir logout após login bem-sucedido", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const sidebarPage = new SidebarPage(page);

    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await sidebarPage.openMenu();
    await sidebarPage.clickLogout();
    await expect(page).toHaveURL("https://www.saucedemo.com/");
  });
});
