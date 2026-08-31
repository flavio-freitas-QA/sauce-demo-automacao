# AGENT.md

## Objetivo
Este repositório é um portfólio de automação de testes com Cypress, Playwright e Postman/Newman. O agente deve ajudar a manter a estrutura, a clareza e a qualidade dos testes.

## Regras principais
- Trabalhe com TypeScript e siga o padrão já adotado no projeto.
- Prefira Page Object Model para páginas de UI em Cypress e Playwright.
- Mantenha testes pequenos, legíveis e determinísticos.
- Use fixtures quando houver massa de dados; evite valores hardcoded desnecessários.
- Organize novos arquivos por dia, seguindo a estrutura atual: cypress/e2e/dia-XXX-..., playwright/tests/dia-XXX-..., postman/collections/dia-XXX-...
- Autenticação em fluxos que não testam o login: use cy.login (Cypress) ou a fixture loginAs (Playwright), nunca o formulário via UI.
- Seletores: prefira os atributos data-test da aplicação; exceções documentadas nos Page Objects.
- Documente decisões técnicas relevantes em docs/ quando adicionar um novo fluxo.

## Estrutura esperada
- Cypress: cypress/e2e/, cypress/fixtures/, cypress/support/pages/
- Playwright: playwright/tests/, playwright/pages/, playwright/fixtures/
- API: postman/collections/, postman/environments/

## Comandos de validação
Antes de concluir alterações, rode os comandos relevantes, por exemplo:
- npm run typecheck
- npm run cy:run
- npm run pw:test
- npm run api:test

## Estilo
- Responda de forma objetiva e prática.
- Quando alterar testes, explique o que mudou e qual comando validar.
- Se algo não puder ser confirmando, diga claramente.
