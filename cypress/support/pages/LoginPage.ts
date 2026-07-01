// Page Object da tela de login do Sauce Demo.
// Centraliza seletores e ações, evitando espalhar cy.get(...) pelos specs.
class LoginPage {
  visit() {
    cy.visit("/");
  }

  fillUsername(username: string) {
    cy.get("[data-test='username']").clear().type(username);
  }

  fillPassword(password: string) {
    cy.get("[data-test='password']").clear().type(password);
  }

  submit() {
    cy.get("[data-test='login-button']").click();
  }

  getErrorMessage() {
    return cy.get("[data-test='error']");
  }

  login(username: string, password: string) {
    this.visit();
    this.fillUsername(username);
    this.fillPassword(password);
    this.submit();
  }
}

export default new LoginPage();
