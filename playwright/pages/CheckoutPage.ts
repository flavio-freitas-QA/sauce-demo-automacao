import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly backHomeButton: Locator;
  readonly confirmationMessage: Locator;
  readonly errorMessage: Locator;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator("[data-test='firstName']");
    this.lastNameInput = page.locator("[data-test='lastName']");
    this.postalCodeInput = page.locator("[data-test='postalCode']");
    this.continueButton = page.locator("[data-test='continue']");
    this.cancelButton = page.locator("[data-test='cancel']");
    this.finishButton = page.locator("[data-test='finish']");
    this.backHomeButton = page.locator("[data-test='back-to-products']");
    this.confirmationMessage = page.locator("h2").filter({ hasText: "Thank you for your order!" });
    this.errorMessage = page.locator("[data-test='error']");
    this.itemTotal = page.locator(".summary_subtotal_label");
    this.tax = page.locator(".summary_tax_label");
    this.total = page.locator(".summary_total_label");
  }

  async fillCustomerInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.waitFor({ state: "visible" });
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.postalCodeInput.clear();

    if (firstName) await this.firstNameInput.fill(firstName);
    if (lastName) await this.lastNameInput.fill(lastName);
    if (postalCode) await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.waitFor({ state: "visible" });
    await this.continueButton.click();
  }

  async clickCancel() {
    await this.cancelButton.waitFor({ state: "visible" });
    await this.cancelButton.click();
  }

  async clickFinish() {
    await this.finishButton.waitFor({ state: "visible" });
    await this.finishButton.click();
  }

  async clickBackHome() {
    await this.backHomeButton.waitFor({ state: "visible" });
    await this.backHomeButton.click();
  }

  async expectValidationError(text: string) {
    await expect(this.errorMessage).toContainText(text);
  }
}
