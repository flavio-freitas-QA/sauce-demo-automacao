// Arquivo carregado automaticamente antes de cada spec.
// Importa comandos customizados e registra o reporter HTML (mochawesome).
import "./commands";
import "cypress-mochawesome-reporter/register";
import "cypress-axe";
import { register as registerCypressGrep } from "@cypress/grep";

// Habilita a filtragem por tags (@smoke) via --expose grepTags=...
registerCypressGrep();

// Nenhum handler global de "uncaught:exception" aqui de propósito:
// engolir toda exceção esconderia erros reais da aplicação. Os specs que
// exercitam usuários intencionalmente quebrados (problem_user/error_user)
// registram o handler de forma escopada com cy.on() no próprio teste.
