import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const parsePrice = (value: string | null) => Number((value || "").replace(/[^0-9.]/g, ""));

test.describe("Dia 003 - Fluxo de Checkout | Sauce Demo", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.addProductByName(products.bikeLight.name);
    await cartPage.goto();
  });

  test("deve completar checkout com sucesso", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });
    await checkoutPage.clickFinish();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.confirmationMessage).toContainText("Thank you for your order!");
    await expect(page.locator(".shopping_cart_badge")).toHaveCount(0);
  });

  test("deve validar erro ao avançar sem preencher nome", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await expect(checkoutPage.errorMessage).toContainText("First Name is required");
  });

  test("deve validar erro ao avançar sem preencher sobrenome", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "", "12345");
    await checkoutPage.clickContinue();
    await expect(checkoutPage.errorMessage).toContainText("Last Name is required");
  });

  test("deve validar erro ao avançar sem preencher CEP", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "");
    await checkoutPage.clickContinue();
    await expect(checkoutPage.errorMessage).toContainText("Postal Code is required");
  });

  test("deve retornar ao carrinho ao clicar em Cancel na Etapa 1", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.clickCancel();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test("deve retornar à tela de produtos ao clicar em Cancel na Etapa 2", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });
    await checkoutPage.clickCancel();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("deve calcular corretamente o subtotal na Etapa 2", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const expectedSubtotal = parsePrice(products.backpack.price) + parsePrice(products.bikeLight.price);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });
    await expect(checkoutPage.itemTotal).toContainText(`$${expectedSubtotal.toFixed(2)}`);
  });

  test("deve calcular corretamente o total na Etapa 2", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const expectedSubtotal = parsePrice(products.backpack.price) + parsePrice(products.bikeLight.price);
    const expectedTax = Number((expectedSubtotal * 0.08).toFixed(2));
    const expectedTotal = Number((expectedSubtotal + expectedTax).toFixed(2));

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });
    await expect(checkoutPage.tax).toContainText(`$${expectedTax.toFixed(2)}`);
    await expect(checkoutPage.total).toContainText(`$${expectedTotal.toFixed(2)}`);
  });

  test("deve esvaziar o carrinho após finalizar o checkout", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });
    await checkoutPage.clickFinish();
    await expect(page.locator(".shopping_cart_badge")).toHaveCount(0);
  });

  test("deve retornar à tela de produtos ao clicar em Back Home", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });
    await checkoutPage.clickFinish();
    await checkoutPage.clickBackHome();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});

test("deve redirecionar ao acessar checkout diretamente sem login", async ({ page }) => {
  for (const path of ["/checkout-step-one.html", "/checkout-step-two.html"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\//);
    await expect(page.getByText(`You can only access '${path}' when you are logged in.`)).toBeVisible();
  }
});
