import InventoryPage from "../../support/pages/InventoryPage";
import CartPage from "../../support/pages/CartPage";
import ProductDetailPage from "../../support/pages/ProductDetailPage";
import users from "../../fixtures/users.json";
import products from "../../fixtures/products.json";

describe("Dia 008 - Catálogo e Carrinho | Sauce Demo", () => {
  beforeEach(() => {
    cy.login(users.standard.username);
  });

  it("deve exibir os 6 produtos com nome, descrição e preço conforme a massa de dados", { tags: "@smoke" }, () => {
    const allProducts = Object.values(products);

    cy.get("[data-test='inventory-item']").should("have.length", allProducts.length);

    allProducts.forEach((product) => {
      InventoryPage.getProductCard(product.name).within(() => {
        cy.get("[data-test='inventory-item-name']").should("have.text", product.name);
        cy.get("[data-test='inventory-item-desc']").should("contain.text", product.description);
        cy.get("[data-test='inventory-item-price']").should("have.text", product.price);
      });
    });
  });

  it("não deve exibir o badge do carrinho quando não há itens", () => {
    cy.get("[data-test='shopping-cart-badge']").should("not.exist");
    cy.get("[data-test='shopping-cart-link']").should("be.visible");
  });

  it("deve exibir 'ITEM NOT FOUND' ao acessar detalhe de produto inexistente", () => {
    cy.visit("/inventory-item.html?id=999", { failOnStatusCode: false });

    ProductDetailPage.getProductName().should("have.text", "ITEM NOT FOUND");
    ProductDetailPage.getProductDescription().should(
      "contain.text",
      "We're sorry, but your call could not be completed as dialled."
    );
    // Easter egg do app: produto inexistente custa raiz de -1
    ProductDetailPage.getProductPrice().should("contain.text", "√-1");

    // Mesmo no estado de erro, o usuário consegue voltar ao catálogo
    ProductDetailPage.clickBackToProducts();
    cy.url().should("include", "/inventory.html");
  });

  it("deve navegar para o detalhe ao clicar no nome do produto dentro do carrinho", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.openCart();
    CartPage.clickItemName(product.name);

    cy.url().should("include", "/inventory-item.html");
    ProductDetailPage.getProductName().should("have.text", product.name);
  });

  it("deve exibir quantidade 1 para item adicionado ao carrinho", () => {
    const product = products.backpack;

    InventoryPage.addProductByName(product.name);
    InventoryPage.openCart();

    CartPage.getItemQuantity(product.name).should("have.text", "1");
  });
});
