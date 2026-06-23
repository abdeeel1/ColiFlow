import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))
const read = (f) => readFileSync(join(here, f), "utf8")

const esc = (s) =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

// Turn raw test output into colourised terminal lines.
function terminal(raw) {
    return raw
        .replace(/\r/g, "")
        .split("\n")
        .map((line) => {
            const e = esc(line)
            if (/✓/.test(line)) return `<span class="ok">${e}</span>`
            if (/\bPASS\b/.test(line)) return `<span class="pass">${e}</span>`
            if (/Tests:|Test Files|Tests\s/.test(line))
                return `<span class="sum">${e}</span>`
            if (/Duration|Start at|RUN/.test(line))
                return `<span class="dim">${e}</span>`
            return `<span>${e || " "}</span>`
        })
        .join("\n")
}

const backend = terminal(read("backend.txt"))
const frontend = terminal(read("frontend.txt"))

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ColiFlow — Test Report</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b; margin: 0; line-height: 1.5; font-size: 12px;
  }
  .brand { color: #0984E3; }
  header {
    border-bottom: 3px solid #0984E3; padding-bottom: 16px; margin-bottom: 22px;
  }
  header h1 { margin: 0 0 4px; font-size: 26px; letter-spacing: -.5px; }
  header .sub { color: #64748b; font-size: 13px; }
  .cards { display: flex; gap: 12px; margin: 18px 0 26px; }
  .card {
    flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;
    background: #f8fafc;
  }
  .card .n { font-size: 30px; font-weight: 800; color: #0984E3; line-height: 1; }
  .card .l { font-size: 11px; color: #64748b; margin-top: 6px; text-transform: uppercase; letter-spacing: .4px; }
  .card.green .n { color: #16a34a; }
  h2 { font-size: 15px; margin: 26px 0 10px; display: flex; align-items: center; gap: 8px; }
  h2::before { content: ""; width: 10px; height: 10px; border-radius: 3px; background: #0984E3; display: inline-block; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
  th { background: #f1f5f9; font-weight: 700; color: #334155; }
  .term {
    background: #0d1117; border-radius: 10px; overflow: hidden;
    box-shadow: 0 6px 18px rgba(2,6,23,.18); margin: 10px 0 20px;
    page-break-inside: avoid; border: 1px solid #1f2937;
  }
  .term .bar { background: #161b22; padding: 8px 12px; display: flex; align-items: center; gap: 7px; }
  .term .bar i { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
  .term .bar .r { background: #ff5f56; } .term .bar .y { background: #ffbd2e; } .term .bar .g { background: #27c93f; }
  .term .bar span.t { color: #8b949e; font-size: 11px; margin-left: 8px; font-family: monospace; }
  .term pre {
    margin: 0; padding: 14px 16px; color: #c9d1d9; font-size: 10.5px; line-height: 1.55;
    font-family: "Cascadia Code", "Consolas", "SFMono-Regular", monospace;
    white-space: pre-wrap; word-break: break-word;
  }
  .term .ok { color: #3fb950; }
  .term .pass { color: #0d1117; background: #3fb950; font-weight: 700; padding: 0 4px; border-radius: 3px; }
  .term .sum { color: #58a6ff; font-weight: 700; }
  .term .dim { color: #8b949e; }
  ul.fixes { margin: 6px 0; padding-left: 18px; }
  ul.fixes li { margin: 6px 0; }
  code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 11px; }
  .run { background: #0d1117; color: #c9d1d9; border-radius: 8px; padding: 12px 14px; font-family: monospace; font-size: 11px; }
  .run b { color: #3fb950; }
  footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; }
  .badge { display:inline-block; background:#16a34a; color:#fff; font-weight:700; font-size:11px; padding:3px 10px; border-radius:999px; }
</style>
</head>
<body>
  <header>
    <h1>Coli<span class="brand">Flow</span> — Automated Test Report</h1>
    <div class="sub">Quality assurance before deployment &middot; ${new Date().toISOString().slice(0, 10)} &middot; <span class="badge">ALL TESTS PASSING</span></div>
  </header>

  <div class="cards">
    <div class="card green"><div class="n">41</div><div class="l">Tests passing</div></div>
    <div class="card green"><div class="n">100%</div><div class="l">Success rate</div></div>
    <div class="card"><div class="n">32</div><div class="l">Backend (PHPUnit)</div></div>
    <div class="card"><div class="n">9</div><div class="l">Frontend (Vitest)</div></div>
  </div>

  <h2>Testing strategy</h2>
  <table>
    <tr><th>Layer</th><th>Tool</th><th>What it verifies</th><th>Tests</th></tr>
    <tr><td>API / Feature</td><td>Laravel PHPUnit</td><td>Real endpoints: packages, travels, admin access, auth</td><td>28</td></tr>
    <tr><td>Unit</td><td>Laravel PHPUnit</td><td>Model logic (platform settings)</td><td>4</td></tr>
    <tr><td>Component / Unit</td><td>Vitest + Testing Library</td><td>UI components, class merger, i18n FR/EN/AR parity</td><td>9</td></tr>
  </table>

  <h2>Backend suite — <code>php artisan test</code></h2>
  <div class="term">
    <div class="bar"><i class="r"></i><i class="y"></i><i class="g"></i><span class="t">coliflow/server — php artisan test</span></div>
    <pre>${backend}</pre>
  </div>

  <h2>Frontend suite — <code>npm test</code></h2>
  <div class="term">
    <div class="bar"><i class="r"></i><i class="y"></i><i class="g"></i><span class="t">coliflow/client — vitest run</span></div>
    <pre>${frontend}</pre>
  </div>

  <h2>Real bugs found &amp; fixed through testing</h2>
  <ul class="fixes">
    <li><b>MySQL-only migration</b> — a migration used <code>ALTER TABLE … MODIFY … ENUM</code>, which only works on MySQL. Guarded it to MySQL/MariaDB so the app is database-portable.</li>
    <li><b>MySQL-only query</b> — the package dashboard used the <code>YEARWEEK()</code> function. Rewrote the weekly stats in PHP — portable and one fewer query.</li>
    <li><b>Stale auth tests</b> — 5 scaffolded auth tests no longer matched the customised registration / verification / reset flow. Updated them to the real contract.</li>
  </ul>

  <h2>How to run</h2>
  <div class="run">
    <div># From the project root — runs both suites side by side</div>
    <div><b>npm&nbsp;test</b></div>
    <div style="margin-top:8px"># Or individually</div>
    <div><b>npm run test:server</b>&nbsp;&nbsp;# Laravel / PHPUnit</div>
    <div><b>npm run test:client</b>&nbsp;&nbsp;# Vitest</div>
  </div>

  <footer>ColiFlow — peer-to-peer delivery platform · Automated test report generated for project presentation.</footer>
</body>
</html>`

writeFileSync(join(here, "report.html"), html)
console.log("report.html written")
