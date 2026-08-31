import LoginPage from "../../support/pages/LoginPage";
import SidebarPage from "../../support/pages/SidebarPage";
import users from "../../fixtures/users.json";

// Único dia que exercita o login pela UI de ponta a ponta.
// Os demais fluxos autenticam via cy.login (sessão programática).
describe("Dia 001 - Fluxo de Login | Sauce Demo", () => {
  it("deve logar com sucesso usando usuário padrão", () => {
    LoginPage.login(users.standard.username, users.standard.password);
    cy.url().should("include", "/inventory.html");
    cy.get("[data-test='title']").should("contain.text", "Products");
  });

  it("deve exibir erro ao tentar logar com senha inválida", () => {
    LoginPage.login(users.invalidPassword.username, users.invalidPassword.password);
    LoginPage.getErrorMessage().should(
      "contain.text",
      "Username and password do not match"
    );
  });

  it("deve bloquear acesso de usuário marcado como locked_out", () => {
    LoginPage.login(users.lockedOut.username, users.lockedOut.password);
    LoginPage.getErrorMessage().should("contain.text", "has been locked out");
  });

  it("deve exigir preenchimento de usuário e senha", () => {
    LoginPage.visit();
    LoginPage.submit();
    LoginPage.getErrorMessage().should("contain.text", "Username is required");
  });

  it("deve exibir erro ao preencher apenas o usuário e deixar senha vazia", () => {
    LoginPage.visit();
    LoginPage.fillUsername(users.standard.username);
    LoginPage.submit();
    LoginPage.getErrorMessage().should("contain.text", "Password is required");
  });

  it("deve exibir erro ao preencher apenas a senha e deixar usuário vazio", () => {
    LoginPage.visit();
    LoginPage.fillPassword(users.standard.password);
    LoginPage.submit();
    LoginPage.getErrorMessage().should("contain.text", "Username is required");
  });

  it("deve permitir logout após login bem-sucedido", () => {
    LoginPage.login(users.standard.username, users.standard.password);
    SidebarPage.openMenu();
    SidebarPage.clickLogout();
    cy.url().should("eq", "https://www.saucedemo.com/");
  });
});
