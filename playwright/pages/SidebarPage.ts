import { Page, Locator, expect } from "@playwright/test";

// O wrapper .bm-menu-wrap vem da lib react-burger-menu e não possui data-test.
export class SidebarPage {
  readonly page: Page;
  readonly menuWrap: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuWrap = page.locator(".bm-menu-wrap");
    this.allItemsLink = page.locator("[data-test='inventory-sidebar-link']");
    this.aboutLink = page.locator("[data-test='about-sidebar-link']");
    this.logoutLink = page.locator("[data-test='logout-sidebar-link']");
    this.resetAppStateLink = page.locator("[data-test='reset-sidebar-link']");
  }

  async openMenu() {
    // Os data-test open-menu/close-menu ficam no <img> do ícone, mas quem
    // recebe o clique é o <button> da lib react-burger-menu — por isso o id.
    await this.page.locator("#react-burger-menu-btn").click();
    await expect(this.menuWrap).toBeVisible({ timeout: 5000 });
  }

  async closeMenu() {
    await this.page.locator("#react-burger-cross-btn").click();
    await expect(this.menuWrap).not.toBeVisible({ timeout: 5000 });
  }

  async clickAllItems() {
    await this.allItemsLink.click();
  }

  async clickAbout() {
    await this.aboutLink.click();
  }

  async clickResetAppState() {
    await this.resetAppStateLink.click();
  }

  async clickLogout() {
    await this.logoutLink.click();
  }
}
