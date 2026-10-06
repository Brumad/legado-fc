import assert from "node:assert/strict";
import {
  DEFAULT_MATCH_CORE_CONFIG,
  FixedStepMatchRuntime,
  claimLooseBall,
  createMatchCoreState,
  createRestartForBoundary,
  evaluateBallBoundary,
  gamepadInputFromAxes,
  keyboardInputFromKeys,
  resolveTackles,
  startSecondHalf,
  stepMatchCore,
  touchInputFromVector,
  validateMatchCoreState,
} from "../app/match-core/index.ts";

function player(id, side, x, y, controlled = false, role = "MEI") {
  return {
    id,
    side,
    role,
    controlled,
    active: true,
    position: { x, y },
    homePosition: { x, y },
    velocity: { x: 0, y: 0 },
    stamina: 100,
  };
}

const baseConfig = {
  ...DEFAULT_MATCH_CORE_CONFIG,
  matchClockRate: 1,
  halfDurationSeconds: 200,
  restartDelayTicks: 1,
  maxCatchUpSteps: 120,
};

// Movement, acceleration, sprint and possession.
{
  const state = createMatchCoreState({
    matchId: "playable-actions",
    players: [
      player("career", "home", 52.5, 34, true),
      player("mate", "home", 66, 34),
      player("opponent", "away", 72, 34),
    ],
  });
  const runtime = new FixedStepMatchRuntime(state, baseConfig);
  runtime.start();
  runtime.setInput({ moveX: 1, sprint: true });
  runtime.advanceFrame(2 / 60);
  assert.equal(runtime.state.restart, null);
  assert.equal(runtime.state.ball.possessionPlayerId, "career");
  const before = runtime.state.players.find((item) => item.id === "career");
  runtime.advanceFrame(10 / 60);
  const after = runtime.state.players.find((item) => item.id === "career");
  assert.ok(after.position.x > before.position.x, "jogador deve se mover");
  assert.ok(after.velocity.x > 0, "aceleração deve produzir velocidade");
  assert.ok(after.stamina < before.stamina, "sprint deve gastar stamina");

  runtime.setInput({ moveX: 1, pass: true });
  runtime.advanceFrame(1 / 60);
  assert.ok(runtime.state.events.some((event) => event.type === "pass"));
  assert.equal(runtime.state.ball.possessionPlayerId, null);
  assert.ok(runtime.state.ball.velocity.x > 0);
}

// Shot must cross the line fully before a goal is awarded.
{
  assert.deepEqual(
    evaluateBallBoundary({ x: 105.05, y: 34 }, { length: 105, width: 68 }, 0.11),
    { kind: "in-play" },
  );
  assert.deepEqual(
    evaluateBallBoundary({ x: 105.2, y: 34 }, { length: 105, width: 68 }, 0.11),
    { kind: "goal", side: "home" },
  );

  let state = createMatchCoreState({
    matchId: "playable-goal",
    players: [
      player("striker", "home", 100, 34, true, "ATA"),
      player("keeper", "away", 104, 34, false, "GOL"),
    ],
  });
  state = {
    ...state,
    clock: { ...state.clock, phase: "first-half", running: true },
    ball: {
      ...state.ball,
      position: { x: 100.7, y: 34 },
      possessionPlayerId: "striker",
      lastTouchPlayerId: "striker",
      lastTouchSide: "home",
    },
  };
  state = stepMatchCore(state, { moveX: 1, shoot: true }, baseConfig);
  assert.ok(state.events.some((event) => event.type === "shot"));
  for (let index = 0; index < 30 && state.score.home === 0; index += 1) {
    state = stepMatchCore(state, {}, baseConfig);
  }
  assert.equal(state.score.home, 1);
  assert.equal(state.restart?.type, "kickoff");
  assert.equal(state.restart?.side, "away");
  assert.equal(state.stats.players.striker.goals, 1);
}

// Boundary restarts.
{
  const state = createMatchCoreState({
    matchId: "restarts",
    players: [player("home", "home", 50, 30, true), player("away", "away", 55, 38)],
  });
  const throwIn = createRestartForBoundary({
    ...state,
    ball: { ...state.ball, position: { x: 43, y: -1 }, lastTouchSide: "home" },
  }, "top", 10);
  assert.equal(throwIn.type, "throw-in");
  assert.equal(throwIn.side, "away");

  const corner = createRestartForBoundary({
    ...state,
    ball: { ...state.ball, position: { x: -1, y: 5 }, lastTouchSide: "home" },
  }, "left", 10);
  assert.equal(corner.type, "corner");
  assert.equal(corner.side, "away");

  const goalKick = createRestartForBoundary({
    ...state,
    ball: { ...state.ball, position: { x: -1, y: 5 }, lastTouchSide: "away" },
  }, "left", 10);
  assert.equal(goalKick.type, "goal-kick");
  assert.equal(goalKick.side, "home");
}

