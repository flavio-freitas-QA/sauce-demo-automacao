import InventoryPage from "../../support/pages/InventoryPage";
import ProductDetailPage from "../../support/pages/ProductDetailPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

describe("Dia 005 - Catálogo e Menu | Sauce Demo | Ordenação", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
  });

  it("deve ordenar produtos por nome A-Z", () => {
    InventoryPage.sortProducts("az");
    InventoryPage.getAllProductNames().then((names) => {
      const sorted = Cypress._.sortBy(names);
      expect(names).to.deep.equal(sorted);
    });
  });

  it("deve ordenar produtos por nome Z-A", () => {
    InventoryPage.sortProducts("za");
    InventoryPage.getAllProductNames().then((names) => {
      const sorted = Cypress._.sortBy(names).reverse();
      expect(names).to.deep.equal(sorted);
    });
  });

  it("deve ordenar produtos por preço menor-maior", () => {
    InventoryPage.sortProducts("lohi");
    InventoryPage.getAllProductPrices().then((prices) => {
      const sorted = Cypress._.sortBy(prices);
      expect(prices).to.deep.equal(sorted);
    });
  });

  it("deve ordenar produtos por preço maior-menor", () => {
    InventoryPage.sortProducts("hilo");
    InventoryPage.getAllProductPrices().then((prices) => {
      const sorted = Cypress._.sortBy(prices).reverse();
      expect(prices).to.deep.equal(sorted);
    });
  });

  it("deve manter a consistência dos produtos ao alternar entre ordenações", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);

    InventoryPage.sortProducts("za");
    InventoryPage.getCartBadgeCount().should("eq", 1);
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Remove");

    InventoryPage.sortProducts("lohi");
    InventoryPage.getCartBadgeCount().should("eq", 1);
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Remove");
  });
});

describe("Dia 005 - Catálogo e Menu | Sauce Demo | Detalhe do Produto", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
  });

  it("deve exibir detalhes corretos ao clicar em um produto e voltar ao catálogo", () => {
    const product = products.backpack;

    InventoryPage.clickProductByName(product.name);
    cy.url().should("include", "/inventory-item.html");

    ProductDetailPage
      .validateProductName(product.name)
      .validateProductDescription(product.description)
      .validateProductPrice(product.price);

    ProductDetailPage.clickBackToProducts();
    cy.url().should("include", "/inventory.html");
    cy.get("[data-test='inventory-list']").should("be.visible");
  });

  it("deve adicionar e remover item pela página de detalhe do produto", () => {
    const product = products.backpack;

    InventoryPage.clickProductByName(product.name);
    cy.url().should("include", "/inventory-item.html");

    ProductDetailPage.addToCart();
    InventoryPage.getCartBadgeCount().should("eq", 1);
    ProductDetailPage.getActionButton().should("contain.text", "Remove");

    ProductDetailPage.removeFromCart();
    InventoryPage.getCartBadgeCount().should("eq", 0);
    ProductDetailPage.getActionButton().should("contain.text", "Add to cart");
  });
});

describe("Dia 005 - Catálogo e Menu | Sauce Demo | Footer", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
  });

  it("deve conter links de redes sociais com href correto", () => {
    const expectedLinks = [
      { label: "Twitter", href: "https://twitter.com/saucelabs" },
      { label: "Facebook", href: "https://www.facebook.com/saucelabs" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/sauce-labs/" },
    ];

    InventoryPage.getFooterLinks().should("have.length", expectedLinks.length);

    expectedLinks.forEach((expected) => {
      cy.contains("[data-test='footer'] a", expected.label)
        .should("have.attr", "href", expected.href)
        .and("have.attr", "target", "_blank");
    });
  });
});
