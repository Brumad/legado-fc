import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [hub, page, css] = await Promise.all([
  readFile(new URL("../app/career-hub.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

const requiredHubLabels = [
  "PRÓXIMO JOGO",
  "ENERGIA",
  "MORAL",
  "FORMA",
  "CONDIÇÃO",
  "SALDO",
  "SALÁRIO",
  "Partida",
  "Treino",
  "Vida",
  "Mundo",
  "Mercado",
  "Perfil",
  "Calendário",
  "Decisões e eventos",
  "Relações",
  "Contrato e finanças",
];

for (const label of requiredHubLabels) {
  assert.ok(hub.includes(label), "Hub sem rótulo essencial: " + label);
}

assert.ok(page.includes("<CareerHub"));
assert.equal((page.match(/function Dashboard\(/g) ?? []).length, 1);
assert.ok(hub.length > 8000, "CareerHub parece incompleto");

for (const breakpoint of ["980px", "700px", "420px"]) {
  assert.ok(css.includes("max-width: " + breakpoint), "Breakpoint ausente: " + breakpoint);
}

assert.ok(css.includes(".hub-action-grid button:focus-visible"));
assert.ok(css.includes("overflow-x: auto"));
assert.ok(css.includes("career-hub-v051"));

const dashboardStart = page.indexOf("function Dashboard(");
const seasonStart = page.indexOf("function gameDate(", dashboardStart);
assert.ok(dashboardStart >= 0 && seasonStart > dashboardStart);
const wrapper = page.slice(dashboardStart, seasonStart);
assert.ok(!wrapper.includes("<article"), "Dashboard voltou a crescer dentro de page.tsx");

console.log(JSON.stringify({
  careerHubExtracted: true,
  essentialInformation: true,
  primaryNavigation: 6,
  responsiveBreakpoints: [980, 700, 420],
  keyboardFocus: true
}));
