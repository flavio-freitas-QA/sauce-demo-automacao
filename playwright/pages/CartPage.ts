import { Page, Locator } from "@playwright/test";

// Nota: os itens do carrinho recebem data-test="inventory-item" (mesmo valor
// usado no catálogo), então a classe .cart_item continua sendo o seletor mais
// expressivo para o item dentro desta página.
export class CartPage {
  readonly page: Page;
  readonly items: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.locator(".cart_item");
    this.title = page.locator("[data-test='title']");
  }

  async goto() {
    await this.page.goto("/cart.html");
  }

  getItemByName(name: string) {
    return this.page.locator(".cart_item").filter({ hasText: name });
  }

  async getItemName(name: string) {
    return this.getItemByName(name).locator("[data-test='inventory-item-name']").textContent();
  }

  async getItemPrice(name: string) {
    return this.getItemByName(name).locator("[data-test='inventory-item-price']").textContent();
  }

  async clickItemName(name: string) {
    await this.getItemByName(name).locator("[data-test='inventory-item-name']").click();
  }

  getItemQuantity(name: string) {
    return this.getItemByName(name).locator("[data-test='item-quantity']");
  }

  async removeItemByName(name: string) {
    await this.getItemByName(name).locator("button").click();
  }

  async clickContinueShopping() {
    await this.page.locator("[data-test='continue-shopping']").click();
  }

  async clickCheckout() {
    await this.page.locator("[data-test='checkout']").click();
  }
}
