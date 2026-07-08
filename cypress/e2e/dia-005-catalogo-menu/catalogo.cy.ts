import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";
import ProductDetailPage from "../../support/pages/ProductDetailPage";

let users: any;
let products: any;

describe("Dia 005 - Catálogo e Menu | Sauce Demo | Ordenação", () => {
  beforeEach(() => {
    cy.fixture("users").then((userData) => {
      users = userData;
      return cy.fixture("products");
    }).then((productData) => {
      products = productData;
    });
  });

  beforeEach(() => {
    LoginPage.login(users.standard.username, users.standard.password);
    cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
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
    cy.fixture("users").then((userData) => {
      users = userData;
      return cy.fixture("products");
    }).then((productData) => {
      products = productData;
    });
  });

  beforeEach(() => {
    LoginPage.login(users.standard.username, users.standard.password);
    cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
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
    cy.get(".inventory_list").should("be.visible");
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
    cy.fixture("users").then((userData) => {
      users = userData;
      return cy.fixture("products");
    }).then((productData) => {
      products = productData;
    });
  });

  beforeEach(() => {
    LoginPage.login(users.standard.username, users.standard.password);
    cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
  });

  it("deve conter links de redes sociais com href correto", () => {
    const expectedLinks = [
      { label: "Twitter", href: "https://twitter.com/saucelabs" },
      { label: "Facebook", href: "https://www.facebook.com/saucelabs" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/sauce-labs/" },
    ];

    cy.get(".footer a").should("have.length", expectedLinks.length);

    expectedLinks.forEach((expected) => {
      cy.contains(".footer a", expected.label)
        .should("have.attr", "href", expected.href)
        .and("have.attr", "target", "_blank");
    });
  });
});