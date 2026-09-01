/// <reference types="cypress" />

// Configuração compartilhada da análise de acessibilidade (axe-core).
// Ambas as ferramentas do projeto usam o mesmo conjunto de regras, para que
// Cypress e Playwright reportem os mesmos achados.
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

export const axeRunOptions = { runOnly: { type: "tag" as const, values: WCAG_TAGS } };

/**
 * Violações conhecidas do Sauce Demo, confirmadas contra o site.
 * Excluí-las de uma varredura mantém o teste sensível a violações NOVAS,
 * enquanto cada uma tem seu próprio teste documentando o defeito.
 */
export const VIOLACOES_CONHECIDAS = {
  /** Dropdown de ordenação do catálogo sem nome acessível. */
  selectSemNome: "select-name",
  /** Botão X que fecha a mensagem de erro do login, sem texto discernível. */
  botaoSemNome: "button-name",
} as const;

/**
 * Imprime as violações no terminal do Cypress. Sem isso, a falha do
 * checkA11y aparece apenas como um número, sem dizer o que quebrou.
 */
export const logViolations = (violations: any[]) => {
  cy.task(
    "log",
    `${violations.length} violação(ões) de acessibilidade:\n` +
      violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nó(s))`)
        .join("\n"),
    { log: false },
  );
};
