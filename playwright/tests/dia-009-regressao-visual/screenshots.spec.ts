import { test, expect } from "../../support/fixtures";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { SidebarPage } from "../../pages/SidebarPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

// Regressão visual por comparação de imagem (recurso nativo do Playwright).
// Os baselines ficam em playwright/visual-baselines, versionados por plataforma.
// Para regenerar após uma mudança intencional de layout: npm run pw:visual:update

// Garante que todas as imagens terminaram de carregar antes da captura —
// sem isso o baseline pode congelar um estado intermediário.
const waitForImages = async (page: import("@playwright/test").Page) => {
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
};

test.describe("Dia 009 - Regressao Visual | Sauce Demo | Paginas", () => {
  test("pagina de login", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await expect(loginPage.loginButton).toBeVisible();
    await waitForImages(page);

    await expect(page).toHaveScreenshot("login.png", { fullPage: true });
  });

  test("catalogo de produtos", async ({ page, loginAs }) => {
    await loginAs(users.standard.username);
    await waitForImages(page);

    await expect(page).toHaveScreenshot("inventario.png", { fullPage: true });
  });

  test("detalhe do produto", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);

    await loginAs(users.standard.username);
    await inventoryPage.clickProductByName(products.backpack.name);
    await expect(page).toHaveURL(/inventory-item\.html/);
    await waitForImages(page);

    await expect(page).toHaveScreenshot("detalhe-produto.png", { fullPage: true });
  });

  test("carrinho com item", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginAs(users.standard.username);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await expect(cartPage.getItemByName(products.backpack.name)).toBeVisible();

    await expect(page).toHaveScreenshot("carrinho.png", { fullPage: true });
  });

  test("resumo do pedido (checkout etapa 2)", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginAs(users.standard.username);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });
    await expect(checkoutPage.total).toBeVisible();

    await expect(page).toHaveScreenshot("checkout-resumo.png", { fullPage: true });
  });

  test("menu lateral aberto", async ({ page, loginAs }) => {
    const sidebarPage = new SidebarPage(page);

    await loginAs(users.standard.username);
    await sidebarPage.openMenu();
    // O menu usa transição de slide; esperar o último link ficar estável
    // evita capturar o meio da animação.
    await expect(sidebarPage.resetAppStateLink).toBeVisible();

    await expect(page).toHaveScreenshot("menu-lateral.png");
  });
});

test.describe("Dia 009 - Regressao Visual | Sauce Demo | Componentes", () => {
  test("card de produto isolado", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);

    await loginAs(users.standard.username);
    await waitForImages(page);

    // Snapshot de componente: falha aponta direto para o card, sem o ruído
    // de uma diferença em qualquer outro ponto da página.
    await expect(inventoryPage.getProductCard(products.backpack.name)).toHaveScreenshot(
      "card-produto.png",
    );
  });

  test("mensagem de erro do login", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();

    await expect(page.locator("[data-test='login-container'] .error-message-container")).toHaveScreenshot(
      "erro-login.png",
    );
  });
});
