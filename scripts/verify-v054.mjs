import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMatchCoreState } from "../app/match-core/state.ts";
import {
  createMatchCamera,
  createFollowCamera,
  DEFAULT_MATCH_PRESENTATION,
  DEFAULT_MATCH_RENDER_THEME,
} from "../app/match-core/renderer.ts";

function player(id, side, x, y, controlled = false) {
  return {
    id,
    side,
    role: "MEI",
    controlled,
    active: true,
    position: { x, y },
    homePosition: { x, y },
    velocity: { x: 0, y: 0 },
    stamina: 100,
  };
}

const state = createMatchCoreState({
  matchId: "visual-054",
  players: [
    player("career", "home", 50, 34, true),
    player("mate", "home", 34, 22),
    player("opponent", "away", 68, 40),
  ],
});
const before = JSON.stringify(state);
const viewport = { width: 1280, height: 720, padding: 12 };

const follow = createMatchCamera(state, viewport, "follow");
const broadcast = createMatchCamera(state, viewport, "broadcast");
const wide = createMatchCamera(state, viewport, "wide");
const legacyFollow = createFollowCamera(state, viewport);

assert.equal(JSON.stringify(state), before, "câmeras visuais não podem mutar Match Core");
assert.deepEqual(legacyFollow, follow, "createFollowCamera deve manter compatibilidade");
assert.ok(follow.worldWidth < broadcast.worldWidth, "câmera TV deve abrir mais que seguir");
assert.ok(broadcast.worldWidth < wide.worldWidth, "câmera aberta deve mostrar mais campo que TV");
assert.equal(DEFAULT_MATCH_PRESENTATION.quality, "high");
assert.equal(DEFAULT_MATCH_PRESENTATION.effects, true);
assert.equal(DEFAULT_MATCH_RENDER_THEME.controlledPlayer, "#d4ff63");

const [renderer, canvas, screen, css, simulation] = await Promise.all([
  readFile(new URL("../app/match-core/renderer.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/playable-match-canvas.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/playable-match-screen.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../app/match-core/simulation.ts", import.meta.url), "utf8"),
]);

for (const symbol of [
  "drawRetroPlayer",
  "drawRetroBall",
  "drawStadium",
  "drawGoalEffect",
  "recentPlayerEvent",
]) {
  assert.match(renderer, new RegExp(symbol), "renderer precisa conter " + symbol);
}
assert.doesNotMatch(renderer, /from "\.\/simulation\.ts"/, "renderer não pode depender da simulação");
assert.doesNotMatch(renderer, /from "\.\/actions\.ts"/, "renderer não pode depender das ações");
assert.doesNotMatch(simulation, /MatchVisualQuality|MatchCameraMode|drawRetroPlayer|drawGoalEffect/, "simulação não pode importar apresentação");

assert.match(canvas, /replayActiveRef/);
assert.match(canvas, /historyRef/);
assert.match(canvas, /data-camera-mode/);
assert.match(canvas, /data-visual-quality/);
assert.match(canvas, /data-visual-effects/);
assert.match(canvas, /\[autoStart, config, initialState\]/, "controles visuais não devem recriar o runtime");
assert.doesNotMatch(canvas, /\[autoStart, cameraMode/, "câmera não pode ser dependência de reinicialização do runtime");

assert.match(screen, /playable-arcade-hud/);
assert.match(screen, /playable-mobile-view-controls/);
assert.match(screen, /REPLAY \{replayEnabled \? "ON" : "OFF"\}/);
assert.match(screen, /"follow","broadcast","wide"/);
assert.match(screen, /"low","medium","high"/);

assert.match(css, /playable-arcade-hud/);
assert.match(css, /playable-mobile-view-controls/);
assert.match(css, /max-width:\s*760px/);

console.log(JSON.stringify({
  version: "0.5.4",
  originalProceduralSprites: true,
  cameraModes: ["follow", "broadcast", "wide"],
  visualQuality: ["low", "medium", "high"],
  effectsToggle: true,
  crowd: true,
  replay: true,
  arcadeHud: true,
  simulationDecoupled: true,
}));
