import assert from "node:assert/strict";
import {
  DEFAULT_MATCH_CORE_CONFIG,
  createMatchCoreState,
  validateMatchCoreState,
} from "../app/match-core/index.ts";
import {
  DEFAULT_SET_PIECE_CONFIG,
  SetPieceRuntime,
  applySetPieceResultToMatch,
  createSetPieceContextFromMatch,
  finiteVector3,
  gestureFromPointerPath,
  simulateSetPiece,
} from "../app/set-piece-3d/index.ts";

function ratings(overrides = {}) {
  return {
    pace: 72,
    shooting: 84,
    passing: 82,
    dribbling: 86,
    defending: 65,
    physical: 78,
    goalkeeping: 20,
    ...overrides,
  };
}

function player(id, side, x, y, options = {}) {
  return {
    id,
    side,
    role: options.role ?? "MEI",
    controlled: options.controlled ?? false,
    active: true,
    position: { x, y },
    homePosition: { x, y },
    velocity: { x: 0, y: 0 },
    stamina: options.stamina ?? 88,
    ratings: ratings(options.ratings),
    yellowCards: options.yellowCards ?? 0,
    redCard: false,
    injured: false,
    injurySeverity: "",
    substituted: false,
  };
}

function basePlayers() {
  return [
    player("career", "home", 80, 34, { controlled: true, ratings: { shooting: 94, passing: 92, dribbling: 90, physical: 86 }, stamina: 73, yellowCards: 1 }),
    player("h2", "home", 91, 25, { role: "ATA" }),
    player("h3", "home", 92, 34, { role: "ATA" }),
    player("h4", "home", 90, 43, { role: "ATA" }),
    player("h5", "home", 73, 18),
    player("h6", "home", 74, 50),
    player("h7", "home", 62, 22),
    player("h8", "home", 62, 46),
    player("h9", "home", 50, 12),
    player("h10", "home", 50, 56),
    player("h11", "home", 6, 34, { role: "GOL", ratings: { goalkeeping: 82 } }),
    player("gk", "away", 103, 34, { role: "GOL", ratings: { goalkeeping: 78 } }),
    player("a2", "away", 94, 31, { role: "ZAG", ratings: { defending: 82, physical: 84 } }),
    player("a3", "away", 94, 33, { role: "ZAG", ratings: { defending: 80, physical: 82 } }),
    player("a4", "away", 94, 35, { role: "ZAG", ratings: { defending: 79, physical: 80 } }),
    player("a5", "away", 94, 37, { role: "ZAG", ratings: { defending: 78, physical: 80 } }),
    player("a6", "away", 94, 39, { role: "ZAG", ratings: { defending: 77, physical: 79 } }),
    player("a7", "away", 88, 20),
    player("a8", "away", 88, 48),
    player("a9", "away", 78, 18),
    player("a10", "away", 78, 50),
    player("a11", "away", 70, 34),
  ];
}

