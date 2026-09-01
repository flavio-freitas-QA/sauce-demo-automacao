import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import CheckoutPage from "../../support/pages/CheckoutPage";
import SidebarPage from "../../support/pages/SidebarPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

// Viewport de celular. O bug clássico aqui é o scroll horizontal: a página
// "funciona", mas o usuário precisa arrastar para o lado para ler o conteúdo.
describe("Dia 010 - Responsividade | Sauce Demo | Mobile", () => {
  beforeEach(() => {
    cy.viewport("iphone-x");
    cy.login(users.standard.username);
  });

  it("o catálogo não deve exigir rolagem horizontal", () => {
    cy.document().then((doc) => {
      expect(
        doc.documentElement.scrollWidth,
        "largura do conteúdo não deve exceder a da tela",
      ).to.be.at.most(doc.documentElement.clientWidth);
    });
  });

  it("os produtos devem empilhar em uma única coluna", () => {
    cy.getButtonColumns().should("have.length", 1);
  });

  it("o cabeçalho deve manter carrinho e menu acessíveis", () => {
    cy.get("[data-test='shopping-cart-link']").should("be.visible");
    cy.get("#react-burger-menu-btn").should("be.visible");
  });

  it("o menu lateral deve abrir e fechar em tela pequena", () => {
    SidebarPage.openMenu();
    SidebarPage.getAllItemsLink().should("be.visible");
    SidebarPage.getLogoutLink().should("be.visible");

    SidebarPage.closeMenu();
  });

  it("deve completar uma compra inteira em viewport de celular", () => {
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);

    InventoryPage.openCart();
    CartPage.getItemByName(products.backpack.name).should("be.visible");

    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");

    CheckoutPage.clickFinish();
    CheckoutPage.getConfirmationMessage().should("contain.text", "Thank you for your order!");
  });
});

describe("Dia 010 - Responsividade | Sauce Demo | Sem rolagem horizontal", () => {
  const paginas = [
    { nome: "carrinho", rota: "/cart.html" },
    { nome: "checkout etapa 1", rota: "/checkout-step-one.html" },
  ];

  paginas.forEach(({ nome, rota }) => {
    it(`a página de ${nome} não deve exigir rolagem horizontal`, () => {
      cy.viewport("iphone-x");
      cy.login(users.standard.username);
      cy.visit(rota, { failOnStatusCode: false });

      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth).to.be.at.most(
          doc.documentElement.clientWidth,
        );
      });
    });
  });
});
