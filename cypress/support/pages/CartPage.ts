// Page Object da tela do carrinho do Sauce Demo.
// Nota: os itens do carrinho recebem data-test="inventory-item" (mesmo valor
// usado no catálogo), então a classe .cart_item continua sendo o seletor mais
// expressivo para o item dentro desta página.
class CartPage {
  visit() {
    // failOnStatusCode: o site responde status 404 para subrotas do SPA.
    cy.visit("/cart.html", { failOnStatusCode: false });
    cy.get("[data-test='title']").should("have.text", "Your Cart");
  }

  getItems() {
    return cy.get(".cart_item");
  }

  getItemByName(name: string) {
    return cy.contains(".cart_item", name);
  }

  getItemName(name: string) {
    return this.getItemByName(name).find("[data-test='inventory-item-name']");
  }

  getItemPrice(name: string) {
    return this.getItemByName(name).find("[data-test='inventory-item-price']");
  }

  removeItemByName(name: string) {
    this.getItemByName(name).find("button").contains(/remove/i).click();
  }

  clickContinueShopping() {
    cy.get("[data-test='continue-shopping']").click();
  }

  clickCheckout() {
    cy.get("[data-test='checkout']").click();
  }
}

export default new CartPage();
