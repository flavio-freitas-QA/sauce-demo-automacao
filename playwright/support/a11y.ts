import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

// Mesmo conjunto de regras usado no Cypress (cypress/support/a11y.ts), para
// que as duas ferramentas reportem os mesmos achados.
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

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

/** Roda o axe na página e devolve as violações encontradas. */
export const analisarAcessibilidade = async (page: Page, regrasIgnoradas: string[] = []) => {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);

  if (regrasIgnoradas.length > 0) {
    builder = builder.disableRules(regrasIgnoradas);
  }

  const { violations } = await builder.analyze();
  return violations;
};

/** Resumo legível das violações, usado como mensagem de falha. */
export const resumirViolacoes = (violations: { id: string; impact?: string | null; nodes: unknown[] }[]) =>
  violations.map((v) => `[${v.impact}] ${v.id} (${v.nodes.length} nó(s))`).join("\n");
