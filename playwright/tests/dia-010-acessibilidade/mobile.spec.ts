import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { SidebarPage } from "../../pages/SidebarPage";
import { analisarAcessibilidade, resumirViolacoes, VIOLACOES_CONHECIDAS } from "../../support/a11y";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

// Este arquivo roda no projeto "mobile" (iPhone 13), definido no
// playwright.config.ts — com toque e user agent de celular, não apenas
// uma janela estreita.

/** Mede se o conteúdo transborda a largura da tela. */
const medirTransbordo = (page: import("@playwright/test").Page) =>
  page.evaluate(() => ({
    conteudo: document.documentElement.scrollWidth,
    tela: document.documentElement.clientWidth,
  }));

test.describe("Dia 010 - Responsividade | Sauce Demo | Mobile", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.standard.username);
  });

  test("o catalogo nao deve exigir rolagem horizontal", async ({ page }) => {
    const { conteudo, tela } = await medirTransbordo(page);
    expect(conteudo, "largura do conteudo nao deve exceder a da tela").toBeLessThanOrEqual(tela);
  });

  test("os produtos devem empilhar em uma unica coluna", async ({ page }) => {
    const colunas = await page.evaluate(() => {
      const xs = [...document.querySelectorAll("[data-test='inventory-item']")].map((c) =>
        Math.round(c.getBoundingClientRect().x),
      );
      return [...new Set(xs)];
    });

    expect(colunas).toHaveLength(1);
  });

  test("o cabecalho deve manter carrinho e menu acessiveis", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await expect(inventoryPage.cartLink).toBeVisible();
    await expect(page.locator("#react-burger-menu-btn")).toBeVisible();
  });

  test("o menu lateral deve abrir e fechar em tela pequena", async ({ page }) => {
    const sidebarPage = new SidebarPage(page);

    await sidebarPage.openMenu();
    await expect(sidebarPage.allItemsLink).toBeVisible();
    await expect(sidebarPage.logoutLink).toBeVisible();

    await sidebarPage.closeMenu();
  });

  test("deve completar uma compra inteira em viewport de celular", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addProductByName(products.backpack.name);
    await expect.poll(() => inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.openCart();
    await expect(cartPage.getItemByName(products.backpack.name)).toBeVisible();

    await cartPage.clickCheckout();
    await checkoutPage.fillCustomerInfo("Flavio", "Freitas", "12345");
    await checkoutPage.clickContinue();
    await page.waitForURL(/checkout-step-two\.html/, { timeout: 15000 });

    await checkoutPage.clickFinish();
    await expect(checkoutPage.confirmationMessage).toContainText("Thank you for your order!");
  });

  test("o catalogo em mobile nao deve ter violacoes alem da ja mapeada", async ({ page }) => {
    // Acessibilidade também é validada no layout de celular: o axe avalia o
    // DOM renderizado, que muda com o breakpoint.
    const violations = await analisarAcessibilidade(page, [VIOLACOES_CONHECIDAS.selectSemNome]);
    expect(violations, resumirViolacoes(violations)).toEqual([]);
  });
});

test.describe("Dia 010 - Responsividade | Sauce Demo | Sem rolagem horizontal", () => {
  const paginas = [
    { nome: "carrinho", rota: "/cart.html" },
    { nome: "checkout etapa 1", rota: "/checkout-step-one.html" },
  ];

  for (const { nome, rota } of paginas) {
    test(`a pagina de ${nome} nao deve exigir rolagem horizontal`, async ({ page, loginAs }) => {
      await loginAs(users.standard.username);
      await page.goto(rota, { waitUntil: "domcontentloaded" });

      const { conteudo, tela } = await medirTransbordo(page);
      expect(conteudo).toBeLessThanOrEqual(tela);
    });
  }
});
