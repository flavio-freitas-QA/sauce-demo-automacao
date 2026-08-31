// Page Object da tela de inventário (catálogo) do Sauce Demo.
// Seletores priorizam os atributos data-test expostos pela aplicação.
class InventoryPage {
  visit() {
    // failOnStatusCode: o site responde status 404 para subrotas do SPA.
    cy.visit("/inventory.html", { failOnStatusCode: false });
    cy.get("[data-test='inventory-list']", { timeout: 20000 }).should("be.visible");
  }

  openCart() {
    cy.get("[data-test='shopping-cart-link']").click();
  }

  addProductByName(name: string) {
    this.getProductCard(name).within(() => {
      cy.contains("button", /Add to cart/i).click();
    });
  }

  removeProductByName(name: string) {
    this.getProductCard(name).within(() => {
      cy.contains("button", /Remove/i).click();
    });
  }

  getProductCard(name: string) {
    return cy.contains("[data-test='inventory-item']", name);
  }

  getProductName(name: string) {
    return this.getProductCard(name).find("[data-test='inventory-item-name']");
  }

  getProductPrice(name: string) {
    return this.getProductCard(name).find("[data-test='inventory-item-price']");
  }

  getProductActionButton(name: string) {
    return this.getProductCard(name).find("button");
  }

  getCartBadgeCount() {
    return cy.get("body").then(($body) => {
      const badge = $body.find("[data-test='shopping-cart-badge']");
      return badge.length ? Number(badge.text().trim()) : 0;
    });
  }

  sortProducts(option: string) {
    cy.get("[data-test='inventory-list']").should("be.visible");
    cy.get("[data-test='product-sort-container']", { timeout: 10000 })
      .should("be.visible")
      .select(option);
  }

  clickProductByName(name: string) {
    this.getProductCard(name).find("[data-test='inventory-item-name']").click();
  }

  getAllProductNames() {
    return cy.get("[data-test='inventory-item-name']").then(($names) => {
      return Cypress._.map($names, (el) => el.innerText.trim());
    });
  }

  getAllProductPrices() {
    return cy.get("[data-test='inventory-item-price']").then(($prices) => {
      return Cypress._.map($prices, (el) => {
        return parseFloat(el.innerText.replace("$", "").trim());
      });
    });
  }

  getFooterLinks() {
    return cy.get("[data-test='footer'] a");
  }
}

export default new InventoryPage();
