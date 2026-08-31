import { Page, Locator } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly list: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator("[data-test='shopping-cart-link']");
    this.cartBadge = page.locator("[data-test='shopping-cart-badge']");
    this.sortDropdown = page.locator("[data-test='product-sort-container']");
    this.list = page.locator("[data-test='inventory-list']");
  }

  async goto() {
    await this.page.goto("/inventory.html");
    await this.list.waitFor({ timeout: 30000 });
  }

  async openCart() {
    await this.cartLink.click();
  }

  getProductCard(name: string) {
    return this.page.locator("[data-test='inventory-item']").filter({ hasText: name }).first();
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
    return this.getProductCard(name).locator("[data-test='inventory-item-name']").textContent();
  }

  async getProductPrice(name: string) {
    return this.getProductCard(name).locator("[data-test='inventory-item-price']").textContent();
  }

  async getProductActionButtonText(name: string) {
    return this.getProductCard(name).getByRole("button").textContent();
  }

  async getCartBadgeCount() {
    if ((await this.cartBadge.count()) === 0) {
      return 0;
    }

    return Number((await this.cartBadge.textContent())?.trim());
  }

  async sortProducts(option: string) {
    await this.sortDropdown.selectOption(option);
  }

  async clickProductByName(name: string) {
    await this.getProductCard(name).locator("[data-test='inventory-item-name']").click();
  }

  async getAllProductNames() {
    return this.page.locator("[data-test='inventory-item-name']").evaluateAll((elements) =>
      elements.map((element) => element.textContent?.trim() || ""),
    );
  }

  async getAllProductPrices() {
    return this.page.locator("[data-test='inventory-item-price']").evaluateAll((elements) =>
      elements.map((element) => Number((element.textContent || "").replace("$", "").trim())),
    );
  }

  footerLinks() {
    return this.page.locator("[data-test='footer'] a");
  }
}
