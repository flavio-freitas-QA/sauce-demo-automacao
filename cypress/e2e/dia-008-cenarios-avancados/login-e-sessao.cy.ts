import LoginPage from "../../support/pages/LoginPage";
import users from "../../fixtures/users.json";

describe("Dia 008 - Login e Sessão | Sauce Demo", () => {
  it("deve logar ao pressionar Enter no campo de senha", () => {
    LoginPage.visit();
    LoginPage.fillUsername(users.standard.username);
    LoginPage.fillPassword(users.standard.password);
    LoginPage.submitWithEnter();
    cy.url().should("include", "/inventory.html");
  });

  it("deve fechar a mensagem de erro ao clicar no botão X", () => {
    LoginPage.visit();
    LoginPage.submit();
    LoginPage.getErrorMessage().should("be.visible");

    LoginPage.closeError();
    LoginPage.getErrorMessage().should("not.exist");
  });
});

describe("Dia 008 - Login e Sessão | Sauce Demo | Guarda de rota", () => {
  ["/inventory.html", "/inventory-item.html"].forEach((path) => {
    it(`deve redirecionar ao acessar ${path} sem login`, () => {
      cy.visit(path, { failOnStatusCode: false });
      cy.location("pathname", { timeout: 15000 }).should("eq", "/");
      LoginPage.getErrorMessage().should(
        "contain.text",
        `You can only access '${path}' when you are logged in.`
      );
    });
  });

  it("deve derrubar a sessão se o cookie for removido no meio do fluxo", () => {
    cy.login(users.standard.username);

    // Simula expiração de sessão: o app autentica só pelo cookie
    cy.clearCookie("session-username");

    cy.visit("/cart.html", { failOnStatusCode: false });
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    LoginPage.getErrorMessage().should(
      "contain.text",
      "You can only access '/cart.html' when you are logged in."
    );
  });
});
