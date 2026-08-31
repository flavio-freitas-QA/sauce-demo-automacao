import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import CheckoutPage from "../../support/pages/CheckoutPage";
import ProductDetailPage from "../../support/pages/ProductDetailPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const USERS_TO_TEST = ["problem", "errorUser", "visualUser"] as const;

const userLabel = (userKey: (typeof USERS_TO_TEST)[number]) =>
  userKey === "errorUser" ? "error_user" : userKey === "visualUser" ? "visual_user" : userKey;

describe("Dia 006 - Usuários Especiais | Sauce Demo", () => {
  USERS_TO_TEST.forEach((userKey) => {
    const label = userLabel(userKey);

    describe(`Fluxo com ${label}`, () => {
      beforeEach(() => {
        // error_user e problem_user disparam exceções de JS propositais;
        // o handler escopado evita que esses erros conhecidos derrubem o teste
        // sem esconder erros nos demais specs da suíte.
        cy.on("uncaught:exception", () => false);
        cy.login(users[userKey].username);
      });

      it(`${label} - deve exibir o catálogo ao autenticar`, () => {
        cy.get("[data-test='inventory-list']", { timeout: 10000 }).should("be.visible");
        cy.get("[data-test='title']").should("contain.text", "Products");
        cy.get("[data-test='inventory-item']").should("have.length.at.least", 1);
      });

      if (userKey === "visualUser") {
        it(`${label} - deve adicionar e remover item no carrinho`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          InventoryPage.getCartBadgeCount().should("eq", 1);

          InventoryPage.removeProductByName(product.name);
          InventoryPage.getCartBadgeCount().should("eq", 0);
        });
      } else {
        it(`${label} - [BUG CONHECIDO] adiciona item mas não consegue remover`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          InventoryPage.getCartBadgeCount().should("eq", 1);

          InventoryPage.removeProductByName(product.name);
          // Bug conhecido: o badge permanece em 1, a remoção não funciona
          InventoryPage.getCartBadgeCount().should("eq", 1);
        });
      }

      if (userKey === "problem") {
        it(`${label} - [BUG CONHECIDO] ao clicar no produto exibe o produto errado`, () => {
          const product = products.backpack;

          InventoryPage.clickProductByName(product.name);
          cy.url().should("include", "/inventory-item.html");
          // Bug conhecido: problem_user vê imagem/nome de outro produto
          ProductDetailPage.getProductName().should("not.contain.text", product.name);
        });
      } else {
        it(`${label} - deve navegar para o detalhe do produto e voltar`, () => {
          const product = products.backpack;

          InventoryPage.clickProductByName(product.name);
          cy.url().should("include", "/inventory-item.html");
          ProductDetailPage.getProductName().should("contain.text", product.name);

          ProductDetailPage.clickBackToProducts();
          cy.url().should("include", "/inventory.html");
          cy.get("[data-test='inventory-list']").should("be.visible");
        });
      }

      if (userKey === "visualUser") {
        it(`${label} - deve completar o fluxo de checkout`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          InventoryPage.openCart();
          CartPage.clickCheckout();
          CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          CheckoutPage.clickContinue();
          cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
          CheckoutPage.clickFinish();
          CheckoutPage.getConfirmationMessage().should("be.visible");
        });
      } else if (userKey === "errorUser") {
        it(`${label} - [BUG CONHECIDO] checkout falha na tela de confirmação`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          InventoryPage.openCart();
          CartPage.clickCheckout();
          CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          CheckoutPage.clickContinue();
          cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
          CheckoutPage.clickFinish();
          // Bug conhecido: error_user não vê a mensagem de confirmação
          cy.get("[data-test='checkout-complete-container']").should("not.exist");
        });
      } else {
        it(`${label} - [BUG CONHECIDO] checkout trava na etapa 1 (não avança)`, () => {
          const product = products.backpack;

          InventoryPage.addProductByName(product.name);
          InventoryPage.openCart();
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
