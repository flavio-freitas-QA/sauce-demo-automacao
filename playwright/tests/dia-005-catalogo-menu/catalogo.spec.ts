import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const sortedAsc = <T extends string | number>(values: T[]) => [...values].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

test.describe("Dia 005 - Catalogo e Menu | Sauce Demo | Ordenacao", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("deve ordenar produtos por nome A-Z", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortProducts("az");
    const names = await inventoryPage.getAllProductNames();
    expect(names).toEqual(sortedAsc(names));
  });

  test("deve ordenar produtos por nome Z-A", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortProducts("za");
    const names = await inventoryPage.getAllProductNames();
    expect(names).toEqual(sortedAsc(names).reverse());
  });

  test("deve ordenar produtos por preco menor-maior", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortProducts("lohi");
    const prices = await inventoryPage.getAllProductPrices();
    expect(prices).toEqual(sortedAsc(prices));
  });

  test("deve ordenar produtos por preco maior-menor", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortProducts("hilo");
    const prices = await inventoryPage.getAllProductPrices();
    expect(prices).toEqual(sortedAsc(prices).reverse());
  });

  test("deve manter a consistencia dos produtos ao alternar entre ordenacoes", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.sortProducts("za");
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
    await expect(inventoryPage.getProductCard(products.backpack.name).getByRole("button")).toContainText("Remove");

    await inventoryPage.sortProducts("lohi");
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
    await expect(inventoryPage.getProductCard(products.backpack.name).getByRole("button")).toContainText("Remove");
  });
});

test.describe("Dia 005 - Catalogo e Menu | Sauce Demo | Detalhe do Produto", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("deve exibir detalhes corretos ao clicar em um produto e voltar ao catalogo", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await inventoryPage.clickProductByName(products.backpack.name);
    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(productDetailPage.productName).toContainText(products.backpack.name);
    await expect(productDetailPage.productDescription).toContainText(products.backpack.description);
    await expect(productDetailPage.productPrice).toContainText(products.backpack.price);

    await productDetailPage.clickBackToProducts();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator(".inventory_list")).toBeVisible();
  });

  test("deve adicionar e remover item pela pagina de detalhe do produto", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await inventoryPage.clickProductByName(products.backpack.name);
    await expect(page).toHaveURL(/inventory-item\.html/);

    await productDetailPage.addToCart();
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
    await expect(productDetailPage.actionButton).toContainText("Remove");

    await productDetailPage.removeFromCart();
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(0);
    await expect(productDetailPage.actionButton).toContainText("Add to cart");
  });
});

test.describe("Dia 005 - Catalogo e Menu | Sauce Demo | Footer", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("deve conter links de redes sociais com href correto", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const expectedLinks = [
      { label: "Twitter", href: "https://twitter.com/saucelabs" },
      { label: "Facebook", href: "https://www.facebook.com/saucelabs" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/sauce-labs/" },
    ];

    await expect(inventoryPage.footerLinks()).toHaveCount(expectedLinks.length);

    for (const expected of expectedLinks) {
      const link = page.locator(".footer a").filter({ hasText: expected.label });
      await expect(link).toHaveAttribute("href", expected.href);
      await expect(link).toHaveAttribute("target", "_blank");
    }
  });
});
