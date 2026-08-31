import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import CheckoutPage from "../../support/pages/CheckoutPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

// Complemento do dia 006: bugs conhecidos adicionais dos usuários especiais,
// todos confirmados manualmente contra o site antes de virarem teste.
describe("Dia 008 - Bugs Conhecidos Extras | Sauce Demo | problem_user", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    cy.login(users.problem.username);
  });

  it("[BUG CONHECIDO] deve exibir a mesma imagem quebrada (sl-404) em todos os produtos", () => {
    InventoryPage.getProductImages()
      .should("have.length.at.least", 1)
      .each(($img) => {
        expect($img.attr("src")).to.contain("sl-404");
      });
  });

  it("[BUG CONHECIDO] a ordenação Z-A não reordena os produtos (falha silenciosa)", () => {
    InventoryPage.getAllProductNames().then((namesBefore) => {
      InventoryPage.sortProducts("za");
      InventoryPage.getAllProductNames().then((namesAfter) => {
        // Bug conhecido: a lista permanece na ordem original
        expect(namesAfter).to.deep.equal(namesBefore);
      });
    });
  });
});

describe("Dia 008 - Bugs Conhecidos Extras | Sauce Demo | error_user", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => false);
    cy.login(users.errorUser.username);
  });

  it("[BUG CONHECIDO] a ordenação dispara alerta 'Sorting is broken!'", () => {
    const alertStub = cy.stub().as("alerta");
    cy.on("window:alert", alertStub);

    InventoryPage.sortProducts("za");

    cy.get("@alerta").should(
      "have.been.calledWithMatch",
      /Sorting is broken!/
    );
  });

  it("[BUG CONHECIDO] o campo Last Name do checkout não aceita digitação", () => {
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.openCart();
    CartPage.clickCheckout();

    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");

    // Bug conhecido: o valor digitado em Last Name é descartado pelo app
    cy.get("[data-test='firstName']").should("have.value", "Flavio");
    cy.get("[data-test='lastName']").should("have.value", "");
  });
});
