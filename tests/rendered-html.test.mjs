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

test("server-renders the Legado FC 0.3.2 application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="pt-BR">/i);
  assert.match(html, /<title>Legado FC — Mundo Profissional<\/title>/i);
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest"/i);
  assert.match(html, /og-v4\.png/i);
});

test("keeps the main v0.3.2 systems in the production source", async () => {
  const [page, engine, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/game-engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /CARREIRA 0\.3\.2/);
  assert.match(page, /country-choice-grid/);
  assert.match(page, /getLeagueDefinition/);
  assert.match(page, /promotions/);
  assert.match(page, /preparation-calendar/);
  assert.match(page, /Aula de idioma/);
  assert.match(page, /ACEITAR/);
  assert.match(engine, /COUNTRIES/);
  assert.match(engine, /Liga Nacional A/);
  assert.match(engine, /Premier Crown/);
  assert.match(engine, /freeKick/);
  assert.match(engine, /corner/);
  assert.match(engine, /penalty/);
  assert.match(engine, /counter/);
  assert.match(engine, /aerial/);
  assert.match(engine, /samplePoisson/);
  assert.match(css, /origin-choice-grid/);
  assert.match(css, /grid-template-columns:\s*repeat\(5,1fr\)/);
  await access(new URL("../public/og-v4.png", import.meta.url));
});
