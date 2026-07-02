import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("[data-test='username']");
    this.passwordInput = page.locator("[data-test='password']");
    this.loginButton = page.locator("[data-test='login-button']");
    this.errorMessage = page.locator("[data-test='error']");
  }

  async goto() {
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.goto();
    await this.usernameInput.waitFor({ timeout: 30000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    try {
      await this.page.waitForURL(/inventory\.html/, { timeout: 10000 });
    } catch {
      await this.errorMessage.waitFor({ timeout: 10000 });
    }
  }

  async expectError(text: string) {
    await expect(this.errorMessage).toContainText(text);
  }
}
