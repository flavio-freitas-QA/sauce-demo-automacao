import InventoryPage from "../../support/pages/InventoryPage";
import users from "../../fixtures/users.json";

// O Cypress não tem comparação de imagem nativa (o Playwright tem, ver
// playwright/tests/dia-009-regressao-visual). A contrapartida aqui é a
// verificação geométrica: mede a posição real dos elementos e falha
// apontando a causa do defeito, não apenas "a imagem mudou".

describe("Dia 009 - Regressão Visual | Layout | standard_user (referência)", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
  });

  it("o carrinho deve estar ancorado à direita e contido no cabeçalho", () => {
    cy.getCartAnchoring().then(({ gapDireita, transbordaHeader }) => {
      expect(gapDireita, "distância até a borda direita do header").to.be.lessThan(60);
      expect(transbordaHeader, "carrinho ultrapassa o header").to.be.false;
    });
  });

  it("os botões do catálogo devem formar exatamente duas colunas", () => {
    cy.getButtonColumns().should("have.length", 2);
  });

  it("nenhuma imagem do catálogo deve ser a imagem de erro", () => {
    InventoryPage.getProductImages()
      .should("have.length.at.least", 1)
      .each(($img) => {
        expect($img.attr("src")).to.not.contain("sl-404");
      });
  });
});

describe("Dia 009 - Regressão Visual | Layout | visual_user (bugs propositais)", () => {
  beforeEach(() => {
    cy.login(users.visualUser.username);
  });

  it("[BUG CONHECIDO] o carrinho sai do cabeçalho e perde a ancoragem à direita", () => {
    cy.getCartAnchoring().then(({ gapDireita, transbordaHeader }) => {
      // Referência do standard_user: gap de 20px e totalmente dentro do header.
      expect(gapDireita, "distância até a borda direita do header").to.be.greaterThan(60);
      expect(transbordaHeader, "carrinho ultrapassa o header").to.be.true;
    });
  });

  it("[BUG CONHECIDO] um botão do catálogo cria uma terceira coluna", () => {
    // O layout correto tem 2 colunas; o bug introduz uma terceira.
    cy.getButtonColumns().should("have.length.greaterThan", 2);
  });

  it("[BUG CONHECIDO] exatamente um produto exibe a imagem de erro", () => {
    InventoryPage.getProductImages().then(($imgs) => {
      const quebradas = Cypress._.filter($imgs.toArray(), (img) =>
        (img.getAttribute("src") || "").includes("sl-404"),
      );

      // Contraste com o problem_user, que quebra todas as imagens (dia 008).
      expect(quebradas).to.have.length(1);
      expect($imgs.length).to.be.greaterThan(1);
    });
  });
});
