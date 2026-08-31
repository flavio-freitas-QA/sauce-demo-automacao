import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import CheckoutPage from "../../support/pages/CheckoutPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const parsePrice = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

describe("Dia 008 - Checkout Completo | Sauce Demo", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
  });

  it("deve exibir as informações de pagamento e envio na Etapa 2", () => {
    InventoryPage.addProductByName(products.backpack.name);
    InventoryPage.openCart();
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");

    CheckoutPage.getPaymentInfo().should("have.text", "SauceCard #31337");
    CheckoutPage.getShippingInfo().should("have.text", "Free Pony Express Delivery!");
  });

  it("deve calcular o total corretamente no checkout com todos os 6 produtos", () => {
    const allProducts = Object.values(products);
    const expectedSubtotal = Number(
      allProducts.reduce((sum, product) => sum + parsePrice(product.price), 0).toFixed(2)
    );
    const expectedTax = Number((expectedSubtotal * 0.08).toFixed(2));
    const expectedTotal = Number((expectedSubtotal + expectedTax).toFixed(2));

    allProducts.forEach((product) => {
      InventoryPage.addProductByName(product.name);
    });
    InventoryPage.getCartBadgeCount().should("eq", allProducts.length);

    InventoryPage.openCart();
    CartPage.clickCheckout();
    CheckoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    CheckoutPage.clickContinue();
    cy.location("pathname", { timeout: 15000 }).should("include", "/checkout-step-two.html");

    CheckoutPage.getSummaryItems().should("have.length", allProducts.length);
    CheckoutPage.getItemTotal().should((value: string) => {
      expect(parsePrice(value)).to.equal(expectedSubtotal);
    });
    CheckoutPage.getTax().should((value: string) => {
      expect(parsePrice(value)).to.equal(expectedTax);
    });
    CheckoutPage.getTotal().should((value: string) => {
      expect(parsePrice(value)).to.equal(expectedTotal);
    });

    CheckoutPage.clickFinish();
    CheckoutPage.getConfirmationMessage().should("contain.text", "Thank you for your order!");
    InventoryPage.getCartBadgeCount().should("eq", 0);
  });
});
