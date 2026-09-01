// Page Object do menu lateral (burger menu) do Sauce Demo.
// O wrapper .bm-menu-wrap vem da lib react-burger-menu e não possui data-test.
class SidebarPage {
  // Os data-test open-menu/close-menu ficam no <img> do ícone, mas quem
  // recebe o clique é o <button> da lib react-burger-menu — por isso o id.
  // O timeout é folgado de propósito: o menu tem transição de slide e a
  // montagem pode atrasar quando o site público responde devagar.
  openMenu() {
    cy.get("#react-burger-menu-btn").should("be.visible").click();
    cy.get(".bm-menu-wrap", { timeout: 15000 }).should("be.visible");
  }

  closeMenu() {
    cy.get("#react-burger-cross-btn").should("be.visible").click();
    cy.get(".bm-menu-wrap", { timeout: 15000 }).should("not.be.visible");
  }

  getAllItemsLink() {
    return cy.get("[data-test='inventory-sidebar-link']");
  }

  getAboutLink() {
    return cy.get("[data-test='about-sidebar-link']");
  }

  getLogoutLink() {
    return cy.get("[data-test='logout-sidebar-link']");
  }

  getResetAppStateLink() {
    return cy.get("[data-test='reset-sidebar-link']");
  }

  clickAllItems() {
    this.getAllItemsLink().click();
  }

  clickAbout() {
    this.getAboutLink().click();
  }

  clickResetAppState() {
    this.getResetAppStateLink().click();
  }

  clickLogout() {
    this.getLogoutLink().click();
  }
}

export default new SidebarPage();
