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

test("server-renders the Legado FC application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="pt-BR">/i);
  assert.match(html, /<title>Legado FC — Temporada Viva<\/title>/i);
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest"/i);
  assert.match(html, /og-v2\.png/i);
});

test("keeps the main v0.2 systems in the production source", async () => {
  const [page, engine, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/game-engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /SLOT 0/);
  assert.match(page, /CRIAR NOVA CARREIRA/);
  assert.match(page, /settingsKey/);
  assert.match(page, /mobile-nav/);
  assert.match(engine, /LEAGUE_TEAMS/);
  assert.match(engine, /generateStandings/);
  assert.match(engine, /generateMatchPlan/);
  assert.match(css, /grid-template-columns:\s*repeat\(5,1fr\)/);
  await access(new URL("../public/og-v2.png", import.meta.url));
});
