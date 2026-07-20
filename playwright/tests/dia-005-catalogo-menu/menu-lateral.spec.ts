import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { SidebarPage } from "../../pages/SidebarPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

test.describe("Dia 005 - Catalogo e Menu | Sauce Demo | Menu Lateral", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("'All Items' deve resetar a listagem mesmo apos navegar para detalhe do produto", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const sidebarPage = new SidebarPage(page);

    await inventoryPage.clickProductByName(products.backpack.name);
    await expect(page).toHaveURL(/inventory-item\.html/);

    await sidebarPage.openMenu();
    await sidebarPage.clickAllItems();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator(".inventory_list")).toBeVisible();
    await expect(page.locator(".inventory_item").first()).toBeVisible();
  });

  test("'Reset App State' deve zerar o carrinho mesmo com itens adicionados", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const sidebarPage = new SidebarPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

    await sidebarPage.openMenu();
    await sidebarPage.clickResetAppState();
    await sidebarPage.closeMenu();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".inventory_list")).toBeVisible({ timeout: 10000 });

    await expect(page.locator(".shopping_cart_badge")).toHaveCount(0);
    await expect(inventoryPage.getProductCard(products.backpack.name).getByRole("button")).toContainText("Add to cart");
  });

  test("deve abrir e fechar o menu lateral corretamente", async ({ page }) => {
    const sidebarPage = new SidebarPage(page);

    await sidebarPage.openMenu();
    await expect(sidebarPage.allItemsLink).toBeVisible();
    await expect(sidebarPage.aboutLink).toBeVisible();
    await expect(sidebarPage.logoutLink).toBeVisible();
    await expect(sidebarPage.resetAppStateLink).toBeVisible();

    await sidebarPage.closeMenu();
  });

  test("'Logout' deve funcionar corretamente mesmo com carrinho cheio", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const sidebarPage = new SidebarPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

    await sidebarPage.openMenu();
    await sidebarPage.clickLogout();
    await expect(page).toHaveURL("https://www.saucedemo.com/");
    await expect(page.locator("[data-test='login-button']")).toBeVisible();
  });

  test("'About' deve redirecionar para a URL externa esperada (saucelabs.com)", async ({ page }) => {
    const sidebarPage = new SidebarPage(page);

    await sidebarPage.openMenu();
    await sidebarPage.clickAbout();
    await expect(page).toHaveURL(/saucelabs\.com/);
  });
});
