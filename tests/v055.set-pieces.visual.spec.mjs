import { chromium, expect, test } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/legado-fc/";
test.setTimeout(55_000);

const careerFixture = {
  id: "set-piece-055",
  name: "Alex Curva",
  age: 21,
  position: "Meia",
  shirtNumber: 10,
  countryId: "BR",
  division: 1,
  difficulty: "Profissional",
  matches: 23,
  goals: 9,
  assists: 11,
  rating: 7.5,
  energy: 91,
  morale: 86,
  seasonRound: 8,
  careerSeed: 55055,
  suspensionMatches: 0,
  injuryMatchesRemaining: 0,
  injuryStatus: "",
  foot: "Direito",
  skinTone: "#b97850",
  hairColor: "#171917",
};

const settings = {
  matchSpeed: "3x",
  matchDuration: "short",
  mobileControlSize: "medium",
  mobileControlOpacity: 0.75,
  mobileControlsSide: "standard",
  reducedMotion: true,
  compactHud: false,
  highContrast: false,
  commentary: true,
  developerMode: true,
};

async function launchBrowser() {
  return chromium.launch({
    headless: true,
    args: [
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
}

async function openMatch(page, { disableWebGL = false, mockGamepad = false } = {}) {
  await page.addInitScript(({ career, settings, disableWebGL, mockGamepad }) => {
    localStorage.setItem("legado-fc-career-slots-v1", JSON.stringify([career, null, null]));
    localStorage.setItem("legado-fc-settings-v1", JSON.stringify(settings));

    if (disableWebGL) {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
        return original.call(this, type, ...args);
      };
    }

    if (mockGamepad) {
      window.__legadoTestPad = {
        axes: [0, 0, 0, 0],
        buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
      };
      Object.defineProperty(navigator, "getGamepads", {
        configurable: true,
        value: () => [window.__legadoTestPad],
      });
    }
  }, { career: careerFixture, settings, disableWebGL, mockGamepad });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /CONTINUAR CARREIRA/i }).first().click();
  await expect(page.locator(".career-hub-v051")).toBeVisible();
  await page.locator(".hub-play-button").click();
  await expect(page.locator("[data-playable-match-screen]")).toBeVisible();
  await expect(page.locator("[data-playable-canvas]")).toBeVisible();
}

async function triggerDeveloperSetPiece(page, label, kind) {
  const button = page.locator(".playable-set-piece-dev button", { hasText: label });
  await button.evaluate((element) => element.click());
  const screen = page.locator("[data-playable-match-screen]");
  await expect(screen).toHaveAttribute("data-set-piece-3d-active", "yes");
  const setPiece = page.locator("[data-set-piece-3d]");
  await expect(setPiece).toBeVisible();
  await expect(setPiece).toHaveAttribute("data-set-piece-kind", kind);
  return setPiece;
}

async function expectReturnedTo2D(page) {
  const screen = page.locator("[data-playable-match-screen]");
  await expect(screen).toHaveAttribute("data-set-piece-3d-active", "no", { timeout: 14_000 });
  await expect(page.locator("[data-playable-canvas]")).toBeVisible();
  const outcome = await screen.getAttribute("data-last-set-piece-outcome");
  expect(outcome).toMatch(/goal|saved|blocked|wide|cleared|rebound|cross-complete/);
  return outcome;
}

test("0.5.5 direct free kick uses real WebGL mouse gesture and returns to the same 2D match", async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1366, height: 820 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await openMatch(page);

  const match = page.locator("[data-playable-match-screen]");
  const minuteBefore = Number(await match.getAttribute("data-match-minute"));
  const setPiece = await triggerDeveloperSetPiece(page, "TESTAR FALTA 3D", "free-kick-direct");
  await expect(setPiece).toHaveAttribute("data-webgl", "webgl", { timeout: 12_000 });

  const webglCanvas = page.locator(".set-piece-3d-mount canvas");
  await expect(webglCanvas).toBeVisible();
  const dimensions = await webglCanvas.evaluate((canvas) => ({ width: canvas.width, height: canvas.height }));
  expect(dimensions.width).toBeGreaterThan(200);
  expect(dimensions.height).toBeGreaterThan(120);

  const mount = page.locator(".set-piece-3d-mount");
  const box = await mount.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box.x + box.width * 0.46, box.y + box.height * 0.82);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.50, box.y + box.height * 0.61, { steps: 4 });
  await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.31, { steps: 5 });
  await page.mouse.up();

  expect(Number(await setPiece.getAttribute("data-gesture-power"))).toBeGreaterThan(0.35);
  expect(Number(await setPiece.getAttribute("data-gesture-height"))).toBeGreaterThan(0.25);
  await expectReturnedTo2D(page);

  const minuteAfter = Number(await match.getAttribute("data-match-minute"));
  expect(minuteAfter).toBeGreaterThanOrEqual(minuteBefore);
  await context.close();
  await browser.close();
});

