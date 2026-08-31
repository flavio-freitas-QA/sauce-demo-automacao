import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import { SidebarPage } from "../../pages/SidebarPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

test.describe("Dia 005 - Catalogo e Menu | Sauce Demo | Menu Lateral", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.standard.username);
  });

  test("'All Items' deve resetar a listagem mesmo apos navegar para detalhe do produto", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const sidebarPage = new SidebarPage(page);

    await inventoryPage.clickProductByName(products.backpack.name);
    await expect(page).toHaveURL(/inventory-item\.html/);

    await sidebarPage.openMenu();
    await sidebarPage.clickAllItems();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.list).toBeVisible();
    await expect(page.locator("[data-test='inventory-item']").first()).toBeVisible();
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
    await expect(inventoryPage.list).toBeVisible({ timeout: 10000 });

    await expect(inventoryPage.cartBadge).toHaveCount(0);
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
