import LoginPage from "../../support/pages/LoginPage";
import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";

let users: any;
let products: any;

describe("Dia 002 - Fluxo de Carrinho | Sauce Demo", () => {
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

  it("deve adicionar 1 produto e atualizar o contador do carrinho", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);
  });

  it("deve adicionar todos os produtos e exibir contador 6 no carrinho", () => {
    const selectedProducts = [
      products.backpack,
      products.bikeLight,
      products.boltTShirt,
      products.fleeceJacket,
      products.onesie,
      products.redShirt,
    ];

    selectedProducts.forEach((product) => {
      InventoryPage.addProductByName(product.name);
    });

    InventoryPage.getCartBadgeCount().should("eq", 6);
    cy.visit("/cart.html", { failOnStatusCode: false });
    selectedProducts.forEach((product) => {
      CartPage.getItemByName(product.name).should("be.visible");
    });
  });

  it("deve remover um produto diretamente da tela de inventário", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Remove");

    InventoryPage.removeProductByName(product.name);
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Add to cart");
    InventoryPage.getCartBadgeCount().should("eq", 0);
  });

  it("deve remover um produto dentro da tela do carrinho e atualizar o contador", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    cy.visit("/cart.html", { failOnStatusCode: false });
    CartPage.removeItemByName(product.name);

    CartPage.getItemByName(product.name).should("not.exist");
    InventoryPage.getCartBadgeCount().should("eq", 0);
  });

  it("deve manter a tela do carrinho vazia sem quebrar", function () {
    cy.visit("/cart.html", { failOnStatusCode: false });
    cy.get(".cart_item").should("not.exist");
    cy.contains("Your Cart").should("be.visible");
  });

  it("deve preservar o contador ao navegar entre inventário e carrinho", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    cy.visit("/cart.html", { failOnStatusCode: false });
    CartPage.clickContinueShopping();

    InventoryPage.getCartBadgeCount().should("eq", 1);
  });

  it("deve manter nome e preço consistentes entre inventário e carrinho", () => {
    const product = products.backpack;

    InventoryPage.getProductName(product.name).invoke("text").then((inventoryName) => {
      InventoryPage.getProductPrice(product.name).invoke("text").then((inventoryPrice) => {
        InventoryPage.addProductByName(product.name);
        cy.visit("/cart.html", { failOnStatusCode: false });

        CartPage.getItemName(product.name).invoke("text").then((cartName) => {
          expect(cartName.trim()).to.equal(inventoryName.trim());
        });

        CartPage.getItemPrice(product.name).invoke("text").then((cartPrice) => {
          expect(cartPrice.trim()).to.equal(inventoryPrice.trim());
        });
      });
    });
  });

  it("deve retornar à tela de produtos ao clicar em Continue Shopping", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    cy.visit("/cart.html", { failOnStatusCode: false });
    CartPage.clickContinueShopping();

    cy.url().should("include", "/inventory.html");
    cy.contains("Products").should("be.visible");
  });

  it("deve persistir o carrinho após recarregar a página (estado mantido via sessionStorage)", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);

    cy.reload();
    cy.get(".shopping_cart_badge", { timeout: 10000 }).should("have.text", "1");
    InventoryPage.getProductActionButton(product.name).should("contain.text", "Remove");
  });

  it("deve acessar o carrinho autenticado e exibir a página corretamente", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    cy.visit("/cart.html", { failOnStatusCode: false });

    cy.url().should("include", "/cart.html");
    cy.contains("Your Cart").should("be.visible");
    CartPage.getItemByName(product.name).should("be.visible");
  });
});

describe("Dia 002 - Fluxo de Carrinho | Sauce Demo | Acesso direto", () => {
  it("deve redirecionar ao acessar o carrinho sem login", () => {
    cy.visit("/cart.html", { failOnStatusCode: false });
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
    cy.contains("You can only access '/cart.html' when you are logged in.").should("be.visible");
  });
});

describe("Dia 002 - Fluxo de Carrinho | Sauce Demo | Usuário problem", () => {
  beforeEach(() => {
    cy.fixture("users").then((userData) => {
      users = userData;
      return cy.fixture("products");
    }).then((productData) => {
      products = productData;
    });
  });

  beforeEach(() => {
    LoginPage.login(users.problem.username, users.problem.password);
    cy.location("pathname", { timeout: 15000 }).should("include", "/inventory.html");
  });

  it("deve manter o fluxo funcional do carrinho com problem_user", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.getCartBadgeCount().should("eq", 1);
    cy.visit("/cart.html", { failOnStatusCode: false });
    CartPage.getItemByName(product.name).should("be.visible");
  });
});
