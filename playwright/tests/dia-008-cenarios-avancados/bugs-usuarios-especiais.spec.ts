import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

const annotateKnownBug = (description: string) =>
  test.info().annotations.push({ type: "known-bug", description });

// Complemento do dia 006: bugs conhecidos adicionais dos usuários especiais,
// todos confirmados manualmente contra o site antes de virarem teste.
test.describe("Dia 008 - Bugs Conhecidos Extras | Sauce Demo | problem_user", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.problem.username);
  });

  test("[BUG CONHECIDO] deve exibir a mesma imagem quebrada (sl-404) em todos os produtos", async ({ page }) => {
    annotateKnownBug("problem_user vê a imagem sl-404 (cachorro) em todos os produtos");
    const inventoryPage = new InventoryPage(page);

    const images = inventoryPage.productImages();
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute("src", /sl-404/);
    }
  });

  test("[BUG CONHECIDO] a ordenacao Z-A nao reordena os produtos (falha silenciosa)", async ({ page }) => {
    annotateKnownBug("problem_user: ordenar não tem efeito, a lista permanece na ordem original");
    const inventoryPage = new InventoryPage(page);

    const namesBefore = await inventoryPage.getAllProductNames();
    await inventoryPage.sortProducts("za");
    const namesAfter = await inventoryPage.getAllProductNames();

    expect(namesAfter).toEqual(namesBefore);
  });
});

test.describe("Dia 008 - Bugs Conhecidos Extras | Sauce Demo | error_user", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.errorUser.username);
  });

  test("[BUG CONHECIDO] a ordenacao dispara alerta 'Sorting is broken!'", async ({ page }) => {
    annotateKnownBug("error_user: ordenar exibe alert 'Sorting is broken!'");
    const inventoryPage = new InventoryPage(page);

    const dialogMessages: string[] = [];
    page.once("dialog", async (dialog) => {
      dialogMessages.push(dialog.message());
      await dialog.dismiss();
    });

    await inventoryPage.sortProducts("za");

    await expect
      .poll(() => dialogMessages.join(" "))
      .toContain("Sorting is broken!");
  });

  test("[BUG CONHECIDO] o campo Last Name do checkout nao aceita digitacao", async ({ page }) => {
    annotateKnownBug("error_user: o valor digitado em Last Name é descartado pelo app");
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickCheckout();

    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");

    await expect(checkoutPage.firstNameInput).toHaveValue("Flavio");
    await expect(checkoutPage.lastNameInput).toHaveValue("");
  });
});
