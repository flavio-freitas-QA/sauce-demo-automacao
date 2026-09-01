import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // O alvo é um site público de demonstração. Com o padrão (metade dos núcleos)
  // a suíte satura o servidor e os testes começam a estourar em page.goto —
  // falha de infraestrutura, não de produto. Limitar os workers estabiliza.
  workers: process.env.CI ? 2 : 4,
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
    // O padrão de 5s é apertado contra um site remoto — a captura de tela,
    // por exemplo, espera as fontes carregarem dentro desse orçamento.
    timeout: 10000,
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
      testIgnore: ["**/dia-009-regressao-visual/**", "**/dia-010-acessibilidade/mobile.spec.ts"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: ["**/dia-009-regressao-visual/**", "**/dia-010-acessibilidade/mobile.spec.ts"],
    },
    {
      // Projeto dedicado à regressão visual: viewport travado para que o
      // baseline não dependa do tamanho da janela de quem executa.
      name: "visual",
      testMatch: "**/dia-009-regressao-visual/**",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
    {
      // Emulação real de celular: toque, user agent e — por vir do descriptor
      // do iPhone 13 — o motor WebKit, o mesmo do Safari no iOS. Testar aqui
      // pega bugs de mobile que o Chromium em janela estreita não revela.
      name: "mobile",
      testMatch: "**/dia-010-acessibilidade/mobile.spec.ts",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