// A failed tackle must be able to generate a real free kick.
{
  const config = { ...baseConfig, tackleRadius: 2 };
  let foulState = null;
  for (let tick = 1; tick < 100 && !foulState; tick += 1) {
    let state = createMatchCoreState({
      matchId: "foul-" + tick,
      players: [
        player("owner", "home", 50, 34, false),
        player("tackler", "away", 50.7, 34, true),
      ],
    });
    state = {
      ...state,
      tick,
      clock: { ...state.clock, phase: "first-half", running: true },
      ball: {
        ...state.ball,
        position: { x: 50, y: 34 },
        possessionPlayerId: "owner",
        lastTouchPlayerId: "owner",
        lastTouchSide: "home",
      },
    };
    const next = resolveTackles(
      state,
      new Map([
        ["owner", keyboardInputFromKeys(new Set())],
        ["tackler", keyboardInputFromKeys(new Set(["Space"]))],
      ]),
      config,
    );
    if (next.events.some((event) => event.type === "foul")) foulState = next;
  }
  assert.ok(foulState, "deve existir um tackle determinístico que gere falta");
  assert.equal(foulState.restart?.type, "free-kick");
  assert.equal(foulState.restart?.side, "home");
}

// Loose-ball reception / first touch.
{
  let state = createMatchCoreState({
    matchId: "first-touch",
    players: [player("receiver", "home", 40, 20, true)],
  });
  state = {
    ...state,
    ball: {
      ...state.ball,
      position: { x: 40.6, y: 20 },
      velocity: { x: 2, y: 0 },
      pickupCooldownTicks: 0,
    },
  };
  state = claimLooseBall(state, baseConfig);
  assert.equal(state.ball.possessionPlayerId, "receiver");
  assert.equal(state.stats.players.receiver.touches, 1);
}

// Input surfaces.
{
  const keyboard = keyboardInputFromKeys(new Set(["KeyW", "KeyD", "ShiftLeft", "KeyJ"]));
  assert.ok(keyboard.moveX > 0 && keyboard.moveY < 0);
  assert.equal(keyboard.sprint, true);
  assert.equal(keyboard.pass, true);

  const touch = touchInputFromVector(-0.8, 0.3, { shoot: true });
  assert.equal(touch.shoot, true);
  assert.ok(touch.moveX < 0);

  const gamepad = gamepadInputFromAxes(0.8, -0.5, { throughBall: true });
  assert.equal(gamepad.throughBall, true);
  assert.ok(gamepad.moveY < 0);
}

// Ten complete 90-minute headless matches without soft lock or invalid coordinates.
{
  const completionConfig = {
    ...DEFAULT_MATCH_CORE_CONFIG,
    matchClockRate: 900,
    restartDelayTicks: 2,
    maxCatchUpSteps: 120,
  };
  for (let match = 0; match < 10; match += 1) {
    const players = [];
    for (let index = 0; index < 11; index += 1) {
      players.push(player("h-" + match + "-" + index, "home", 8 + index * 4.4, 5 + (index % 6) * 10, index === 7));
      players.push(player("a-" + match + "-" + index, "away", 97 - index * 4.4, 5 + (index % 6) * 10));
    }
    const runtime = new FixedStepMatchRuntime(createMatchCoreState({
      matchId: "full-" + match,
      players,
    }), completionConfig);
    runtime.start();

    let guard = 0;
    while (runtime.state.clock.phase === "first-half" && guard < 500) {
      runtime.setInput({
        moveX: match % 2 ? 0.7 : 1,
        moveY: ((guard / 45) % 2) ? 0.3 : -0.25,
        sprint: guard % 30 < 15,
        pass: guard % 97 === 0,
        shoot: guard % 151 === 0,
        tackle: guard % 181 === 0,
      });
      runtime.advanceFrame(1 / 60);
      guard += 1;
      const validation = validateMatchCoreState(runtime.state);
      assert.equal(validation.valid, true, validation.errors.join("; "));
      for (const item of runtime.state.players) {
        assert.ok(item.position.x >= 0 && item.position.x <= runtime.state.pitch.length);
        assert.ok(item.position.y >= 0 && item.position.y <= runtime.state.pitch.width);
      }
    }
    assert.equal(runtime.state.clock.phase, "half-time", "primeiro tempo deve terminar");
    runtime.startSecondHalf();

    guard = 0;
    while (!runtime.state.finished && guard < 500) {
      runtime.setInput({
        moveX: match % 2 ? -0.4 : 0.9,
        moveY: ((guard / 50) % 2) ? -0.35 : 0.2,
        sprint: guard % 40 < 20,
        throughBall: guard % 113 === 0,
        shoot: guard % 137 === 0,
        tackle: guard % 173 === 0,
      });
      runtime.advanceFrame(1 / 60);
      guard += 1;
      const validation = validateMatchCoreState(runtime.state);
      assert.equal(validation.valid, true, validation.errors.join("; "));
    }
    assert.equal(runtime.state.finished, true, "partida deve terminar sem soft lock");
    assert.equal(runtime.state.clock.minute, 90);
    assert.ok(runtime.state.events.some((event) => event.type === "full-time"));
  }
}

console.log(JSON.stringify({
  playableVerticalSliceCore: true,
  movement: true,
  acceleration: true,
  sprintAndStamina: true,
  possession: true,
  pass: true,
  throughBall: true,
  shotAndGoal: true,
  tackleAndFoul: true,
  throwIn: true,
  goalKick: true,
  corner: true,
  firstTouch: true,
  inputs: ["keyboard", "touch", "gamepad"],
  fullMatchesWithoutSoftLock: 10,
}));
