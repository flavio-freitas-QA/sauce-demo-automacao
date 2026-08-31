import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const usersToTest = ["problem", "errorUser", "visualUser"] as const;

const userLabel = (userKey: (typeof usersToTest)[number]) =>
  userKey === "errorUser" ? "error_user" : userKey === "visualUser" ? "visual_user" : userKey;

// Anotação padrão para os testes que documentam bugs propositais do site;
// aparece no relatório HTML junto ao teste.
const annotateKnownBug = (description: string) =>
  test.info().annotations.push({ type: "known-bug", description });

test.describe("Dia 006 - Usuarios Especiais | Sauce Demo", () => {
  for (const userKey of usersToTest) {
    const label = userLabel(userKey);

    test.describe(`Fluxo com ${label}`, () => {
      test.beforeEach(async ({ loginAs }) => {
        await loginAs(users[userKey].username);
      });

      test(`${label} - deve exibir o catalogo ao autenticar`, async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await expect(inventoryPage.list).toBeVisible({ timeout: 10000 });
        await expect(page.locator("[data-test='title']")).toContainText("Products");
        await expect(page.locator("[data-test='inventory-item']").first()).toBeVisible();
      });

      if (userKey === "visualUser") {
        test(`${label} - deve adicionar e remover item no carrinho`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

          await inventoryPage.removeProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(0);
        });
      } else {
        test(`${label} - [BUG CONHECIDO] adiciona item mas nao consegue remover`, async ({ page }) => {
          annotateKnownBug(`${label} adiciona item ao carrinho mas o botão Remove não funciona`);
          const inventoryPage = new InventoryPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

          await inventoryPage.removeProductByName(products.backpack.name);
          await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
        });
      }

      if (userKey === "problem") {
        test(`${label} - [BUG CONHECIDO] ao clicar no produto exibe o produto errado`, async ({ page }) => {
          annotateKnownBug("problem_user vê imagem/nome de outro produto na página de detalhe");
          const inventoryPage = new InventoryPage(page);
          const productDetailPage = new ProductDetailPage(page);

          await inventoryPage.clickProductByName(products.backpack.name);
          await expect(page).toHaveURL(/inventory-item\.html/);
          await expect(productDetailPage.productName).not.toContainText(products.backpack.name);
        });
      } else {
        test(`${label} - deve navegar para o detalhe do produto e voltar`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);
          const productDetailPage = new ProductDetailPage(page);

          await inventoryPage.clickProductByName(products.backpack.name);
          await expect(page).toHaveURL(/inventory-item\.html/);
          await expect(productDetailPage.productName).toContainText(products.backpack.name);

          await productDetailPage.clickBackToProducts();
          await expect(page).toHaveURL(/inventory\.html/);
          await expect(inventoryPage.list).toBeVisible();
        });
      }

      if (userKey === "visualUser") {
        test(`${label} - deve completar o fluxo de checkout`, async ({ page }) => {
          const inventoryPage = new InventoryPage(page);
          const cartPage = new CartPage(page);
          const checkoutPage = new CheckoutPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await inventoryPage.openCart();
          await cartPage.clickCheckout();
          await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          await checkoutPage.clickContinue();
          await expect(page).toHaveURL(/checkout-step-two\.html/);
          await checkoutPage.clickFinish();
          await expect(checkoutPage.confirmationMessage).toBeVisible();
        });
      } else if (userKey === "errorUser") {
        test(`${label} - [BUG CONHECIDO] checkout falha na tela de confirmacao`, async ({ page }) => {
          annotateKnownBug("error_user finaliza o checkout mas não vê a confirmação do pedido");
          const inventoryPage = new InventoryPage(page);
          const cartPage = new CartPage(page);
          const checkoutPage = new CheckoutPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await inventoryPage.openCart();
          await cartPage.clickCheckout();
          await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          await checkoutPage.clickContinue();
          await expect(page).toHaveURL(/checkout-step-two\.html/);
          await checkoutPage.clickFinish();
          await expect(page.locator("[data-test='checkout-complete-container']")).toHaveCount(0);
        });
      } else {
        test(`${label} - [BUG CONHECIDO] checkout trava na etapa 1 (nao avanca)`, async ({ page }) => {
          annotateKnownBug("problem_user não consegue avançar da etapa 1 do checkout (Last Name não é preenchido)");
          const inventoryPage = new InventoryPage(page);
          const cartPage = new CartPage(page);
          const checkoutPage = new CheckoutPage(page);

          await inventoryPage.addProductByName(products.backpack.name);
          await inventoryPage.openCart();
          await cartPage.clickCheckout();
          await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
          await checkoutPage.clickContinue();
          await expect(page).toHaveURL(/checkout-step-one\.html/, { timeout: 8000 });
        });
      }
    });
  }
});
