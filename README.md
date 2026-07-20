# SauceDemo Automação

Portfólio de automação de testes com atualizações diárias. Cada dia cobre um novo fluxo, uma nova técnica ou uma nova ferramenta, evoluindo em complexidade ao longo do tempo.

## 🎯 Objetivo

Demonstrar, de forma prática e contínua, domínio em:
- **Cypress** — automação de UI (E2E)
- **Playwright** — automação de UI (E2E), com foco em comparar abordagens com Cypress
- **Postman/Newman** — testes de API

## 🗺️ Roadmap

| Fase | Alvo | Foco |
|------|------|------|
| Semana 1-2 | [Sauce Demo](https://www.saucedemo.com) | Fluxos básicos de e-commerce (login, carrinho, checkout) |
| Semana 3-4 | Sauce Demo (avançado) | Interceptação de rede, fixtures dinâmicas, POM refinado |
| Semana 5+ | AutomationExercise.com | Fluxos mais complexos + testes de API integrados |
| Contínuo | JSONPlaceholder / API própria | 1 dia por semana dedicado exclusivamente a testes de API |
| Futuro | Aplicação própria | Migração da suíte para app desenvolvida do zero |

## 📅 Progresso diário

| Dia | Ferramenta | Fluxo testado | Destaque técnico |
|-----|-----------|----------------|-------------------|
| 001 | Cypress + Playwright | Login (Sauce Demo) | Page Object Model, fixtures de usuários, casos negativos |
| 002 | Cypress + Playwright | Carrinho de compras (Sauce Demo) | Add/remove, persistência de estado, acesso autenticado e acesso direto |
| 003 | Cypress + Playwright | Checkout (Sauce Demo) | Validações de formulário, subtotal, taxa, total e resumo do pedido |
| 004 | Postman/Newman | APIs públicas JSONPlaceholder e ReqRes | Collections, environments, contratos e cenários negativos |
| 005 | Cypress + Playwright | Catálogo, menu lateral e performance | Ordenação, detalhe do produto, footer, reset/logout/about e `performance_glitch_user` |
| 006 | Cypress + Playwright | Usuários especiais (Sauce Demo) | `problem_user`, `error_user`, `visual_user` e bugs conhecidos documentados |

> Tabela atualizada a cada novo dia. Detalhes de cada entrada em [`docs/`](./docs).

## 🛠️ Stack técnica

- TypeScript
- Cypress
- Playwright
- Postman / Newman (CLI)
- GitHub Actions (CI)

## 📂 Estrutura do projeto

```
sauce-demo-automacao/
├── cypress/
│   ├── e2e/                  # specs organizados por dia (day-XXX-nome-do-fluxo)
│   ├── fixtures/              # massa de dados (ex: usuários)
│   └── support/
│       ├── pages/              # Page Objects
│       ├── commands.ts         # comandos customizados
│       └── e2e.ts              # config global
├── playwright/
│   ├── tests/                 # specs organizados por dia
│   ├── pages/                  # Page Objects
│   └── fixtures/
├── postman/
│   ├── collections/            # collections por dia de API
│   └── environments/
├── docs/                      # 1 markdown por dia, explicando decisões técnicas
└── .github/workflows/         # pipeline de CI
```

## ▶️ Como rodar localmente

Pré-requisitos: Node.js 20+

```bash
# instalar dependências
npm install

# Cypress
npm run cy:open      # modo interativo
npm run cy:run        # modo headless

# Playwright
npm run pw:test        # roda todos os testes
npm run pw:test:ui      # modo interativo (UI mode)
npm run pw:report       # abre o último relatório

# API (Postman via Newman)
npm run api:test

# Rodar tudo (typecheck + cypress + playwright + api)
npm run test:all
```

## 🔄 CI/CD

Todo push/PR para `main` dispara automaticamente:
1. Type check (TypeScript)
2. Suíte Cypress (Chrome)
3. Suíte Playwright (Chromium + Firefox)
4. Testes de API (Newman)

Relatórios do Playwright e screenshots de falhas do Cypress ficam disponíveis como artifacts do workflow.

## 👤 Autor

Flavio — QA com background em automação de testes (Cypress/Playwright), análise de requisitos e infraestrutura.
