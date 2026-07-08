class InventoryPage {
  visit() {
    cy.visit("/");
    cy.get(".inventory_list", { timeout: 20000 }).should("be.visible");
  }

  openCart() {
    cy.get(".shopping_cart_link").click();
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
    return cy.contains(".inventory_item", name);
  }

  getProductName(name: string) {
    return this.getProductCard(name).find(".inventory_item_name");
  }

  getProductPrice(name: string) {
    return this.getProductCard(name).find(".inventory_item_price");
  }

  getProductActionButton(name: string) {
    return this.getProductCard(name).find("button");
  }

  getCartBadgeCount() {
    return cy.get("body").then(($body) => {
      const badge = $body.find(".shopping_cart_badge");
      return badge.length ? Number(badge.text().trim()) : 0;
    });
  }

  sortProducts(option: string) {
    cy.get(".inventory_list").should("be.visible");
    cy.get("select.product_sort_container", { timeout: 10000 }).should("be.visible").select(option);
  }

  clickProductByName(name: string) {
    this.getProductCard(name).find(".inventory_item_name").click();
  }

  getAllProductNames() {
    return cy.get(".inventory_item_name").then(($names) => {
      return Cypress._.map($names, (el) => el.innerText.trim());
    });
  }

  getAllProductPrices() {
    return cy.get(".inventory_item_price").then(($prices) => {
      return Cypress._.map($prices, (el) => {
        return parseFloat(el.innerText.replace("$", "").trim());
      });
    });
  }

  getFooterLinks() {
    return cy.get(".footer a");
  }
}

export default new InventoryPage();