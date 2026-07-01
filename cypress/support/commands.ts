/// <reference types="cypress" />

// Comando customizado de login, reutilizável em todos os specs do Sauce Demo.
// Centralizar aqui evita repetir a lógica de login em cada dia/fluxo testado.
Cypress.Commands.add("login", (username: string, password: string) => {
  cy.visit("/");
  cy.get("[data-test='username']").type(username);
  cy.get("[data-test='password']").type(password);
  cy.get("[data-test='login-button']").click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
    }
  }
}

export {};
