import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import CheckoutPage from "../../support/pages/CheckoutPage";

let users: any;
let products: any;

const parsePrice = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

describe("Dia 003 - Fluxo de Checkout | Sauce Demo", () => {
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
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.addProductByName(products.bikeLight.name);
    cy.visit("/cart.html", { failOnStatusCode: false });
  });

  it("deve completar checkout com sucesso", () => {
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
    CheckoutPage.clickFinish();

    CheckoutPage.getConfirmationMessage().should("contain.text", "Thank you for your order!");
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-complete.html");
    InventoryPage.getCartBadgeCount().should("eq", 0);
  });

  it("deve validar erro ao avançar sem preencher nome", () => {
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("", "Freitas", "12345");
    CheckoutPage.clickContinue();
    CheckoutPage.getErrorMessage().should("contain.text", "First Name is required");
  });

  it("deve validar erro ao avançar sem preencher sobrenome", () => {
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "", "12345");
    CheckoutPage.clickContinue();
    CheckoutPage.getErrorMessage().should("contain.text", "Last Name is required");
  });

  it("deve validar erro ao avançar sem preencher CEP", () => {
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "");
    CheckoutPage.clickContinue();
    CheckoutPage.getErrorMessage().should("contain.text", "Postal Code is required");
  });

  it("deve retornar ao carrinho ao clicar em Cancel na Etapa 1", () => {
    CartPage.clickCheckout();
    CheckoutPage.clickCancel();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/cart.html");
  });

  it("deve retornar à tela de produtos ao clicar em Cancel na Etapa 2", () => {
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
    CheckoutPage.clickCancel();
    cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
  });

  it("deve calcular corretamente o subtotal na Etapa 2", () => {
    const expectedSubtotal = parsePrice(products.backpack.price) + parsePrice(products.bikeLight.price);

    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
    CheckoutPage.getItemTotal().should((value: string) => {
      expect(parsePrice(value)).to.equal(expectedSubtotal);
    });
  });

  it("deve calcular corretamente o total na Etapa 2", () => {
    const expectedSubtotal = parsePrice(products.backpack.price) + parsePrice(products.bikeLight.price);
    const expectedTax = Number((expectedSubtotal * 0.08).toFixed(2));
    const expectedTotal = Number((expectedSubtotal + expectedTax).toFixed(2));

    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
    CheckoutPage.getTax().should((value: string) => {
      expect(parsePrice(value)).to.equal(expectedTax);
    });
    CheckoutPage.getTotal().should((value: string) => {
      expect(parsePrice(value)).to.equal(expectedTotal);
    });
  });

  it("deve esvaziar o carrinho após finalizar o checkout", () => {
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
    CheckoutPage.clickFinish();
    InventoryPage.getCartBadgeCount().should("eq", 0);
  });

  it("deve retornar à tela de produtos ao clicar em Back Home", () => {
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");
    CheckoutPage.clickFinish();
    CheckoutPage.clickBackHome();
    cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
  });
});

describe("Dia 003 - Fluxo de Checkout | Sauce Demo | Segurança", () => {
  it("deve redirecionar ao acessar checkout diretamente sem login", () => {
    ["/checkout-step-one.html", "/checkout-step-two.html"].forEach((path) => {
      cy.visit(path, { failOnStatusCode: false });
      cy.location("pathname", { timeout: 15000 }).should("eq", "/");
      cy.contains(`You can only access '${path}' when you are logged in.`).should("be.visible");
    });
  });
});
