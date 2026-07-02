class CartPage {
  visit() {
    cy.visit("/");
    cy.contains("Your Cart").should("be.visible");
  }

  getItems() {
    return cy.get(".cart_item");
  }

  getItemByName(name: string) {
    return cy.contains(".cart_item", name);
  }

  getItemName(name: string) {
    return this.getItemByName(name).find(".inventory_item_name");
  }

  getItemPrice(name: string) {
    return this.getItemByName(name).find(".inventory_item_price");
  }

  removeItemByName(name: string) {
    this.getItemByName(name).find("button").contains(/remove/i).click();
  }

  clickContinueShopping() {
    cy.contains("button", /Continue Shopping/i).click();
  }

  clickCheckout() {
    cy.contains("button", /Checkout/i).click();
  }
}

export default new CartPage();
