import { Page, Locator } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator(".shopping_cart_link");
    this.sortDropdown = page.locator("[data-test='product_sort_container']");
  }

  async goto() {
    await this.page.goto("/inventory.html", { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
    await this.page.locator("body").waitFor({ timeout: 30000 });
  }

  async openCart() {
    await this.cartLink.click();
  }

  getProductCard(name: string) {
    return this.page.locator(".inventory_item").filter({ hasText: name }).first();
  }

  async addProductByName(name: string) {
    const card = this.getProductCard(name);
    await card.getByRole("button", { name: /add to cart/i }).click();
  }

  async removeProductByName(name: string) {
    const card = this.getProductCard(name);
    await card.getByRole("button", { name: /remove/i }).click();
  }

  async getProductName(name: string) {
    return this.getProductCard(name).locator(".inventory_item_name").textContent();
  }

  async getProductPrice(name: string) {
    return this.getProductCard(name).locator(".inventory_item_price").textContent();
  }

  async getProductActionButtonText(name: string) {
    return this.getProductCard(name).getByRole("button").textContent();
  }

  async getCartBadgeCount() {
    const badge = this.page.locator(".shopping_cart_badge");
    if ((await badge.count()) === 0) {
      return 0;
    }

    return Number((await badge.textContent())?.trim());
  }

  async sortProducts(option: string) {
    await this.sortDropdown.selectOption(option);
  }
}
