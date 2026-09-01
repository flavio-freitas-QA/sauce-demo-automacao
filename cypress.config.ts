import { defineConfig } from "cypress";

export default defineConfig({
  // O projeto não usa Cypress.env(); desabilitar remove o aviso de
  // depreciação do Cypress 15 e fecha o acesso do browser a essas variáveis.
  allowCypressEnv: false,
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    reportPageTitle: "Sauce Demo - Cypress",
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    // Mantém o JSON após gerar o HTML: é dele que o resumo publicado no
    // GitHub Actions (scripts/cypress-summary.js) lê as contagens.
    saveJson: true,
  },
  e2e: {
    baseUrl: "https://www.saucedemo.com",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    fixturesFolder: "cypress/fixtures",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      // Permite que os testes de acessibilidade imprimam as violações no
      // terminal — sem isso a falha mostra só a contagem.
      on("task", {
        log(message: string) {
          console.log(message);
          return null;
        },
      });
      return config;
    },
  },
});
