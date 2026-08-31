/// <reference types="cypress" />

// Login programático com cache de sessão (cy.session).
// O Sauce Demo autentica apenas pelo cookie `session-username`, então injetar
// o cookie substitui o fluxo de login via UI — que já é coberto de ponta a
// ponta no dia 001. Benefícios: cada teste ganha segundos, e a sessão é
// cacheada/restaurada entre testes pelo cy.session.
Cypress.Commands.add("login", (username: string) => {
  cy.session(
    username,
    () => {
      cy.setCookie("session-username", username);
    },
    {
      validate() {
        cy.getCookie("session-username").its("value").should("eq", username);
      },
    },
  );

  // failOnStatusCode: o site é um SPA que responde status 404 para subrotas
  // (hospedagem estática), embora sirva a aplicação normalmente.
  cy.visit("/inventory.html", { failOnStatusCode: false });
  // Timeout maior cobre o atraso proposital do performance_glitch_user.
  cy.get("[data-test='inventory-list']", { timeout: 30000 }).should("be.visible");
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Autentica via cookie de sessão (sem passar pela UI de login)
       * e navega até o inventário.
       */
      login(username: string): Chainable<void>;
    }
  }
}

export {};
