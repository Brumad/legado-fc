import { test, expect } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/legado-fc/";
test.setTimeout(50_000);

const careerFixture = {
  id: "visual-054",
  name: "Alex Visual",
  age: 20,
  position: "Meia",
  shirtNumber: 10,
  countryId: "BR",
  division: 1,
  difficulty: "Profissional",
  matches: 18,
  goals: 7,
  assists: 9,
  rating: 7.3,
  energy: 92,
  morale: 84,
  seasonRound: 8,
  careerSeed: 54054,
  suspensionMatches: 0,
  injuryMatchesRemaining: 0,
  injuryStatus: "",
};

const settings = {
  matchSpeed: "2x",
  matchDuration: "short",
  mobileControlSize: "medium",
  mobileControlOpacity: 0.75,
  mobileControlsSide: "standard",
  reducedMotion: true,
  compactHud: false,
  highContrast: false,
  commentary: true,
  developerMode: false,
};

async function openMatch(page) {
  await page.addInitScript(({ career, settings }) => {
    localStorage.setItem("legado-fc-career-slots-v1", JSON.stringify([career, null, null]));
    localStorage.setItem("legado-fc-settings-v1", JSON.stringify(settings));
  }, { career: careerFixture, settings });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /CONTINUAR CARREIRA/i }).first().click();
  await page.locator(".hub-play-button").click();
  await expect(page.locator("[data-playable-match-screen]")).toBeVisible();
  await expect(page.locator("[data-playable-canvas]")).toBeVisible();
}

async function canvasColorStats(page) {
  return page.locator(".playable-match-canvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const pixels = context.getImageData(0, 0, width, height).data;
    const colors = new Set();
    let opaque = 0;
    const stride = Math.max(4, Math.floor((width * height) / 8000)) * 4;
    for (let index = 0; index < pixels.length; index += stride) {
      const alpha = pixels[index + 3];
      if (alpha > 20) opaque += 1;
      colors.add(
        Math.floor(pixels[index] / 24) + ":" +
        Math.floor(pixels[index + 1] / 24) + ":" +
        Math.floor(pixels[index + 2] / 24) + ":" +
        Math.floor(alpha / 40)
      );
    }
    return { colors: colors.size, opaque };
  });
}

test("0.5.4 camera quality and effects change presentation without resetting gameplay", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await openMatch(page);

  const screen = page.locator("[data-playable-match-screen]");
  const canvas = page.locator("[data-playable-canvas]");
  await page.locator(".playable-match-canvas").click();

  const initialX = Number(await screen.getAttribute("data-player-x"));
  await page.keyboard.down("d");
  await page.waitForTimeout(700);
  await page.keyboard.up("d");
  await page.waitForTimeout(120);
  const movedX = Number(await screen.getAttribute("data-player-x"));
  expect(movedX).toBeGreaterThan(initialX);

  await page.locator(".playable-visual-settings").getByRole("button", { name: "TV" }).click();
  await expect(canvas).toHaveAttribute("data-camera-mode", "broadcast");
  const afterCameraX = Number(await screen.getAttribute("data-player-x"));
  expect(Math.abs(afterCameraX - initialX)).toBeGreaterThan(0.05);

  await page.locator(".playable-visual-settings").getByRole("button", { name: "BAIXA" }).click();
  await expect(canvas).toHaveAttribute("data-visual-quality", "low");

  await page.locator(".playable-visual-settings").getByRole("button", { name: /EFEITOS ON/ }).click();
  await expect(canvas).toHaveAttribute("data-visual-effects", "off");

  const xBeforeSecondMove = Number(await screen.getAttribute("data-player-x"));
  await page.keyboard.down("d");
  await page.waitForTimeout(450);
  await page.keyboard.up("d");
  await page.waitForTimeout(100);
  const xAfterSecondMove = Number(await screen.getAttribute("data-player-x"));
  expect(xAfterSecondMove).toBeGreaterThan(xBeforeSecondMove);

  const stats = await canvasColorStats(page);
  expect(stats.colors).toBeGreaterThan(12);
  expect(stats.opaque).toBeGreaterThan(100);

  await expect(page.locator(".playable-arcade-hud")).toBeVisible();
  await expect(page.getByText("Alex Visual")).toBeVisible();
  await context.close();
});

test("0.5.4 mobile keeps retro HUD camera controls ball and pitch legible", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await openMatch(page);

  const screen = page.locator("[data-playable-match-screen]");
  const quick = page.locator(".playable-mobile-view-controls");
  const canvas = page.locator("[data-playable-canvas]");
  await expect(quick).toBeVisible();
  await expect(page.locator(".playable-arcade-hud")).toBeVisible();
  await expect(page.locator(".playable-joystick")).toBeVisible();

  await quick.getByRole("button", { name: /CAM SEGUIR/ }).click();
  await expect(screen).toHaveAttribute("data-camera-mode", "broadcast");
  await expect(canvas).toHaveAttribute("data-camera-mode", "broadcast");

  await quick.getByRole("button", { name: /FX ON/ }).click();
  await expect(canvas).toHaveAttribute("data-visual-effects", "off");

  const overflow = await page.evaluate(() => ({
    width: innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(overflow.html).toBeLessThanOrEqual(overflow.width + 1);
  expect(overflow.body).toBeLessThanOrEqual(overflow.width + 1);

  const stats = await canvasColorStats(page);
  expect(stats.colors).toBeGreaterThan(10);
  expect(stats.opaque).toBeGreaterThan(70);
  await context.close();
});

test("0.5.4 replay setting remains presentation-only and toggleable", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await openMatch(page);

  const canvas = page.locator("[data-playable-canvas]");
  await expect(canvas).toHaveAttribute("data-replay-enabled", "yes");
  const replayButton = page.locator(".playable-visual-settings").getByRole("button", { name: /REPLAY ON/ });
  await replayButton.click();
  await expect(canvas).toHaveAttribute("data-replay-enabled", "no");
  await expect(page.locator("[data-playable-match-screen]")).toHaveAttribute("data-replay-active", "no");
  await context.close();
});
