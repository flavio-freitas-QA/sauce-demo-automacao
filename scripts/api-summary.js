const fs = require("fs");
const path = require("path");

// Publica no resumo do GitHub Actions o resultado das collections de API,
// no mesmo formato dos resumos de Cypress e Playwright — assim as três
// suítes aparecem com a mesma cara na página do workflow.
const newmanDir = path.resolve(__dirname, "..", "newman");
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function readRuns() {
  if (!fs.existsSync(newmanDir)) {
    return [];
  }

  return fs
    .readdirSync(newmanDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const report = JSON.parse(fs.readFileSync(path.join(newmanDir, file), "utf8"));
      const stats = report?.run?.stats || {};
      const timings = report?.run?.timings || {};

      return {
        nome: report?.collection?.info?.name || path.basename(file, ".json"),
        requisicoes: stats.requests?.total || 0,
        asserçõesTotal: stats.assertions?.total || 0,
        asserçõesFalhas: stats.assertions?.failed || 0,
        duracao: Number(timings.completed || 0) - Number(timings.started || 0),
      };
    });
}

function buildMarkdownTable(runs) {
  const linhas = [
    "## Resumo dos testes de API (Newman)",
    "",
    "| Collection | Requisições | Asserções ✅ | Asserções ❌ | Duração 🕒 |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];

  for (const run of runs) {
    const aprovadas = run.asserçõesTotal - run.asserçõesFalhas;
    linhas.push(
      `| ${run.nome} | ${run.requisicoes} | ${aprovadas} | ${run.asserçõesFalhas} | ${formatDuration(run.duracao)} |`,
    );
  }

  linhas.push("");
  return linhas.join("\n");
}

function writeSummary(markdown) {
  if (summaryPath) {
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    fs.appendFileSync(summaryPath, `${markdown}\n`, "utf8");
  }

  console.log(markdown);
}

function main() {
  const runs = readRuns();

  if (runs.length === 0) {
    writeSummary(
      [
        "## Resumo dos testes de API (Newman)",
        "",
        "Nenhum arquivo de resultados foi encontrado em newman/.",
        "",
      ].join("\n"),
    );
    return;
  }

  writeSummary(buildMarkdownTable(runs));
}

main();
