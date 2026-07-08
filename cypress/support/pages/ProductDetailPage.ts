class ProductDetailPage {
  getProductName() {
    return cy.get(".inventory_details_name");
  }

  getProductDescription() {
    return cy.get(".inventory_details_desc");
  }

  getProductPrice() {
    return cy.get(".inventory_details_price");
  }

  getActionButton() {
    return cy.get(".inventory_details_container button");
  }

  addToCart() {
    this.getActionButton().contains(/Add to cart/i).click();
  }

  removeFromCart() {
    this.getActionButton().contains(/Remove/i).click();
  }

  clickBackToProducts() {
    cy.contains("button", /Back to products/i).click();
  }

  validateProductName(expected: string) {
    this.getProductName().should("contain.text", expected);
    return this;
  }

  validateProductDescription(expected: string) {
    this.getProductDescription().should("contain.text", expected);
    return this;
  }

  validateProductPrice(expected: string) {
    this.getProductPrice().should("contain.text", expected);
    return this;
  }
}

export default new ProductDetailPage();