import { test, expect } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/legado-fc/";
test.setTimeout(45_000);

const careerFixture = {
  id: "playable-052",
  name: "Alex Campo",
  age: 20,
  position: "Meia",
  matches: 18,
  goals: 7,
  assists: 9,
  rating: 7.3,
  energy: 92,
  morale: 84,
  formBoost: 4,
  reputation: 52,
  bankBalance: 420000,
  salary: 48000,
  coachTrust: 81,
  squadRelations: 74,
  familyBond: 70,
  season: 1,
  seasonRound: 8,
  preparationActionsAllowed: 3,
  preparationActionsUsed: 1,
  preparationLog: ["Fundamentos"],
  suspensionMatches: 0,
  injuryMatchesRemaining: 0,
  injuryStatus: "",
};

const testSettings = {
  matchSpeed: "3x",
  reducedMotion: true,
  compactHud: false,
  highContrast: false,
  commentary: true,
  developerMode: true,
};

async function openPlayableMatch(page) {
  await page.addInitScript(({ career, settings }) => {
    localStorage.setItem("legado-fc-career-slots-v1", JSON.stringify([career, null, null]));
    localStorage.setItem("legado-fc-settings-v1", JSON.stringify(settings));
  }, { career: careerFixture, settings: testSettings });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /CONTINUAR CARREIRA/i }).first().click();
  await expect(page.locator(".career-hub-v051")).toBeVisible();
  await page.locator(".hub-play-button").click();
  await expect(page.locator("[data-playable-match-screen]")).toBeVisible();
  await expect(page.locator("[data-playable-canvas]")).toBeVisible();
}

async function finishFastMatch(page) {
  const halfButton = page.getByRole("button", { name: "INICIAR 2º TEMPO" });
  await expect(halfButton).toBeVisible({ timeout: 12_000 });
  await halfButton.click();
  const resultButton = page.getByRole("button", { name: "VER RESULTADO" });
  await expect(resultButton).toBeVisible({ timeout: 12_000 });
  await resultButton.click();
  await expect(page.locator(".result-shell-v2")).toBeVisible();
  await expect(page.getByText("Partida 2D jogável", { exact: false })).toBeVisible();
}

test("keyboard plays, pauses and completes a full 2D match", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await openPlayableMatch(page);

  const screen = page.locator("[data-playable-match-screen]");
  const startX = Number(await screen.getAttribute("data-player-x"));
  await page.locator(".playable-match-canvas").click();
  await page.keyboard.down("d");
  await page.keyboard.down("Shift");
  await page.waitForTimeout(550);
  await page.keyboard.up("Shift");
  await page.keyboard.up("d");
  await page.waitForTimeout(200);
  const movedX = Number(await screen.getAttribute("data-player-x"));
  const stamina = Number(await screen.getAttribute("data-player-stamina"));
  expect(movedX).not.toBe(startX);
  expect(stamina).toBeLessThan(100);

  await page.keyboard.press("KeyJ");
  await page.keyboard.press("KeyK");
  await page.keyboard.press("KeyL");

  const pauseButton = page.getByRole("button", { name: "PAUSAR" }).last();
  await pauseButton.click();
  await expect(page.getByText("PARTIDA PAUSADA")).toBeVisible();
  await page.getByRole("button", { name: "CONTINUAR" }).click();

  await finishFastMatch(page);
  await context.close();
});

test("touch controls move the player and complete a full 2D match", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await openPlayableMatch(page);

  const screen = page.locator("[data-playable-match-screen]");
  const startX = Number(await screen.getAttribute("data-player-x"));
  const right = page.locator(".playable-dpad .is-right");
  const sprint = page.locator(".playable-dpad .is-sprint");
  await expect(right).toBeVisible();
  await expect(page.locator(".playable-actions .is-pass")).toBeVisible();
  await expect(page.locator(".playable-actions .is-shoot")).toBeVisible();

  await right.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true, pointerId: 1, pointerType: "touch", isPrimary: true, button: 0, buttons: 1,
  })));
  await sprint.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true, pointerId: 2, pointerType: "touch", isPrimary: false, button: 0, buttons: 1,
  })));
  await page.waitForTimeout(550);
  await right.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true, pointerId: 1, pointerType: "touch", isPrimary: true, button: 0, buttons: 0,
  })));
  await sprint.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true, pointerId: 2, pointerType: "touch", isPrimary: false, button: 0, buttons: 0,
  })));
  await page.waitForTimeout(200);

  const movedX = Number(await screen.getAttribute("data-player-x"));
  expect(movedX).not.toBe(startX);

  await page.locator(".playable-actions .is-pass").tap();
  await page.locator(".playable-actions .is-shoot").tap();

  const overflow = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.width + 1);

  await finishFastMatch(page);
  await context.close();
});

test("legacy quick mode remains available as fallback", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await openPlayableMatch(page);
  await page.getByRole("button", { name: "MODO RÁPIDO" }).last().click();
  await expect(page.locator(".match-shell-v2")).toBeVisible();
  await context.close();
});
