import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import CheckoutPage from "../../support/pages/CheckoutPage";
import LoginPage from "../../support/pages/LoginPage";
import { axeRunOptions, logViolations, VIOLACOES_CONHECIDAS } from "../../support/a11y";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

// Varredura WCAG 2.1 A/AA com axe-core.
// As páginas abaixo estão limpas hoje, então a exigência é de ZERO violações:
// qualquer regressão de acessibilidade quebra o teste.
describe("Dia 010 - Acessibilidade | Sauce Demo | Páginas sem violações", () => {
  it("a tela de login não deve ter violações", { tags: "@smoke" }, () => {
    LoginPage.visit();
    cy.injectAxe();
    cy.checkA11y(undefined, axeRunOptions, logViolations);
  });

  it("o detalhe do produto não deve ter violações", () => {
    cy.login(users.standard.username);
    InventoryPage.clickProductByName(products.backpack.name);
    cy.url().should("include", "/inventory-item.html");

    cy.injectAxe();
    cy.checkA11y(undefined, axeRunOptions, logViolations);
  });

  it("o carrinho não deve ter violações", () => {
    cy.login(users.standard.username);
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.openCart();

    cy.injectAxe();
    cy.checkA11y(undefined, axeRunOptions, logViolations);
  });

  it("o formulário de checkout (etapa 1) não deve ter violações", () => {
    cy.login(users.standard.username);
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.openCart();
    CartPage.clickCheckout();

    cy.injectAxe();
    cy.checkA11y(undefined, axeRunOptions, logViolations);
  });

  it("o resumo do pedido (etapa 2) não deve ter violações", () => {
    cy.login(users.standard.username);
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.openCart();
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");

    cy.injectAxe();
    cy.checkA11y(undefined, axeRunOptions, logViolations);
  });

  it("a confirmação do pedido não deve ter violações", () => {
    cy.login(users.standard.username);
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.openCart();
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    CheckoutPage.clickFinish();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-complete.html");

    cy.injectAxe();
    cy.checkA11y(undefined, axeRunOptions, logViolations);
  });
});

// O catálogo tem uma violação conhecida (o dropdown de ordenação). Excluí-la
// mantém o teste sensível a qualquer violação NOVA nessa tela.
describe("Dia 010 - Acessibilidade | Sauce Demo | Catálogo", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
    cy.injectAxe();
  });

  it("não deve ter violações além da já mapeada no dropdown de ordenação", () => {
    cy.checkA11y(
      undefined,
      {
        ...axeRunOptions,
        rules: { [VIOLACOES_CONHECIDAS.selectSemNome]: { enabled: false } },
      },
      logViolations,
    );
  });

  it("[VIOLAÇÃO CONHECIDA] o dropdown de ordenação não tem nome acessível", () => {
    // Um leitor de tela anuncia o controle sem dizer o que ele faz.
    // A correção seria um aria-label ou um <label> associado.
    cy.checkA11y(
      undefined,
      { ...axeRunOptions, includedImpacts: ["critical"] },
      (violations) => {
        const regras = violations.map((v) => v.id);
        expect(regras).to.include(VIOLACOES_CONHECIDAS.selectSemNome);
      },
      // skipFailures: registra a violação sem derrubar o teste, que aqui
      // existe justamente para documentá-la.
      true,
    );

    // Confirma a causa: o select não tem aria-label nem label associado.
    cy.get("[data-test='product-sort-container']").should(($select) => {
      expect($select.attr("aria-label"), "aria-label").to.be.undefined;
      expect($select.attr("aria-labelledby"), "aria-labelledby").to.be.undefined;
    });
  });
});

describe("Dia 010 - Acessibilidade | Sauce Demo | Mensagem de erro", () => {
  it("[VIOLAÇÃO CONHECIDA] o botão de fechar o erro não tem texto discernível", () => {
    LoginPage.visit();
    LoginPage.submit();
    LoginPage.getErrorMessage().should("be.visible");

    cy.injectAxe();
    cy.checkA11y(
      undefined,
      { ...axeRunOptions, includedImpacts: ["critical"] },
      (violations) => {
        const regras = violations.map((v) => v.id);
        expect(regras).to.include(VIOLACOES_CONHECIDAS.botaoSemNome);
      },
      true,
    );

    // Confirma a causa: o botão X não tem texto nem rótulo acessível.
    cy.get("[data-test='error-button']").should(($button) => {
      expect($button.text(), "texto do botão").to.equal("");
      expect($button.attr("aria-label"), "aria-label").to.be.undefined;
    });
  });
});
