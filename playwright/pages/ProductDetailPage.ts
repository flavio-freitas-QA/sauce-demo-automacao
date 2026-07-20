import { Page, Locator } from "@playwright/test";

export class ProductDetailPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly actionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator(".inventory_details_name");
    this.productDescription = page.locator(".inventory_details_desc");
    this.productPrice = page.locator(".inventory_details_price");
    this.actionButton = page.locator(".inventory_details_container button");
  }

  async addToCart() {
    await this.actionButton.filter({ hasText: /Add to cart/i }).click();
  }

  async removeFromCart() {
    await this.actionButton.filter({ hasText: /Remove/i }).click();
  }

  async clickBackToProducts() {
    await this.page.getByRole("button", { name: /Back to products/i }).click();
  }
}
