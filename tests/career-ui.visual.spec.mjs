import { test, expect } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/legado-fc/";

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

const careerFixture = {
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
  preparationLog: ["Fundamentos"],
};

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
];

async function openCareer(page) {
  await page.addInitScript((fixture) => {
    window.localStorage.setItem(
      "legado-fc-career-slots-v1",
      JSON.stringify([fixture, null, null]),
    );
  }, careerFixture);

  await page.goto(baseURL, { waitUntil: "networkidle" });
  const continueButton = page.getByRole("button", { name: /CONTINUAR CARREIRA/i }).first();
  await expect(continueButton).toBeVisible();
  await continueButton.click();
  await expect(page.locator(".career-hub-v051")).toBeVisible({ timeout: 10_000 });
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

async function navigate(page, view) {
  const button = page.locator(`[data-career-nav="${view}"]:visible`).first();
  await expect(button).toBeVisible();
  await button.click();
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
    await expect(page.locator(".hub-next-match")).toBeVisible();
    await expect(page.locator(".hub-status-strip")).toContainText("ENERGIA");
    await expect(page.locator(".hub-player-header")).toContainText("SALDO");

    for (const item of [
      { view: "life", selector: ".life-v051" },
      { view: "market", selector: ".market-v051" },
      { view: "player", selector: ".player-v051" },
      { view: "season", selector: ".season-v051" },
      { view: "world", selector: ".world-v051" },
    ]) {
      await navigate(page, item.view);
      await expect(page.locator(item.selector)).toBeVisible();
      await assertNoDocumentOverflow(page, viewport.name + " " + item.view);
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
