import { test, expect } from "../../support/fixtures";
import { InventoryPage } from "../../pages/InventoryPage";
import users from "../../fixtures/users.json";

// Regressão visual sem baseline de imagem: asserções sobre a geometria real
// dos elementos. Rodam em qualquer plataforma (não dependem de renderização
// de fonte) e apontam a causa do defeito, não só "a imagem mudou".
const annotateKnownBug = (description: string) =>
  test.info().annotations.push({ type: "known-bug", description });

// Distância entre a borda direita do carrinho e a borda direita do header.
const medirAncoragemDoCarrinho = async (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const header = document.querySelector("[data-test='primary-header']")!.getBoundingClientRect();
    const cart = document.querySelector("[data-test='shopping-cart-link']")!.getBoundingClientRect();
    return {
      gapDireita: Math.round(header.right - cart.right),
      transbordaHeader: cart.bottom > header.bottom,
    };
  });

// Coluna (posição x) de cada botão de ação do catálogo.
const medirColunasDosBotoes = async (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const xs = [...document.querySelectorAll(".btn_inventory")].map((b) =>
      Math.round(b.getBoundingClientRect().x),
    );
    return [...new Set(xs)].sort((a, b) => a - b);
  });

test.describe("Dia 009 - Regressao Visual | Layout | standard_user (referencia)", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.standard.username);
  });

  test("o carrinho deve estar ancorado a direita e contido no cabecalho", async ({ page }) => {
    const { gapDireita, transbordaHeader } = await medirAncoragemDoCarrinho(page);

    expect(gapDireita).toBeLessThan(60);
    expect(transbordaHeader).toBe(false);
  });

  test("os botoes do catalogo devem formar exatamente duas colunas", async ({ page }) => {
    const colunas = await medirColunasDosBotoes(page);

    expect(colunas).toHaveLength(2);
  });

  test("nenhuma imagem do catalogo deve ser a imagem de erro", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const images = inventoryPage.productImages();

    const total = await images.count();
    expect(total).toBeGreaterThan(0);

    for (let i = 0; i < total; i++) {
      await expect(images.nth(i)).not.toHaveAttribute("src", /sl-404/);
    }
  });
});

test.describe("Dia 009 - Regressao Visual | Layout | visual_user (bugs propositais)", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs(users.visualUser.username);
  });

  test("[BUG CONHECIDO] o carrinho sai do cabecalho e perde a ancoragem a direita", async ({ page }) => {
    annotateKnownBug("visual_user: o icone do carrinho desce e desloca para a esquerda, saindo do header");

    const { gapDireita, transbordaHeader } = await medirAncoragemDoCarrinho(page);

    // Referência do standard_user: gap 20px e totalmente dentro do header.
    expect(gapDireita).toBeGreaterThan(60);
    expect(transbordaHeader).toBe(true);
  });

  test("[BUG CONHECIDO] um botao do catalogo cria uma terceira coluna", async ({ page }) => {
    annotateKnownBug("visual_user: o botao do ultimo produto desalinha da coluna da direita");

    const colunas = await medirColunasDosBotoes(page);

    // O layout correto tem 2 colunas; o bug introduz uma terceira.
    expect(colunas.length).toBeGreaterThan(2);
  });

  test("[BUG CONHECIDO] exatamente um produto exibe a imagem de erro", async ({ page }) => {
    annotateKnownBug("visual_user: apenas a primeira imagem do catalogo vira sl-404");

    const inventoryPage = new InventoryPage(page);
    const images = inventoryPage.productImages();
    const total = await images.count();

    const sources = await Promise.all(
      Array.from({ length: total }, (_, i) => images.nth(i).getAttribute("src")),
    );
    const quebradas = sources.filter((src) => src?.includes("sl-404"));

    // Contraste com o problem_user, que quebra todas as imagens (dia 008).
    expect(quebradas).toHaveLength(1);
    expect(total).toBeGreaterThan(1);
  });
});
