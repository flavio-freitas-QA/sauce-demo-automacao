import { Page, Locator } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly items: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.locator(".cart_item");
  }

  async goto() {
    await this.page.goto("/cart.html", { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await this.page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
    await this.page.locator("body").waitFor({ timeout: 30000 });
  }

  getItemByName(name: string) {
    return this.page.locator(".cart_item").filter({ hasText: name });
  }

  async getItemName(name: string) {
    return this.getItemByName(name).locator(".inventory_item_name").textContent();
  }

  async getItemPrice(name: string) {
    return this.getItemByName(name).locator(".inventory_item_price").textContent();
  }

  async removeItemByName(name: string) {
    await this.getItemByName(name).locator("button").click();
  }

  async clickContinueShopping() {
    await this.page.getByRole("button", { name: /Continue Shopping/i }).click();
  }

  async clickCheckout() {
    await this.page.getByRole("button", { name: /Checkout/i }).click();
  }
}
