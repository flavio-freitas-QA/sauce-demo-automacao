const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.saucedemo.com');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForLoadState('networkidle');
  console.log('after login url:', page.url());
  console.log('body text snippet:', (await page.locator('body').textContent()).slice(0, 2000));
  await page.locator('.inventory_item').first().locator('button').click();
  await page.waitForTimeout(2000);
  console.log('after add url:', page.url());
  console.log('body text snippet 2:', (await page.locator('body').textContent()).slice(0, 2500));
  await browser.close();
})();
