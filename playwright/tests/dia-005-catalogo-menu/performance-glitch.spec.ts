import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

test.describe("Dia 005 - Catalogo e Menu | Sauce Demo | Performance Glitch", () => {
  test("deve fazer login com performance_glitch_user e o fluxo de adicionar ao carrinho deve funcionar", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 30000 });
    await expect(page.locator(".inventory_list")).toBeVisible({ timeout: 20000 });
    await expect(page.locator(".title")).toContainText("Products");

    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);
    await expect(inventoryPage.getProductCard(products.backpack.name).getByRole("button")).toContainText("Remove");
  });

  test("deve medir o tempo aproximado de carregamento da pagina de inventario", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const startedAt = Date.now();

    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 30000 });
    await expect(page.locator(".inventory_list")).toBeVisible({ timeout: 20000 });

    const elapsed = Date.now() - startedAt;
    test.info().annotations.push({ type: "load-time-ms", description: String(elapsed) });
    expect(elapsed).toBeGreaterThan(0);
  });

  test("deve validar que o botao de adicionar/remover funciona mesmo com delay", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const selectedProducts = [products.backpack, products.bikeLight, products.boltTShirt];

    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 30000 });

    for (const product of selectedProducts) {
      await inventoryPage.addProductByName(product.name);
    }

    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(selectedProducts.length);
  });
});
