import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const usersToTest = ["problem", "errorUser", "visualUser"] as const;

const userLabel = (userKey: (typeof usersToTest)[number]) =>
  userKey === "errorUser" ? "error_user" : userKey === "visualUser" ? "visual_user" : userKey;

test.describe("Dia 006 - Usuarios Especiais | Sauce Demo", () => {
  for (const userKey of usersToTest) {
    test.describe(`Fluxo com ${userLabel(userKey)}`, () => {
      test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(users[userKey].username, users[userKey].password);
        await expect(page).toHaveURL(/inventory\.html/);
      });

      test(`${userLabel(userKey)} - deve fazer login e exibir o catalogo`, async ({ page }) => {
        await expect(page.locator(".inventory_list")).toBeVisible({ timeout: 10000 });
        await expect(page.locator(".title")).toContainText("Products");
        await expect(page.locator(".inventory_item").first()).toBeVisible();
      });

      if (userKey === "visualUser") {
        test(`${userLabel(userKey)} - deve adicionar e remover item no carrinho`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

          await inventoryPage.removeProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(0);
        });
      } else {
        test(`${userLabel(userKey)} - [BUG CONHECIDO] adiciona item mas nao consegue remover`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

          await inventoryPage.removeProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
        });
      }

      if (userKey === "problem") {
        test(`${userLabel(userKey)} - [BUG CONHECIDO] ao clicar no produto exibe o produto errado`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);

          await inventoryPage.clickProductByName(products.backpack.name);
          await expect(page).toHaveURL(/inventory-item\.html/);
          await expect(page.locator(".inventory_details_name")).not.toContainText(products.backpack.name);
        });
      } else {
        test(`${userLabel(userKey)} - deve navegar para o detalhe do produto e voltar`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);
          const productDetailPage = new ProductDetailPage(page);

          await inventoryPage.clickProductByName(products.backpack.name);
          await expect(page).toHaveURL(/inventory-item\.html/);
          await expect(productDetailPage.productName).toContainText(products.backpack.name);

          await productDetailPage.clickBackToProducts();
          await expect(page).toHaveURL(/inventory\.html/);
          await expect(page.locator(".inventory_list")).toBeVisible();
        });
      }

      if (userKey === "visualUser") {
        test(`${userLabel(userKey)} - deve completar o fluxo de checkout`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);
          const cartPage = new CartPage(page);
          const checkoutPage = new CheckoutPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await cartPage.goto();
          await cartPage.clickCheckout();
          await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          await checkoutPage.clickContinue();
          await expect(page).toHaveURL(/checkout-step-two\.html/);
          await checkoutPage.clickFinish();
          await expect(checkoutPage.confirmationMessage).toBeVisible();
        });
      } else if (userKey === "errorUser") {
        test(`${userLabel(userKey)} - [BUG CONHECIDO] checkout falha na tela de confirmacao`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);
          const cartPage = new CartPage(page);
          const checkoutPage = new CheckoutPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await cartPage.goto();
          await cartPage.clickCheckout();
          await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          await checkoutPage.clickContinue();
          await expect(page).toHaveURL(/checkout-step-two\.html/);
          await checkoutPage.clickFinish();
          await expect(page.locator(".checkout_complete_container")).toHaveCount(0);
        });
      } else {
        test(`${userLabel(userKey)} - [BUG CONHECIDO] checkout trava na etapa 1 (nao avanca)`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);
          const cartPage = new CartPage(page);
          const checkoutPage = new CheckoutPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await cartPage.goto();
          await cartPage.clickCheckout();
          await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          await checkoutPage.clickContinue();
          await expect(page).toHaveURL(/checkout-step-one\.html/, { timeout: 8000 });
        });
      }
    });
  }
});
