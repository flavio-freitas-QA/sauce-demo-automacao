const fs = require("fs");
const path = require("path");

// Publica no resumo do GitHub Actions as contagens da execução do Cypress.
// A action cypress-io/github-action gera um resumo próprio, mas ele deixa de
// refletir a suíte quando um reporter customizado (mochawesome) assume a
// saída — então o resumo é montado aqui, a partir do JSON do próprio relatório.
const reportPath = path.resolve(__dirname, "..", "cypress", "reports", "index.json");
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function buildMarkdownTable(stats) {
  return [
    "## Resumo do Cypress",
    "",
    "| Resultado | Aprovado ✅ | Falhou ❌ | Pendente 🤚 | Ignorado ↩️ | Duração 🕒 |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    `| Cypress | ${stats.passes || 0} | ${stats.failures || 0} | ${stats.pending || 0} | ${stats.skipped || 0} | ${formatDuration(stats.duration)} |`,
    "",
  ].join("\n");
}

function writeSummary(markdown) {
  if (summaryPath) {
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    fs.appendFileSync(summaryPath, `${markdown}\n`, "utf8");
  }

  console.log(markdown);
}

function main() {
  if (!fs.existsSync(reportPath)) {
    writeSummary(
      [
        "## Resumo do Cypress",
        "",
        "Nenhum arquivo de resultados foi encontrado em cypress/reports/index.json.",
        "",
      ].join("\n"),
    );
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  writeSummary(buildMarkdownTable(report.stats || {}));
}

main();
