import { Page, Locator, expect } from "@playwright/test";

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
    this.allItemsLink = page.locator("#inventory_sidebar_link");
    this.aboutLink = page.locator("#about_sidebar_link");
    this.logoutLink = page.locator("#logout_sidebar_link");
    this.resetAppStateLink = page.locator("#reset_sidebar_link");
  }

  async openMenu() {
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
