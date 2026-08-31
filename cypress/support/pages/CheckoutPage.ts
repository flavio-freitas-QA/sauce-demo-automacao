// Page Object das três etapas do checkout do Sauce Demo.
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
    return cy.get("[data-test='complete-header']");
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

  getPaymentInfo() {
    return cy.get("[data-test='payment-info-value']");
  }

  getShippingInfo() {
    return cy.get("[data-test='shipping-info-value']");
  }

  getItemTotal() {
    return cy.get("[data-test='subtotal-label']").invoke("text");
  }

  getTax() {
    return cy.get("[data-test='tax-label']").invoke("text");
  }

  getTotal() {
    return cy.get("[data-test='total-label']").invoke("text");
  }
}

export default new CheckoutPage();
