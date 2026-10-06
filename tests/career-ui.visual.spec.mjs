import { test, expect } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/legado-fc/";

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
];

async function openCareer(page) {
  await page.goto(baseURL);
  await page.evaluate(() => {
    localStorage.setItem("legado-fc-career-slots-v1", JSON.stringify([{
      id: "visual-051",
      name: "Alex Visual",
      age: 19,
      position: "Meia",
      matches: 12,
      goals: 5,
      assists: 7,
      rating: 7.4,
      energy: 78,
      morale: 82,
      formBoost: 4,
      reputation: 48,
      bankBalance: 380000,
      investments: 120000,
      retirementFund: 50000,
      salary: 42000,
      coachTrust: 76,
      squadRelations: 68,
      familyBond: 71,
      pendingLifeEvent: "primeira-entrevista",
      season: 1,
      seasonRound: 7,
      preparationActionsAllowed: 3,
      preparationActionsUsed: 1,
      preparationLog: ["Fundamentos"]
    }, null, null]));
  });
  await page.reload();
  await page.getByRole("button", { name: /CONTINUAR CARREIRA/i }).click();
  await expect(page.locator(".career-hub-v051")).toBeVisible();
}

async function assertNoDocumentOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(metrics.scrollWidth, label + " documentElement overflow").toBeLessThanOrEqual(metrics.width + 1);
  expect(metrics.bodyScrollWidth, label + " body overflow").toBeLessThanOrEqual(metrics.width + 1);
}

async function navigate(page, label) {
  const candidates = page.locator("button:visible").filter({ hasText: label });
  await expect(candidates.first()).toBeVisible();
  await candidates.first().click();
}

for (const viewport of viewports) {
  test("career UI " + viewport.name + " has no horizontal document overflow", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await openCareer(page);

    await assertNoDocumentOverflow(page, viewport.name + " home");
    await expect(page.getByText("PRÓXIMO JOGO")).toBeVisible();
    await expect(page.getByText("ENERGIA", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("SALDO", { exact: true }).first()).toBeVisible();

    for (const item of [
      { label: "Vida", selector: ".life-v051" },
      { label: "Mercado", selector: ".market-v051" },
      { label: "Perfil", selector: ".player-v051" },
      { label: "Temporada", selector: ".season-v051" },
      { label: "Mundo", selector: ".world-v051" },
    ]) {
      await navigate(page, item.label);
      await expect(page.locator(item.selector)).toBeVisible();
      await assertNoDocumentOverflow(page, viewport.name + " " + item.label);
    }

    await page.screenshot({
      path: "test-results/career-ui-" + viewport.name + ".png",
      fullPage: true,
    });

    await context.close();
  });
}

test("keyboard reaches primary career actions", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await openCareer(page);

  let foundPrimaryAction = false;
  for (let index = 0; index < 30; index += 1) {
    await page.keyboard.press("Tab");
    const text = await page.evaluate(() => (document.activeElement?.textContent ?? "").trim());
    if (/Partida|Treino|Vida|Mundo|Mercado|Perfil/i.test(text)) {
      foundPrimaryAction = true;
      break;
    }
  }
  expect(foundPrimaryAction).toBe(true);
  await context.close();
});
