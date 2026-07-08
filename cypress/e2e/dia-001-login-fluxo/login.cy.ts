import LoginPage from "../../support/pages/LoginPage";

describe("Dia 001 - Fluxo de Login | Sauce Demo", () => {
  beforeEach(() => {
    cy.fixture("users").as("users");
  });

  it("deve logar com sucesso usando usuário padrão", function () {
    LoginPage.login(this.users.standard.username, this.users.standard.password);
    cy.url().should("include", "/inventory.html");
    cy.get(".title").should("contain.text", "Products");
  });

  it("deve exibir erro ao tentar logar com senha inválida", function () {
    LoginPage.login(this.users.invalidPassword.username, this.users.invalidPassword.password);
    LoginPage.getErrorMessage().should(
      "contain.text",
      "Username and password do not match"
    );
  });

  it("deve bloquear acesso de usuário marcado como locked_out", function () {
    LoginPage.login(this.users.lockedOut.username, this.users.lockedOut.password);
    LoginPage.getErrorMessage().should("contain.text", "has been locked out");
  });

  it("deve exigir preenchimento de usuário e senha", () => {
    LoginPage.visit();
    LoginPage.submit();
    LoginPage.getErrorMessage().should("contain.text", "Username is required");
  });

  it("deve exibir erro ao preencher apenas o usuário e deixar senha vazia", () => {
    LoginPage.visit();
    LoginPage.fillUsername("standard_user");
    LoginPage.submit();
    LoginPage.getErrorMessage().should("contain.text", "Password is required");
  });

  it("deve exibir erro ao preencher apenas a senha e deixar usuário vazio", () => {
    LoginPage.visit();
    LoginPage.fillPassword("secret_sauce");
    LoginPage.submit();
    LoginPage.getErrorMessage().should("contain.text", "Username is required");
  });

  it("deve permitir logout após login bem-sucedido", function () {
    LoginPage.login(this.users.standard.username, this.users.standard.password);
    cy.get("#react-burger-menu-btn").click();
    cy.get("#logout_sidebar_link").click();
    cy.url().should("eq", "https://www.saucedemo.com/");
  });
});
