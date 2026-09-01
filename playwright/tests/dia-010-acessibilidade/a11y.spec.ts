import { test, expect } from "../../support/fixtures";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { analisarAcessibilidade, resumirViolacoes, VIOLACOES_CONHECIDAS } from "../../support/a11y";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

// Varredura WCAG 2.1 A/AA com axe-core.
// As páginas abaixo estão limpas hoje, então a exigência é de ZERO violações:
// qualquer regressão de acessibilidade quebra o teste.
test.describe("Dia 010 - Acessibilidade | Sauce Demo | Paginas sem violacoes", () => {
  test("a tela de login nao deve ter violacoes", { tag: "@smoke" }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await expect(loginPage.loginButton).toBeVisible();

    const violations = await analisarAcessibilidade(page);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });

  test("o detalhe do produto nao deve ter violacoes", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);

    await loginAs(users.standard.username);
    await inventoryPage.clickProductByName(products.backpack.name);
    await expect(page).toHaveURL(/inventory-item\.html/);

    const violations = await analisarAcessibilidade(page);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });

  test("o carrinho nao deve ter violacoes", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);

    await loginAs(users.standard.username);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();

    const violations = await analisarAcessibilidade(page);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });

  test("o formulario de checkout (etapa 1) nao deve ter violacoes", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginAs(users.standard.username);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickCheckout();

    const violations = await analisarAcessibilidade(page);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });

  test("o resumo do pedido (etapa 2) nao deve ter violacoes", async ({ page, loginAs }) => {
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

    const violations = await analisarAcessibilidade(page);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });

  test("a confirmacao do pedido nao deve ter violacoes", async ({ page, loginAs }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginAs(users.standard.username);
    await inventoryPage.addProductByName(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await page.waitForURL(/checkout-complete\.html/, { timeout: 15000 });

    const violations = await analisarAcessibilidade(page);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });
});

test.describe("Dia 010 - Acessibilidade | Sauce Demo | Catalogo", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.standard.username);
  });

  test("nao deve ter violacoes alem da ja mapeada no dropdown de ordenacao", async ({ page }) => {
    // Ignorar a regra conhecida mantém o teste sensível a violações NOVAS.
    const violations = await analisarAcessibilidade(page, [VIOLACOES_CONHECIDAS.selectSemNome]);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });

  test("[VIOLACAO CONHECIDA] o dropdown de ordenacao nao tem nome acessivel", async ({ page }) => {
    test.info().annotations.push({
      type: "a11y-violation",
      description: "select-name: um leitor de tela anuncia o controle sem dizer o que ele faz",
    });

    const violations = await analisarAcessibilidade(page);
    const regras = violations.map((v) => v.id);
    expect(regras).toContain(VIOLACOES_CONHECIDAS.selectSemNome);

    // Confirma a causa: o select não tem aria-label nem label associado.
    const sortDropdown = page.locator("[data-test='product-sort-container']");
    await expect(sortDropdown).not.toHaveAttribute("aria-label", /.*/);
    await expect(sortDropdown).not.toHaveAttribute("aria-labelledby", /.*/);
  });
});

test.describe("Dia 010 - Acessibilidade | Sauce Demo | Mensagem de erro", () => {
  test("[VIOLACAO CONHECIDA] o botao de fechar o erro nao tem texto discernivel", async ({ page }) => {
    test.info().annotations.push({
      type: "a11y-violation",
      description: "button-name: o X que fecha o erro do login nao tem rotulo acessivel",
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();

    const violations = await analisarAcessibilidade(page);
    const regras = violations.map((v) => v.id);
    expect(regras).toContain(VIOLACOES_CONHECIDAS.botaoSemNome);

    // Confirma a causa: o botão X não tem texto nem rótulo acessível.
    await expect(loginPage.errorCloseButton).toHaveText("");
    await expect(loginPage.errorCloseButton).not.toHaveAttribute("aria-label", /.*/);
  });
});
