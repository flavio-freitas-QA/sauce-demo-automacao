// Page Object da página de detalhe do produto.
// Os data-test de nome/descrição/preço são os mesmos do catálogo
// (inventory-item-name/desc/price), o que unifica os seletores entre telas.
class ProductDetailPage {
  getProductName() {
    return cy.get("[data-test='inventory-item-name']");
  }

  getProductDescription() {
    return cy.get("[data-test='inventory-item-desc']");
  }

  getProductPrice() {
    return cy.get("[data-test='inventory-item-price']");
  }

  getActionButton() {
    // O botão alterna entre data-test='add-to-cart' e 'remove' conforme o
    // estado, então o container é o seletor estável para ler o rótulo atual.
    return cy.get(".inventory_details_container button");
  }

  addToCart() {
    cy.get("[data-test='add-to-cart']").click();
  }

  removeFromCart() {
    cy.get("[data-test='remove']").click();
  }

  clickBackToProducts() {
    cy.get("[data-test='back-to-products']").click();
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
