import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

test.describe("Dia 008 - Catalogo e Carrinho | Sauce Demo", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.standard.username);
  });

  test("deve exibir os 6 produtos com nome, descricao e preco conforme a massa de dados", { tag: "@smoke" }, async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const allProducts = Object.values(products);

    await expect(page.locator("[data-test='inventory-item']")).toHaveCount(allProducts.length);

    for (const product of allProducts) {
      const card = inventoryPage.getProductCard(product.name);
      await expect(card.locator("[data-test='inventory-item-name']")).toHaveText(product.name);
      await expect(card.locator("[data-test='inventory-item-desc']")).toContainText(product.description);
      await expect(card.locator("[data-test='inventory-item-price']")).toHaveText(product.price);
    }
  });

  test("nao deve exibir o badge do carrinho quando nao ha itens", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await expect(inventoryPage.cartLink).toBeVisible();
  });

  test("deve exibir 'ITEM NOT FOUND' ao acessar detalhe de produto inexistente", async ({ page }) => {
    const productDetailPage = new ProductDetailPage(page);

    await page.goto("/inventory-item.html?id=999", { waitUntil: "domcontentloaded" });

    await expect(productDetailPage.productName).toHaveText("ITEM NOT FOUND");
    await expect(productDetailPage.productDescription).toContainText(
      "We're sorry, but your call could not be completed as dialled."
    );
    // Easter egg do app: produto inexistente custa raiz de -1
    await expect(productDetailPage.productPrice).toContainText("√-1");

    // Mesmo no estado de erro, o usuário consegue voltar ao catálogo
    await productDetailPage.clickBackToProducts();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test("deve navegar para o detalhe ao clicar no nome do produto dentro do carrinho", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickItemName(products.backpack.name);

    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(productDetailPage.productName).toHaveText(products.backpack.name);
  });

  test("deve exibir quantidade 1 para item adicionado ao carrinho", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();

    await expect(cartPage.getItemQuantity(products.backpack.name)).toHaveText("1");
  });
});
