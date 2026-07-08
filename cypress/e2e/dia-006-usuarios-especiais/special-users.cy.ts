import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import CheckoutPage from "../../support/pages/CheckoutPage";
import ProductDetailPage from "../../support/pages/ProductDetailPage";

let users: any;
let products: any;

const USERS_TO_TEST = ["problem", "errorUser", "visualUser"];

describe("Dia 006 - Usuários Especiais | Sauce Demo", () => {
  before(() => {
    cy.fixture("users").then((u) => {
      users = u;
      return cy.fixture("products");
    }).then((p) => {
      products = p;
    });
  });

  USERS_TO_TEST.forEach((userKey) => {
    const userLabel = userKey === "errorUser" ? "error_user" : userKey === "visualUser" ? "visual_user" : userKey;

    describe(`Fluxo com ${userLabel}`, () => {
      beforeEach(() => {
        LoginPage.login(users[userKey].username, users[userKey].password);
        cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
      });

      it(`${userLabel} - deve fazer login e exibir o catálogo`, () => {
        cy.get(".inventory_list", { timeout: 10000 }).should("be.visible");
        cy.get(".title").should("contain.text", "Products");
        cy.get(".inventory_item").should("have.length.at.least", 1);
      });

      if (userKey === "visualUser") {
        it(`${userLabel} - deve adicionar e remover item no carrinho`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          InventoryPage.getCartBadgeCount().should("eq", 1);

          InventoryPage.removeProductByName(product.name);
          InventoryPage.getCartBadgeCount().should("eq", 0);
        });
      } else {
        it(`${userLabel} - [BUG CONHECIDO] adiciona item mas não consegue remover`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          InventoryPage.getCartBadgeCount().should("eq", 1);

          InventoryPage.removeProductByName(product.name);
          // Bug conhecido: o badge permanece em 1, a remoção não funciona
          InventoryPage.getCartBadgeCount().should("eq", 1);
        });
      }

      if (userKey === "visualUser") {
        it(`${userLabel} - deve navegar para o detalhe do produto e voltar`, () => {
          const product = products.backpack;

          InventoryPage.clickProductByName(product.name);
          cy.url().should("include", "/inventory-item.html");
          cy.get(".inventory_details_name").should("contain.text", product.name);

          ProductDetailPage.clickBackToProducts();
          cy.url().should("include", "/inventory.html");
          cy.get(".inventory_list").should("be.visible");
        });
      } else if (userKey === "errorUser") {
        it(`${userLabel} - deve navegar para o detalhe do produto e voltar`, () => {
          const product = products.backpack;

          InventoryPage.clickProductByName(product.name);
          cy.url().should("include", "/inventory-item.html");
          cy.get(".inventory_details_name").should("contain.text", product.name);

          ProductDetailPage.clickBackToProducts();
          cy.url().should("include", "/inventory.html");
          cy.get(".inventory_list").should("be.visible");
        });
      } else {
        it(`${userLabel} - [BUG CONHECIDO] ao clicar no produto exibe o produto errado`, () => {
          const product = products.backpack;

          InventoryPage.clickProductByName(product.name);
          cy.url().should("include", "/inventory-item.html");
          // Bug conhecido: problem_user vê imagem/nome de outro produto
          cy.get(".inventory_details_name").should("not.contain.text", product.name);
        });
      }

      if (userKey === "visualUser") {
        it(`${userLabel} - deve completar o fluxo de checkout`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          cy.visit("/cart.html", { failOnStatusCode: false });
          CartPage.clickCheckout();
          CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          CheckoutPage.clickContinue();
          cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
          CheckoutPage.clickFinish();
          CheckoutPage.getConfirmationMessage().should("be.visible");
        });
      } else if (userKey === "errorUser") {
        it(`${userLabel} - [BUG CONHECIDO] checkout falha na tela de confirmação`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          cy.visit("/cart.html", { failOnStatusCode: false });
          CartPage.clickCheckout();
          CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          CheckoutPage.clickContinue();
          cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
          CheckoutPage.clickFinish();
          // Bug conhecido: error_user não vê a mensagem de confirmação
          cy.get(".checkout_complete_container").should("not.exist");
        });
      } else {
        it(`${userLabel} - [BUG CONHECIDO] checkout trava na etapa 1 (não avança)`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          cy.visit("/cart.html", { failOnStatusCode: false });
          CartPage.clickCheckout();
          CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          CheckoutPage.clickContinue();
          // Bug conhecido: problem_user não avança para step-two
          cy.location("pathname", { timeout: 8000 }).should("include", "/checkout-step-one.html");
        });
      }
    });
  });
});
