import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const allProducts = [
  products.backpack,
  products.bikeLight,
  products.boltTShirt,
  products.fleeceJacket,
  products.onesie,
  products.redShirt,
];

test.describe("Dia 002 - Fluxo de Carrinho | Sauce Demo", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.standard.username);
  });

  test("deve adicionar 1 produto e atualizar o contador do carrinho", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
  });

  test("deve adicionar todos os produtos e exibir contador 6 no carrinho", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    for (const product of allProducts) {
      await inventoryPage.addProductByName(product.name);
    }

    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(6);
    await inventoryPage.openCart();
    for (const product of allProducts) {
      await expect(cartPage.getItemByName(product.name)).toBeVisible();
    }
  });

  test("deve remover um produto diretamente da tela de inventário", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
    await inventoryPage.removeProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(0);
  });

  test("deve remover um produto dentro da tela do carrinho e atualizar o contador", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.removeItemByName(products.backpack.name);
    await expect(cartPage.items).toHaveCount(0);
  });

  test("deve manter a tela do carrinho vazia sem quebrar (acesso via deep link)", async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.title).toHaveText("Your Cart");
  });

  test("deve preservar o contador ao navegar entre inventário e carrinho", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickContinueShopping();
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
  });

  test("deve manter nome e preço consistentes entre inventário e carrinho", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const inventoryName = await inventoryPage.getProductName(products.backpack.name);
    const inventoryPrice = await inventoryPage.getProductPrice(products.backpack.name);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    const cartName = await cartPage.getItemName(products.backpack.name);
    const cartPrice = await cartPage.getItemPrice(products.backpack.name);
    expect(cartName?.trim()).toBe(inventoryName?.trim());
    expect(cartPrice?.trim()).toBe(inventoryPrice?.trim());
  });

  test("deve retornar à tela de produtos ao clicar em Continue Shopping", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickContinueShopping();
    await expect(page).toHaveURL(/inventory.html/);
  });

  test("deve persistir o carrinho após recarregar a página", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(inventoryPage.cartBadge).toHaveText("1", { timeout: 10000 });
    await expect(inventoryPage.getProductCard(products.backpack.name).getByRole("button")).toContainText("Remove");
  });

  test("deve acessar o carrinho autenticado por deep link e exibir a página corretamente", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await cartPage.goto();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.title).toHaveText("Your Cart");
    await expect(cartPage.getItemByName(products.backpack.name)).toBeVisible();
  });
});

test.describe("Dia 002 - Fluxo de Carrinho | Sauce Demo | Acesso direto", () => {
  test("deve redirecionar ao acessar o carrinho sem login", async ({ page }) => {
    await page.goto("/cart.html", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("You can only access '/cart.html' when you are logged in.")).toBeVisible();
  });
});

test.describe("Dia 002 - Fluxo de Carrinho | Sauce Demo | Usuário problem", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.problem.username);
  });

  test("deve manter o fluxo funcional do carrinho com problem_user", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
    await inventoryPage.openCart();
    await expect(cartPage.getItemByName(products.backpack.name)).toBeVisible();
  });
});
