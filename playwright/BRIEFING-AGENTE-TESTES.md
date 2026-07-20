# Briefing para agente de escrita de testes Playwright

## Contexto

O projeto usa Cypress e Playwright para automatizar fluxos do Sauce Demo. A suite Cypress foi reorganizada por dias e serviu como base para portar os cenarios faltantes para Playwright.

## Comparativo Cypress x Playwright

- Cypress ja cobria `dia-001-login-fluxo`, `dia-002-carrinho-compras`, `dia-003-checkout`, `dia-005-catalogo-menu` e `dia-006-usuarios-especiais`.
- Playwright cobria parcialmente `dia-001-login-fluxo`, `dia-002-carrinho-compras` e `dia-003-checkout`.
- Foram adicionados em Playwright:
  - cenarios faltantes de login, carrinho e checkout nos specs ja existentes
  - `playwright/tests/dia-005-catalogo-menu/catalogo.spec.ts`
  - `playwright/tests/dia-005-catalogo-menu/menu-lateral.spec.ts`
  - `playwright/tests/dia-005-catalogo-menu/performance-glitch.spec.ts`
  - `playwright/tests/dia-006-usuarios-especiais/special-users.spec.ts`

## Page Objects

Manter o padrao atual de Page Objects em `playwright/pages`, recebendo `Page` no construtor e expondo `Locator`/metodos async.

Foram adicionados:

- `ProductDetailPage.ts`: detalhe do produto, botao add/remove e back to products.
- `SidebarPage.ts`: menu lateral, all items, about, logout e reset app state.

Foi expandido:

- `InventoryPage.ts`: clique por nome, listagem de nomes/precos, links do footer.
- `CheckoutPage.ts`: locator de item no resumo da etapa 2.

## Fixtures

As fixtures Playwright foram sincronizadas com Cypress:

- `users.json`: inclui `performanceGlitch`, `errorUser` e `visualUser`.
- `products.json`: inclui `description` para validar detalhe de produto.

## Diretrizes para novos testes

- Preferir fixtures JSON importadas em vez de valores hardcoded de produto/usuario.
- Usar Page Objects para acoes reutilizaveis e locators diretos apenas para asserts pontuais.
- Para contador do carrinho, manter `expect.poll(() => inventoryPage.getCartBadgeCount())`.
- Em usuarios especiais, preservar os cenarios de bug conhecido como testes documentais, validando o comportamento atual do Sauce Demo.
- Evitar alterar os specs Cypress ao evoluir Playwright, salvo quando a intencao for sincronizar as duas suites.

## Cobertura portada e auditada

- Login completo: sucesso, senha invalida, locked out, campos vazios/parciais e logout.
- Carrinho completo: add/remove, todos os produtos, vazio, navegacao, persistencia via reload, acesso direto/autenticado e problem_user.
- Checkout completo: sucesso, validacoes obrigatorias, cancel nas etapas, subtotal, taxa, total, resumo de itens, carrinho vazio, finalizar, back home e acesso direto sem login.
- Ordenacao A-Z, Z-A, preco menor-maior e maior-menor.
- Persistencia de produto no carrinho ao alternar ordenacao.
- Detalhe de produto, voltar ao catalogo e add/remove pelo detalhe.
- Footer com links sociais esperados.
- Menu lateral: All Items, Reset App State, abrir/fechar, Logout e About.
- Performance glitch user com login lento, metrica aproximada e add/remove com delay.
- Usuarios especiais `problem_user`, `error_user` e `visual_user`, incluindo fluxos esperados e bugs conhecidos.

## Validacao executada

- `npm.cmd run typecheck`
- `npx.cmd playwright test --project=chromium`
- Resultado da ultima execucao Chromium: 61 testes passados.
