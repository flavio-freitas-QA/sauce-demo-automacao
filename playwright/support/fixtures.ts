import { test as base, expect } from "@playwright/test";

// Fixture de autenticação programática.
// O Sauce Demo autentica apenas pelo cookie `session-username`, então injetar
// o cookie substitui o fluxo de login via UI — que já é coberto de ponta a
// ponta no dia 001 — e economiza segundos em cada teste da suíte.
type AuthFixtures = {
  loginAs: (username: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  loginAs: async ({ page, context }, use) => {
    await use(async (username: string) => {
      await context.addCookies([
        { name: "session-username", value: username, domain: "www.saucedemo.com", path: "/" },
      ]);
      await page.goto("/inventory.html");
      // Timeout maior cobre o atraso proposital do performance_glitch_user.
      await expect(page.locator("[data-test='inventory-list']")).toBeVisible({ timeout: 30000 });
    });
  },
});

export { expect };
