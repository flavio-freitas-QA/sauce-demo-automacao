// Arquivo carregado automaticamente antes de cada spec.
// Importa comandos customizados e configura hooks globais.
import "./commands";

// Exemplo de hook global: ignora exceções não capturadas vindas da aplicação
// (útil quando o app-alvo tem erros de terceiros que não queremos que quebrem o teste)
Cypress.on("uncaught:exception", () => {
  return false;
});
