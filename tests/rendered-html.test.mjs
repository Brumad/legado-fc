import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Legado FC 0.4.2 application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="pt-BR">/i);
  assert.match(html, /<title>Legado FC — Partidas 2\.0<\/title>/i);
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest"/i);
  assert.match(html, /og-v6\.png/i);
});

test("keeps the Partidas 2.0 and career-market systems in the production source", async () => {
  const [page, engine, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/game-engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PARTIDAS 2\.0 · 0\.4\.2/);
  assert.match(page, /country-choice-grid/);
  assert.match(page, /getLeagueDefinition/);
  assert.match(page, /promotions/);
  assert.match(page, /preparation-calendar/);
  assert.match(page, /Aula de idioma/);
  assert.match(page, /ASSINAR/);
  assert.match(page, /developerMode/);
  assert.match(page, /LifeView/);
  assert.match(page, /getClubLeaders/);
  assert.match(page, /WorldView/);
  assert.match(page, /playerWorldRank/);
  assert.match(page, /player\.nationality/);
  assert.match(page, /MUNDO \+5 TEMPORADAS/);
  assert.match(page, /match-tactical-strip/);
  assert.match(page, /opponentPosture/);
  assert.match(page, /match-report-2/);
  assert.match(page, /suspensionMatches/);
  assert.match(page, /getCareerTransferOffers/);
  assert.match(page, /completeCareerTransfer/);
  assert.match(page, /exportCareer/);
  assert.match(page, /importCareer/);
  assert.match(engine, /COUNTRIES/);
  assert.match(engine, /Liga Nacional A/);
  assert.match(engine, /Premier Crown/);
  assert.match(engine, /freeKick/);
  assert.match(engine, /corner/);
  assert.match(engine, /penalty/);
  assert.match(engine, /counter/);
  assert.match(engine, /aerial/);
  assert.match(engine, /samplePoisson/);
  assert.match(engine, /opponentTactics/);
  assert.match(engine, /yellow-card/);
  assert.match(engine, /red-card/);
  assert.match(engine, /offside/);
  assert.match(engine, /substitution/);
  assert.match(engine, /positionFocus/);
  assert.match(engine, /MatchStatistics/);
  assert.match(engine, /getContractRenewal/);
  assert.match(engine, /simulateFullRound/);
  assert.match(engine, /LEAGUE_FORMATS/);
  assert.match(engine, /SquadPlayer/);
  assert.match(engine, /WorldPlayerState/);
  assert.match(engine, /nationalityId/);
  assert.match(engine, /prestigeBias/);
  assert.match(engine, /minimumClubStrength/);
  assert.match(engine, /normalizeWorldPlayers/);
  assert.match(engine, /getWorldRanking/);
  assert.match(engine, /advanceWorldSeason/);
  assert.match(engine, /createRegeneratedPlayer/);
  assert.match(engine, /worldLastUpdatedSeason/);
  assert.match(css, /origin-choice-grid/);
  assert.match(css, /grid-template-columns:\s*repeat\(5,1fr\)/);
  assert.match(css, /developer-panel/);
  assert.match(css, /life-dashboard/);
  assert.match(css, /world-dashboard-grid/);
  assert.match(css, /career-archive-card/);
  assert.match(css, /match-tactical-strip/);
  assert.match(css, /stat-comparison-row/);
  assert.match(css, /pending-transfer-banner/);
  await access(new URL("../public/og-v6.png", import.meta.url));
});
