import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const parsePrice = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

test.describe("Dia 008 - Checkout Completo | Sauce Demo", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.standard.username);
  });

  test("deve exibir as informacoes de pagamento e envio na Etapa 2", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });

    await expect(checkoutPage.paymentInfo).toHaveText("SauceCard #31337");
    await expect(checkoutPage.shippingInfo).toHaveText("Free Pony Express Delivery!");
  });

  test("deve calcular o total corretamente no checkout com todos os 6 produtos", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const allProducts = Object.values(products);
    const expectedSubtotal = Number(
      allProducts.reduce((sum, product) => sum + parsePrice(product.price), 0).toFixed(2)
    );
    const expectedTax = Number((expectedSubtotal * 0.08).toFixed(2));
    const expectedTotal = Number((expectedSubtotal + expectedTax).toFixed(2));

    for (const product of allProducts) {
      await inventoryPage.addProductByName(product.name);
    }
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(allProducts.length);

    await inventoryPage.openCart();
    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });

    await expect(page.locator(".cart_item")).toHaveCount(allProducts.length);
    await expect(checkoutPage.itemTotal).toContainText(`$${expectedSubtotal.toFixed(2)}`);
    await expect(checkoutPage.tax).toContainText(`$${expectedTax.toFixed(2)}`);
    await expect(checkoutPage.total).toContainText(`$${expectedTotal.toFixed(2)}`);

    await checkoutPage.clickFinish();
    await expect(checkoutPage.confirmationMessage).toContainText("Thank you for your order!");
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });
});
