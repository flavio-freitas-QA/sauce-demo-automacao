import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["list"],
  ],
  use: {
    baseURL: "https://www.saucedemo.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Baselines visuais versionados por plataforma: a renderização de fontes
  // difere entre Windows e Linux, então o nome do arquivo carrega o SO.
  snapshotPathTemplate: "playwright/visual-baselines/{testFileName}/{arg}-{platform}{ext}",
  expect: {
    toHaveScreenshot: {
      // Tolera ruído de antialiasing sem deixar passar regressão real.
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "**/dia-009-regressao-visual/**",
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: "**/dia-009-regressao-visual/**",
    },
    {
      // Projeto dedicado à regressão visual: viewport travado para que o
      // baseline não dependa do tamanho da janela de quem executa.
      name: "visual",
      testMatch: "**/dia-009-regressao-visual/**",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
  ],
});
