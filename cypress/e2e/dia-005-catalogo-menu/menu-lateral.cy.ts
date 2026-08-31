import InventoryPage from "../../support/pages/InventoryPage";
import SidebarPage from "../../support/pages/SidebarPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

describe("Dia 005 - Catálogo e Menu | Sauce Demo | Menu Lateral", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
  });

  it("'All Items' deve resetar a listagem mesmo após navegar para detalhe do produto", () => {
    const product = products.backpack;

    InventoryPage.clickProductByName(product.name);
    cy.url().should("include", "/inventory-item.html");

    SidebarPage.openMenu();
    SidebarPage.clickAllItems();
    cy.url().should("include", "/inventory.html");
    cy.get("[data-test='inventory-list']").should("be.visible");
    cy.get("[data-test='inventory-item']").should("have.length.greaterThan", 0);
  });

  it("'Reset App State' deve zerar o carrinho mesmo com itens adicionados", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);

    SidebarPage.openMenu();
    SidebarPage.clickResetAppState();
    SidebarPage.closeMenu();

    // Recarrega a página para refletir o estado resetado
    cy.reload();
    cy.get("[data-test='inventory-list']", { timeout: 10000 }).should("be.visible");

    // Carrinho deve estar vazio
    cy.get("[data-test='shopping-cart-badge']").should("not.exist");
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Add to cart");
  });

  it("deve abrir e fechar o menu lateral corretamente", () => {
    SidebarPage.openMenu();
    SidebarPage.getAllItemsLink().should("be.visible");
    SidebarPage.getAboutLink().should("be.visible");
    SidebarPage.getLogoutLink().should("be.visible");
    SidebarPage.getResetAppStateLink().should("be.visible");

    SidebarPage.closeMenu();
  });

  it("'Logout' deve funcionar corretamente mesmo com carrinho cheio", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);

    SidebarPage.openMenu();
    SidebarPage.clickLogout();
    cy.url().should("eq", "https://www.saucedemo.com/");
    cy.get("[data-test='login-button']").should("be.visible");
  });

  it("'About' deve redirecionar para a URL externa esperada (saucelabs.com)", () => {
    SidebarPage.openMenu();
    SidebarPage.clickAbout();
    cy.url().should("include", "saucelabs.com");
  });
});
