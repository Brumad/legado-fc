import { test, expect } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/legado-fc/";
test.setTimeout(60_000);

async function assertNoOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    width: window.innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(metrics.html, label + " html overflow").toBeLessThanOrEqual(metrics.width + 1);
  expect(metrics.body, label + " body overflow").toBeLessThanOrEqual(metrics.width + 1);
}

async function openCreator(page) {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /CRIAR NOVA CARREIRA/i }).first().click();
  await expect(page.locator(".creator-v053")).toBeVisible();
}

for (const viewport of [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
]) {
  test("0.5.3 creator " + viewport.name + " exposes all countries without page overflow", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.width <= 390,
      hasTouch: viewport.width <= 390,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await openCreator(page);

    const countries = page.locator(".country-choice");
    await expect(countries).toHaveCount(12);
    const last = countries.nth(11);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeVisible();
    await expect(page.locator(".create-career-button")).toBeAttached();
    await expect(page.locator(".player-avatar-v053")).toBeVisible();
    await assertNoOverflow(page, viewport.name);

    const shell = page.locator(".country-choice-shell");
    if (viewport.width <= 390) {
      const dimensions = await shell.evaluate((element) => ({
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        overflowY: getComputedStyle(element).overflowY,
      }));
      expect(["auto", "scroll"]).toContain(dimensions.overflowY);
      expect(dimensions.scrollHeight).toBeGreaterThanOrEqual(dimensions.clientHeight);
    }

    await context.close();
  });
}

test("0.5.3 creator landscape keeps countries and final action reachable", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await openCreator(page);
  await expect(page.locator(".country-choice")).toHaveCount(12);
  await page.locator(".country-choice").last().scrollIntoViewIfNeeded();
  await expect(page.locator(".country-choice").last()).toBeVisible();
  await page.locator(".create-career-button").scrollIntoViewIfNeeded();
  await expect(page.locator(".create-career-button")).toBeVisible();
  await assertNoOverflow(page, "landscape");
  await context.close();
});

test("0.5.3 settings expose duration mobile controls and career difficulty", async ({ browser }) => {
  const career = {
    id: "settings-053",
    name: "Alex Config",
    countryId: "BR",
    division: 1,
    difficulty: "Profissional",
    seasonRound: 1,
    careerSeed: 53053,
  };
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.addInitScript((fixture) => {
    localStorage.setItem("legado-fc-career-slots-v1", JSON.stringify([fixture, null, null]));
  }, career);
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /CONTINUAR CARREIRA/i }).first().click();
  await page.locator('[data-career-nav="settings"]:visible').first().click();

  await expect(page.getByText("Duração da partida 2D")).toBeVisible();
  await expect(page.getByRole("button", { name: "3 min" })).toBeVisible();
  await expect(page.getByRole("button", { name: "6 min" })).toBeVisible();
  await expect(page.getByRole("button", { name: "10 min" })).toBeVisible();
  await expect(page.getByText("Dificuldade da carreira")).toBeVisible();
  await page.getByRole("button", { name: "Lenda" }).click();
  await expect(page.getByRole("button", { name: "Lenda" })).toHaveClass(/is-active/);
  await assertNoOverflow(page, "settings 390");
  await context.close();
});