function stateWithRestart(type, position, side = "home") {
  let state = createMatchCoreState({
    matchId: "set-piece-055-" + type + "-" + position.x + "-" + position.y,
    players: basePlayers(),
  });
  state = {
    ...state,
    tick: 4200,
    clock: {
      ...state.clock,
      phase: "first-half",
      running: true,
      matchSeconds: 34 * 60 + 12,
      periodSeconds: 34 * 60 + 12,
      minute: 34,
      second: 12,
    },
    score: { home: 1, away: 1 },
    restart: {
      type,
      side,
      position: { ...position },
      ticksRemaining: 50,
      label: type === "corner" ? "Escanteio" : "Falta",
    },
    ball: {
      ...state.ball,
      position: { ...position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      lastTouchPlayerId: "a2",
      lastTouchSide: "away",
    },
  };
  return state;
}

// Gesture mapping is usable by pointer/mouse/touch and exposes curve from path shape.
{
  const straight = gestureFromPointerPath([{ x: 100, y: 300 }, { x: 100, y: 200 }, { x: 100, y: 100 }], 390, 844);
  const curved = gestureFromPointerPath([{ x: 100, y: 300 }, { x: 150, y: 205 }, { x: 110, y: 100 }], 390, 844);
  assert.ok(straight.power > 0.6);
  assert.ok(straight.aimY > 0);
  assert.ok(Math.abs(straight.curve) < 0.05);
  assert.ok(curved.curve > 0.25);
}

// Direct free kick originates exactly at the 2D restart and creates a real wall.
const directState = stateWithRestart("free-kick", { x: 80, y: 34 });
const directContext = createSetPieceContextFromMatch(directState, "career", "Direito");
assert.ok(directContext);
assert.equal(directContext.kind, "free-kick-direct");
assert.deepEqual(directContext.origin2D, { x: 80, y: 34 });
assert.equal(directContext.origin.x, 80);
assert.equal(directContext.origin.z, 34);
assert.ok(directContext.wall.length >= 2 && directContext.wall.length <= 5);
assert.equal(directContext.goalX, 105);

// Low central strike interacts with the wall instead of teleporting to an outcome.
{
  const result = simulateSetPiece(directContext, { aimX: 0, aimY: 0.08, power: 0.78, curve: 0 });
  assert.equal(result.result?.blocked, true, "low central direct free kick should be blockable by the wall");
  assert.ok(result.samples.length > 2);
  assert.ok(result.samples.every(finiteVector3));
}

// Height, power and curve alter the measured path.
{
  const low = simulateSetPiece(directContext, { aimX: 0.38, aimY: 0.25, power: 0.55, curve: 0 });
  const high = simulateSetPiece(directContext, { aimX: 0.38, aimY: 0.92, power: 1, curve: 0 });
  const bendLeft = simulateSetPiece(directContext, { aimX: 0.55, aimY: 0.75, power: 0.92, curve: -0.9 });
  const bendRight = simulateSetPiece(directContext, { aimX: 0.55, aimY: 0.75, power: 0.92, curve: 0.9 });
  const maxY = (runtime) => Math.max(...runtime.samples.map((sample) => sample.y));
  assert.ok(maxY(high) > maxY(low) + 0.15, "aimY must increase trajectory height");
  const lowTravel = Math.hypot(low.ball.position.x - directContext.origin.x, low.ball.position.z - directContext.origin.z);
  const highTravel = Math.hypot(high.ball.position.x - directContext.origin.x, high.ball.position.z - directContext.origin.z);
  assert.ok(highTravel >= lowTravel * 0.8, "power should not reduce useful travel");
  const leftZ = bendLeft.samples[Math.min(bendLeft.samples.length - 1, 15)]?.z ?? bendLeft.ball.position.z;
  const rightZ = bendRight.samples[Math.min(bendRight.samples.length - 1, 15)]?.z ?? bendRight.ball.position.z;
  assert.ok(Math.abs(leftZ - rightZ) > 0.01, "opposite spin must bend trajectories differently");
}

// Goalkeeper physically follows the trajectory after reaction delay.
{
  const runtime = new SetPieceRuntime(directContext, { aimX: 0.8, aimY: 0.78, power: 0.9, curve: 0.2 });
  const initialZ = runtime.state.keeper.position.z;
  for (let index = 0; index < 220 && runtime.state.phase !== "resolved"; index += 1) runtime.step();
  assert.notEqual(runtime.state.keeper.position.z, initialZ, "keeper must react toward the live trajectory");
}

// Crossed free kick is classified from real position.
{
  const crossState = stateWithRestart("free-kick", { x: 68, y: 8 });
  const cross = createSetPieceContextFromMatch(crossState, "career", "Esquerdo");
  assert.ok(cross);
  assert.equal(cross.kind, "free-kick-cross");
  const result = simulateSetPiece(cross, { aimX: 0.1, aimY: 0.7, power: 0.82, curve: -0.35 });
  assert.ok(result.result);
  assert.ok(result.samples.every(finiteVector3));
}

// Corner preserves the exact corner side and can resolve through an aerial duel/rebound.
{
  const cornerState = stateWithRestart("corner", { x: 105, y: 0 });
  const corner = createSetPieceContextFromMatch(cornerState, "career", "Direito");
  assert.ok(corner);
  assert.equal(corner.kind, "corner");
  assert.equal(corner.cornerSide, "top");
  assert.deepEqual(corner.origin2D, { x: 105, y: 0 });
  const result = simulateSetPiece(corner, { aimX: 0.1, aimY: 0.72, power: 0.86, curve: 0.45 });
  assert.ok(result.result);
  assert.ok(["goal","saved","cleared","rebound","cross-complete","wide","blocked"].includes(result.result.outcome));
  assert.ok(result.samples.length > 2);
}

// Applying a 3D goal back into the 2D core preserves clock/cards/stamina and increments only the score.
{
  const beforeMatchSeconds = directState.clock.matchSeconds;
  const beforePeriodSeconds = directState.clock.periodSeconds;
  const beforeAddedTime = directState.clock.addedTimeSeconds;
  const beforePlayer = directState.players.find((item) => item.id === "career");
  const syntheticGoal = {
    kind: "free-kick-direct",
    outcome: "goal",
    attackingSide: "home",
    defendingSide: "away",
    takerId: "career",
    keeperId: "gk",
    endPosition: { x: 105, y: 1.2, z: 34 },
    endPosition2D: { x: 105, y: 34 },
    endVelocity2D: { x: 22, y: 0 },
    goal: true,
    saved: false,
    blocked: false,
    elapsed: 1.2,
  };
  const after = applySetPieceResultToMatch(directState, syntheticGoal, DEFAULT_MATCH_CORE_CONFIG);
  assert.equal(after.score.home, directState.score.home + 1);
  assert.equal(after.score.away, directState.score.away);
  assert.equal(after.clock.matchSeconds, beforeMatchSeconds);
  assert.equal(after.clock.periodSeconds, beforePeriodSeconds);
  assert.ok(after.clock.addedTimeSeconds >= beforeAddedTime, "stoppage time may grow but live clock cannot jump");
  assert.equal(after.players.find((item) => item.id === "career")?.yellowCards, beforePlayer?.yellowCards);
  assert.equal(after.players.find((item) => item.id === "career")?.stamina, beforePlayer?.stamina);
  assert.equal(after.restart?.type, "kickoff");
  assert.ok(after.events.some((event) => event.type === "set-piece-3d"));
  assert.equal(validateMatchCoreState(after).valid, true);
}

// Defensive wall/clearance touch must return to 2D with the defender as the real last touch.
{
  const blocked = {
    kind: "free-kick-direct",
    outcome: "blocked",
    attackingSide: "home",
    defendingSide: "away",
    takerId: "career",
    receiverId: "a2",
    keeperId: "gk",
    endPosition: { x: 92.5, y: 1.4, z: 31 },
    endPosition2D: { x: 92.5, y: 31 },
    endVelocity2D: { x: -4.5, y: 1.2 },
    goal: false,
    saved: false,
    blocked: true,
    elapsed: 0.62,
  };
  const after = applySetPieceResultToMatch(directState, blocked, DEFAULT_MATCH_CORE_CONFIG);
  assert.equal(after.ball.lastTouchPlayerId, "a2");
  assert.equal(after.ball.lastTouchSide, "away");
  assert.equal(after.score.home, directState.score.home);
  assert.equal(after.clock.matchSeconds, directState.clock.matchSeconds);
}

// Saved shot returns possession to the actual goalkeeper without changing score/time.
{
  const beforeScore = JSON.stringify(directState.score);
  const saved = {
    kind: "free-kick-direct",
    outcome: "saved",
    attackingSide: "home",
    defendingSide: "away",
    takerId: "career",
    keeperId: "gk",
    endPosition: { x: 104.7, y: 1, z: 35 },
    endPosition2D: { x: 104.7, y: 35 },
    endVelocity2D: { x: 0, y: 0 },
    goal: false,
    saved: true,
    blocked: false,
    elapsed: 1.4,
  };
  const after = applySetPieceResultToMatch(directState, saved, DEFAULT_MATCH_CORE_CONFIG);
  assert.equal(JSON.stringify(after.score), beforeScore);
  assert.equal(after.clock.matchSeconds, directState.clock.matchSeconds);
  assert.equal(after.ball.possessionPlayerId, "gk");
  assert.equal(after.restart, null);
}

// Stress: many gestures must resolve and remain finite without WebGL.
{
  const contexts = [
    directContext,
    createSetPieceContextFromMatch(stateWithRestart("free-kick", { x: 71, y: 16 }), "career", "Direito"),
    createSetPieceContextFromMatch(stateWithRestart("corner", { x: 105, y: 68 }), "career", "Direito"),
  ].filter(Boolean);
  let resolved = 0;
  for (let index = 0; index < 180; index += 1) {
    const context = contexts[index % contexts.length];
    const curve = ((index % 13) - 6) / 6;
    const runtime = simulateSetPiece(context, {
      aimX: ((index % 17) - 8) / 8,
      aimY: 0.15 + (index % 9) / 11,
      power: 0.42 + (index % 8) / 14,
      curve,
    }, DEFAULT_SET_PIECE_CONFIG);
    assert.ok(runtime.result, "set piece " + index + " must resolve");
    assert.ok(finiteVector3(runtime.ball.position));
    assert.ok(finiteVector3(runtime.ball.velocity));
    resolved += 1;
  }
  assert.equal(resolved, 180);
}

console.log(JSON.stringify({
  version: "0.5.5",
  headlessSetPieces: 180,
  directFreeKick: true,
  liftedFreeKick: true,
  corner: true,
  wall: true,
  reactiveGoalkeeper: true,
  curveHeightPower: true,
  twoWayBridge: true,
  fallbackReady: true,
}));
