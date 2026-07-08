class SidebarPage {
  openMenu() {
    cy.get("#react-burger-menu-btn").click();
    cy.get(".bm-menu-wrap", { timeout: 5000 }).should("be.visible");
  }

  closeMenu() {
    cy.get("#react-burger-cross-btn").click();
    cy.get(".bm-menu-wrap", { timeout: 5000 }).should("not.be.visible");
  }

  clickAllItems() {
    cy.get("#inventory_sidebar_link").click();
  }

  clickAbout() {
    cy.get("#about_sidebar_link").click();
  }

  clickResetAppState() {
    cy.get("#reset_sidebar_link").click();
  }

  clickLogout() {
    cy.get("#logout_sidebar_link").click();
  }
}

export default new SidebarPage();
