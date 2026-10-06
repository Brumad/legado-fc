import assert from "node:assert/strict";
import {
  DEFAULT_MATCH_CORE_CONFIG,
  FixedStepMatchRuntime,
  createMatchCoreState,
  gamepadInputFromAxes,
  keyboardInputFromKeys,
  normalizeMatchInput,
  startSecondHalf,
  touchInputFromVector,
  validateMatchCoreState,
} from "../app/match-core/index.ts";

const testConfig = {
  ...DEFAULT_MATCH_CORE_CONFIG,
  halfDurationSeconds: 2,
  maxCatchUpSteps: 24,
};

function createRuntime(id) {
  const state = createMatchCoreState({
    matchId: id,
    players: [{
      id: "career-player",
      side: "home",
      role: "MEI",
      controlled: true,
      active: true,
      position: { x: 52.5, y: 34 },
      velocity: { x: 0, y: 0 },
      stamina: 100,
    }],
  });
  return new FixedStepMatchRuntime(state, testConfig);
}

const normalized = normalizeMatchInput({ moveX: 5, moveY: 5 });
assert.ok(Math.hypot(normalized.moveX, normalized.moveY) <= 1.000001);
assert.equal(keyboardInputFromKeys(new Set(["KeyD", "ShiftLeft", "KeyL"])).shoot, true);
assert.equal(touchInputFromVector(-2, 0).moveX, -1);
assert.equal(gamepadInputFromAxes(0.05, 0.05).moveX, 0);

const sixtyFps = createRuntime("determinism-60");
sixtyFps.setInput({ moveX: 1, sprint: true });
sixtyFps.start();
for (let frame = 0; frame < 60; frame += 1) sixtyFps.advanceFrame(1 / 60);

const thirtyFps = createRuntime("determinism-30");
thirtyFps.setInput({ moveX: 1, sprint: true });
thirtyFps.start();
for (let frame = 0; frame < 30; frame += 1) thirtyFps.advanceFrame(1 / 30);

assert.equal(sixtyFps.state.tick, 60);
assert.equal(thirtyFps.state.tick, 60);
assert.ok(Math.abs(sixtyFps.state.players[0].position.x - thirtyFps.state.players[0].position.x) < 1e-9);
assert.ok(sixtyFps.state.players[0].position.x > 52.5);
assert.ok(sixtyFps.state.players[0].stamina < 100);

const pausedTick = sixtyFps.state.tick;
sixtyFps.pause();
sixtyFps.advanceFrame(0.2);
assert.equal(sixtyFps.state.tick, pausedTick);
sixtyFps.resume();

const lifecycle = createRuntime("lifecycle");
lifecycle.start();
for (let frame = 0; frame < 120; frame += 1) lifecycle.advanceFrame(1 / 60);
assert.equal(lifecycle.state.clock.phase, "half-time");
assert.equal(lifecycle.state.clock.running, false);
assert.ok(lifecycle.state.events.some((event) => event.type === "half-time"));

lifecycle.state = startSecondHalf(lifecycle.state);
assert.equal(lifecycle.state.clock.phase, "second-half");
for (let frame = 0; frame < 120; frame += 1) lifecycle.advanceFrame(1 / 60);
assert.equal(lifecycle.state.clock.phase, "finished");
assert.equal(lifecycle.state.finished, true);
assert.ok(lifecycle.state.events.some((event) => event.type === "full-time"));

const validation = validateMatchCoreState(lifecycle.state);
assert.equal(validation.valid, true, validation.errors.join("; "));
assert.equal(lifecycle.state.clock.matchSeconds, 4);
assert.equal(lifecycle.state.tick, 240);

const invalid = createMatchCoreState({
  matchId: "invalid",
  players: [{
    id: "bad",
    side: "home",
    role: "ATA",
    controlled: true,
    active: true,
    position: { x: Number.NaN, y: 10 },
    velocity: { x: 0, y: 0 },
    stamina: 100,
  }],
});
assert.equal(validateMatchCoreState(invalid).valid, false);

console.log(JSON.stringify({
  fixedDeltaSeconds: testConfig.fixedDeltaSeconds,
  deterministicTicks: lifecycle.state.tick,
  lifecycle: lifecycle.state.events.map((event) => event.type),
  finalPhase: lifecycle.state.clock.phase,
  finiteStateValidation: validation.valid,
}));
