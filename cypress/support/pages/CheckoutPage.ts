class CheckoutPage {
  fillCustomerInfo(firstName: string, lastName: string, postalCode: string) {
    cy.get("[data-test='firstName']").should("be.visible").clear();
    cy.get("[data-test='lastName']").should("be.visible").clear();
    cy.get("[data-test='postalCode']").should("be.visible").clear();

    if (firstName) {
      cy.get("[data-test='firstName']").type(firstName);
    }

    if (lastName) {
      cy.get("[data-test='lastName']").type(lastName);
    }

    if (postalCode) {
      cy.get("[data-test='postalCode']").type(postalCode);
    }
  }

  clickContinue() {
    cy.get("[data-test='continue']").should("be.visible").click();
  }

  clickCancel() {
    cy.get("[data-test='cancel']").should("be.visible").click();
  }

  clickFinish() {
    cy.get("[data-test='finish']").should("be.visible").click();
  }

  clickBackHome() {
    cy.get("[data-test='back-to-products']").should("be.visible").click();
  }

  getConfirmationMessage() {
    return cy.contains("h2", /Thank you for your order!/i);
  }

  getErrorMessage() {
    return cy.get("[data-test='error']");
  }

  getSummaryItems() {
    return cy.get(".cart_item");
  }

  getSummaryItemByName(name: string) {
    return cy.contains(".cart_item", name);
  }

  getItemTotal() {
    return cy.contains(".summary_subtotal_label", /Item total:/i).invoke("text");
  }

  getTax() {
    return cy.contains(".summary_tax_label", /Tax:/i).invoke("text");
  }

  getTotal() {
    return cy.contains(".summary_total_label", /Total:/i).invoke("text");
  }
}

export default new CheckoutPage();
