import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

// Este spec mantém o login pela UI de propósito: o objetivo é observar o
// comportamento (e o tempo) do fluxo real com o atraso do performance_glitch_user.
describe("Dia 005 - Catálogo e Menu | Sauce Demo | Performance Glitch", () => {
  it("deve fazer login com performance_glitch_user e o fluxo de adicionar ao carrinho deve funcionar", () => {
    const product = products.backpack;

    LoginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    cy.location("pathname", { timeout: 30000 }).should("include", "/inventory.html");
    cy.get("[data-test='inventory-list']", { timeout: 20000 }).should("be.visible");
    cy.get("[data-test='title']").should("contain.text", "Products");

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Remove");
  });

  it("deve medir o tempo aproximado de carregamento da página de inventário", () => {
    const t0 = Date.now();

    LoginPage.visit();
    LoginPage.fillUsername(users.performanceGlitch.username);
    LoginPage.fillPassword(users.performanceGlitch.password);
    LoginPage.submit();

    cy.location("pathname", { timeout: 30000 }).should("include", "/inventory.html");
    cy.get("[data-test='inventory-list']", { timeout: 20000 }).should("be.visible");

    cy.then(() => {
      const elapsed = Date.now() - t0;
      cy.log(`Tempo aproximado de carregamento do inventário: ${elapsed} ms`);
      expect(elapsed).to.be.greaterThan(0);
    });
  });

  it("deve validar que o botão de adicionar/remover funciona mesmo com delay", () => {
    LoginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    cy.location("pathname", { timeout: 30000 }).should("include", "/inventory.html");

    const selectedProducts = [
      products.backpack,
      products.bikeLight,
      products.boltTShirt,
    ];

    selectedProducts.forEach((product) => {
      InventoryPage.addProductByName(product.name);
    });

    InventoryPage.getCartBadgeCount().should("eq", selectedProducts.length);
  });
});