test("0.5.5 corner accepts curved touch gesture on mobile and returns to 2D", async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await openMatch(page);

  const setPiece = await triggerDeveloperSetPiece(page, "TESTAR ESCANTEIO 3D", "corner");
  await expect(setPiece).toHaveAttribute("data-webgl", "webgl", { timeout: 12_000 });
  const mount = page.locator(".set-piece-3d-mount");
  await expect(mount).toBeVisible();

  await mount.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const events = [
      ["pointerdown", 0.30, 0.82, 1],
      ["pointermove", 0.40, 0.62, 1],
      ["pointermove", 0.58, 0.40, 1],
      ["pointerup", 0.63, 0.22, 0],
    ];
    for (const [type, x, y, buttons] of events) {
      element.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        pointerId: 77,
        pointerType: "touch",
        isPrimary: true,
        button: 0,
        buttons,
        clientX: rect.left + rect.width * x,
        clientY: rect.top + rect.height * y,
      }));
    }
  });

  expect(Number(await setPiece.getAttribute("data-gesture-power"))).toBeGreaterThan(0.35);
  expect(Math.abs(Number(await setPiece.getAttribute("data-gesture-curve")))).toBeGreaterThan(0.1);
  await expectReturnedTo2D(page);

  const overflow = await page.evaluate(() => ({
    width: innerWidth,
    html: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(overflow.html).toBeLessThanOrEqual(overflow.width + 1);
  expect(overflow.body).toBeLessThanOrEqual(overflow.width + 1);
  await context.close();
  await browser.close();
});

test("0.5.5 lifted free kick is controllable by gamepad input", async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await openMatch(page, { mockGamepad: true });

  const setPiece = await triggerDeveloperSetPiece(page, "TESTAR CRUZAMENTO 3D", "free-kick-cross");
  await expect(setPiece).toHaveAttribute("data-webgl", "webgl", { timeout: 12_000 });

  await page.evaluate(() => {
    window.__legadoTestPad.axes = [0.42, -0.55, 0.68, 0];
    window.__legadoTestPad.buttons[7] = { pressed: true, value: 0.92 };
  });
  await expect.poll(async () => Number(await setPiece.getAttribute("data-gesture-power"))).toBeGreaterThan(0.85);
  await expect.poll(async () => Math.abs(Number(await setPiece.getAttribute("data-gesture-curve")))).toBeGreaterThan(0.5);

  await page.evaluate(() => {
    window.__legadoTestPad.buttons[0] = { pressed: true, value: 1 };
  });
  await page.waitForTimeout(120);
  await page.evaluate(() => {
    window.__legadoTestPad.buttons[0] = { pressed: false, value: 0 };
  });

  await expectReturnedTo2D(page);
  await context.close();
  await browser.close();
});

test("0.5.5 WebGL-disabled browser returns to the same traditional 2D restart without reopening 3D", async () => {
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await openMatch(page, { disableWebGL: true });

  const match = page.locator("[data-playable-match-screen]");
  const minuteBefore = Number(await match.getAttribute("data-match-minute"));
  const setPiece = await triggerDeveloperSetPiece(page, "TESTAR FALTA 3D", "free-kick-direct");
  await expect(setPiece).toHaveAttribute("data-webgl", "fallback", { timeout: 8_000 });
  await expect(page.getByText("WEBGL INDISPONÍVEL")).toBeVisible();
  await page.getByRole("button", { name: "VOLTAR AO 2D" }).click();

  await expect(match).toHaveAttribute("data-set-piece-3d-active", "no");
  await expect(match).toHaveAttribute("data-last-set-piece-outcome", "fallback-2d");
  await expect(page.locator("[data-playable-canvas]")).toBeVisible();
  await page.waitForTimeout(1200);
  await expect(match).toHaveAttribute("data-set-piece-3d-active", "no");
  const minuteAfter = Number(await match.getAttribute("data-match-minute"));
  expect(minuteAfter).toBeGreaterThanOrEqual(minuteBefore);

  await context.close();
  await browser.close();
});
