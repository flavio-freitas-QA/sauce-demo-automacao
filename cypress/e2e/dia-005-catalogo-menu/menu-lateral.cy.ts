import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";
import SidebarPage from "../../support/pages/SidebarPage";

let users: any;
let products: any;

describe("Dia 005 - Catálogo e Menu | Sauce Demo | Menu Lateral", () => {
  beforeEach(() => {
    cy.fixture("users").then((userData) => {
      users = userData;
      return cy.fixture("products");
    }).then((productData) => {
      products = productData;
    });
  });

  beforeEach(() => {
    LoginPage.login(users.standard.username, users.standard.password);
    cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
  });

  it("'All Items' deve resetar a listagem mesmo após navegar para detalhe do produto", () => {
    const product = products.backpack;

    InventoryPage.clickProductByName(product.name);
    cy.url().should("include", "/inventory-item.html");

    SidebarPage.openMenu();
    SidebarPage.clickAllItems();
    cy.url().should("include", "/inventory.html");
    cy.get(".inventory_list").should("be.visible");
    cy.get(".inventory_item").should("have.length.greaterThan", 0);
  });

  it("'Reset App State' deve zerar o carrinho mesmo com itens adicionados", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);

    SidebarPage.openMenu();
    SidebarPage.clickResetAppState();

    // Fecha o menu
    cy.get("#react-burger-cross-btn").click();
    cy.get(".bm-menu-wrap", { timeout: 5000 }).should("not.be.visible");

    // Recarrega a página para refletir o estado resetado
    cy.reload();
    cy.get(".inventory_list", { timeout: 10000 }).should("be.visible");

    // Carrinho deve estar vazio
    cy.get(".shopping_cart_badge").should("not.exist");
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Add to cart");
  });

  it("deve abrir e fechar o menu lateral corretamente", () => {
    SidebarPage.openMenu();
    cy.get(".bm-menu-wrap", { timeout: 5000 }).should("be.visible");
    cy.get("#inventory_sidebar_link").should("be.visible");
    cy.get("#about_sidebar_link").should("be.visible");
    cy.get("#logout_sidebar_link").should("be.visible");
    cy.get("#reset_sidebar_link").should("be.visible");

    SidebarPage.closeMenu();
    cy.get(".bm-menu-wrap", { timeout: 5000 }).should("not.be.visible");
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