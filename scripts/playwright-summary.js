const fs = require("fs");
const path = require("path");

const reportPath = path.resolve(__dirname, "..", "playwright-report", "results.json");
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function countTestsFromSuites(suites, counts = { passed: 0, failed: 0, skipped: 0, pending: 0, interrupted: 0, duration: 0 }) {
  for (const suite of suites || []) {
    if (Array.isArray(suite.specs)) {
      for (const spec of suite.specs) {
        if (Array.isArray(spec.tests)) {
          for (const test of spec.tests) {
            const results = Array.isArray(test?.results) ? test.results : [];
            const lastResult = results[results.length - 1] || {};
            const status = String(lastResult?.status || test?.status || "").toLowerCase();
            const duration = Number(lastResult?.duration || 0);

            counts.duration += duration;

            if (status === "passed") {
              counts.passed += 1;
            } else if (status === "failed") {
              counts.failed += 1;
            } else if (status === "skipped") {
              counts.skipped += 1;
            } else if (status === "pending" || status === "interrupted") {
              counts.pending += 1;
            }
          }
        }
      }
    }

    countTestsFromSuites(suite.suites || [], counts);
  }

  return counts;
}

function extractCounts(report) {
  const counts = countTestsFromSuites(report?.suites || []);

  return {
    passed: counts.passed,
    failed: counts.failed,
    pending: counts.pending,
    skipped: counts.skipped,
    interrupted: counts.interrupted,
    duration: counts.duration,
  };
}

function buildMarkdownTable(counts) {
  const rows = [
    "## Resumo do Playwright",
    "",
    "| Resultado | Aprovado ✅ | Falhou ❌ | Pendente 🤚 | Ignorado ↩️ | Duração 🕒 |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    `| Playwright | ${counts.passed} | ${counts.failed} | ${counts.pending} | ${counts.skipped} | ${formatDuration(counts.duration)} |`,
    "",
  ];

  return rows.join("\n");
}

function writeSummary(markdown) {
  if (summaryPath) {
    const outputDir = path.dirname(summaryPath);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.appendFileSync(summaryPath, `${markdown}\n`, "utf8");
  }

  console.log(markdown);
}

function main() {
  if (!fs.existsSync(reportPath)) {
    const fallback = [
      "## Resumo do Playwright",
      "",
      "Nenhum arquivo de resultados foi encontrado em playwright-report/results.json.",
      "",
    ].join("\n");

    writeSummary(fallback);
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  const counts = extractCounts(report);
  const markdown = buildMarkdownTable(counts);
  writeSummary(markdown);
}

main();
