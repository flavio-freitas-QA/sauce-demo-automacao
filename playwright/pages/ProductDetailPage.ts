import { Page, Locator } from "@playwright/test";

// Os data-test de nome/descrição/preço são os mesmos do catálogo
// (inventory-item-name/desc/price), o que unifica os seletores entre telas.
export class ProductDetailPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly actionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator("[data-test='inventory-item-name']");
    this.productDescription = page.locator("[data-test='inventory-item-desc']");
    this.productPrice = page.locator("[data-test='inventory-item-price']");
    // O botão alterna entre data-test='add-to-cart' e 'remove' conforme o
    // estado, então o container é o seletor estável para ler o rótulo atual.
    this.actionButton = page.locator(".inventory_details_container button");
  }

  async addToCart() {
    await this.page.locator("[data-test='add-to-cart']").click();
  }

  async removeFromCart() {
    await this.page.locator("[data-test='remove']").click();
  }

  async clickBackToProducts() {
    await this.page.locator("[data-test='back-to-products']").click();
  }
}
