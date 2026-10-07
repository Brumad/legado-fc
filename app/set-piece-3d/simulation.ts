import {
  createLaunchBall,
  finiteVector3,
  normalizeGesture,
  projectTo2D,
  stepBallPhysics,
} from "./physics.ts";
import {
  DEFAULT_SET_PIECE_CONFIG,
  type SetPieceActor,
  type SetPieceContext,
  type SetPieceGesture,
  type SetPieceResult,
  type SetPieceRuntimeState,
  type SetPieceSimulationConfig,
  type Vector3,
} from "./types.ts";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance3(a: Vector3, b: Vector3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function distance2(a: Vector3, b: Vector3) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicUnit(context: SetPieceContext, key: string) {
  return stableHash(`${context.id}:${key}`) / 4294967295;
}

function goalPlaneCrossed(context: SetPieceContext, previous: Vector3, current: Vector3) {
  return context.attackingSide === "home"
    ? previous.x < context.goalX && current.x >= context.goalX
    : previous.x > context.goalX && current.x <= context.goalX;
}

function insideGoal(context: SetPieceContext, position: Vector3) {
  return (
    Math.abs(position.z - context.goalCenterZ) <= context.goalWidth / 2 - 0.04 &&
    position.y >= 0 &&
    position.y <= context.goalHeight - 0.03
  );
}

function crossedWall(context: SetPieceContext, previous: Vector3, current: Vector3) {
  if (!context.wall.length) return null;
  for (const actor of context.wall) {
    const crossed = context.attackingSide === "home"
      ? previous.x < actor.position.x && current.x >= actor.position.x
      : previous.x > actor.position.x && current.x <= actor.position.x;
    if (!crossed) continue;
    const lateral = Math.abs(current.z - actor.position.z);
    const jumpHeight = 1.85 + actor.rating / 180;
    if (lateral <= 0.48 && current.y <= jumpHeight) return actor;
  }
  return null;
}

function keeperStep(state: SetPieceRuntimeState, config: SetPieceSimulationConfig) {
  const keeper = state.keeper;
  if (state.elapsed < keeper.reactionDelay) return keeper;
  const dt = config.fixedDelta;
  const desiredZ = clamp(
    state.ball.position.z,
    state.context.goalCenterZ - state.context.goalWidth / 2 + 0.35,
    state.context.goalCenterZ + state.context.goalWidth / 2 - 0.35,
  );
  const desiredY = clamp(state.ball.position.y * 0.82, 0.65, 1.72);
  const dz = desiredZ - keeper.position.z;
  const dy = desiredY - keeper.position.y;
  const magnitude = Math.hypot(dz, dy);
  if (magnitude <= 0.001) return keeper;
  const step = Math.min(magnitude, keeper.maxSpeed * dt);
  return {
    ...keeper,
    position: {
      ...keeper.position,
      z: keeper.position.z + dz / magnitude * step,
      y: keeper.position.y + dy / magnitude * step,
    },
  };
}

function keeperSaved(state: SetPieceRuntimeState) {
  const ball = state.ball;
  const keeper = state.keeper;
  const nearLine = Math.abs(ball.position.x - state.context.goalX) <= 1.15;
  if (!nearLine || state.elapsed < keeper.reactionDelay) return false;
  const reach = keeper.reach + keeper.goalkeeping / 250;
  return Math.hypot(
    ball.position.z - keeper.position.z,
    ball.position.y - keeper.position.y,
  ) <= reach;
}

function resultFrom(
  state: SetPieceRuntimeState,
  outcome: SetPieceResult["outcome"],
  receiverId?: string,
): SetPieceResult {
  const ball = state.ball;
  return {
    kind: state.context.kind,
    outcome,
    attackingSide: state.context.attackingSide,
    defendingSide: state.context.defendingSide,
    takerId: state.context.takerId,
    receiverId,
    keeperId: state.context.keeper.playerId,
    endPosition: { ...ball.position },
    endPosition2D: projectTo2D(ball.position),
    endVelocity2D: { x: ball.velocity.x, y: ball.velocity.z },
    goal: outcome === "goal",
    saved: outcome === "saved",
    blocked: outcome === "blocked",
    elapsed: state.elapsed,
  };
}

function nearestActor(actors: SetPieceActor[], ball: Vector3) {
  return actors
    .map((actor) => ({ actor, distance: distance2(actor.position, ball) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function resolveAerialDuel(state: SetPieceRuntimeState): SetPieceRuntimeState | null {
  if (state.context.kind === "free-kick-direct" || state.headerBy) return null;
  const ball = state.ball;
  const sign = state.context.attackingSide === "home" ? 1 : -1;
  const inDangerZone = sign > 0
    ? ball.position.x >= state.context.goalX - 15
    : ball.position.x <= state.context.goalX + 15;
  if (!inDangerZone || ball.position.y < 1.15 || ball.position.y > 3.6) return null;

  const attack = nearestActor(state.context.attackers, ball.position);
  const defend = nearestActor(state.context.defenders, ball.position);
  if (!attack || !defend || Math.min(attack.distance, defend.distance) > 2.7) return null;

  const attackScore = attack.actor.rating + deterministicUnit(state.context, `attack-duel:${attack.actor.playerId}`) * 26;
  const defendScore = defend.actor.rating + deterministicUnit(state.context, `defend-duel:${defend.actor.playerId}`) * 28 + 3;
  if (defendScore >= attackScore) {
    const clearanceDirection = state.context.attackingSide === "home" ? -1 : 1;
    return {
      ...state,
      phase: "resolved",
      touchedBy: defend.actor.playerId,
      result: resultFrom({
        ...state,
        ball: {
          ...ball,
          velocity: {
            x: clearanceDirection * (10 + defend.actor.rating / 12),
            y: 3.5,
            z: (deterministicUnit(state.context, "clearance-z") * 2 - 1) * 7,
          },
        },
      }, "cleared", defend.actor.playerId),
    };
  }

  const goalDirection = state.context.attackingSide === "home" ? 1 : -1;
  const headerSpeed = 12 + attack.actor.rating / 9;
  const dz = state.context.goalCenterZ - ball.position.z;
  const horizontal = Math.max(0.1, Math.hypot(state.context.goalX - ball.position.x, dz));
  return {
    ...state,
    phase: "second-ball",
    headerBy: attack.actor.playerId,
    touchedBy: attack.actor.playerId,
    ball: {
      ...ball,
      velocity: {
        x: goalDirection * headerSpeed * Math.abs(state.context.goalX - ball.position.x) / horizontal,
        y: 2.2 + attack.actor.rating / 80,
        z: headerSpeed * dz / horizontal,
      },
      spin: ball.spin * 0.25,
    },
  };
}

export function createSetPieceRuntimeState(
  context: SetPieceContext,
  rawGesture: Partial<SetPieceGesture> = {},
): SetPieceRuntimeState {
  const launched = createLaunchBall(context, rawGesture);
  return {
    context,
    phase: "flight",
    elapsed: 0,
    ball: launched.ball,
    keeper: { ...context.keeper, position: { ...context.keeper.position } },
    gesture: launched.gesture,
    samples: [{ ...launched.ball.position }],
  };
}

export function stepSetPiece(
  state: SetPieceRuntimeState,
  config: SetPieceSimulationConfig = DEFAULT_SET_PIECE_CONFIG,
): SetPieceRuntimeState {
  if (state.phase === "resolved") return state;
  const previous = state.ball.position;
  let next: SetPieceRuntimeState = {
    ...state,
    elapsed: state.elapsed + config.fixedDelta,
    ball: stepBallPhysics(state.ball, config),
  };
  next = { ...next, keeper: keeperStep(next, config) };

  if (!finiteVector3(next.ball.position) || !finiteVector3(next.ball.velocity)) {
    return { ...next, phase: "resolved", result: resultFrom(next, "wide") };
  }

  if (next.samples.length < 720 && Math.floor(next.elapsed / 0.025) > next.samples.length - 1) {
    next = { ...next, samples: [...next.samples, { ...next.ball.position }] };
  }

  const wallHit = crossedWall(next.context, previous, next.ball.position);
  if (wallHit) {
    const blocked = {
      ...next,
      ball: {
        ...next.ball,
        velocity: {
          x: -next.ball.velocity.x * 0.22,
          y: Math.max(1.4, Math.abs(next.ball.velocity.y) * 0.25),
          z: next.ball.velocity.z * 0.35,
        },
      },
      touchedBy: wallHit.playerId,
    };
    return { ...blocked, phase: "resolved", result: resultFrom(blocked, "blocked", wallHit.playerId) };
  }

  const duel = resolveAerialDuel(next);
  if (duel) return duel;

  if (keeperSaved(next)) {
    const saved = {
      ...next,
      ball: {
        ...next.ball,
        position: { ...next.keeper.position },
        velocity: { x: 0, y: 0, z: 0 },
      },
      touchedBy: next.keeper.playerId,
    };
    return { ...saved, phase: "resolved", result: resultFrom(saved, "saved", next.keeper.playerId) };
  }

  if (goalPlaneCrossed(next.context, previous, next.ball.position)) {
    const outcome = insideGoal(next.context, next.ball.position) ? "goal" : "wide";
    return { ...next, phase: "resolved", result: resultFrom(next, outcome) };
  }

  const speed = Math.hypot(next.ball.velocity.x, next.ball.velocity.y, next.ball.velocity.z);
  if (next.elapsed >= config.maxSeconds) {
    return { ...next, phase: "resolved", result: resultFrom(next, "rebound", next.headerBy) };
  }

  if (next.ball.position.y <= next.ball.radius + 0.001 && speed < 2.4) {
    const inBox = Math.abs(next.ball.position.x - next.context.goalX) <= 18;
    const outcome = inBox ? "rebound" : next.context.kind === "free-kick-direct" ? "wide" : "cross-complete";
    return { ...next, phase: "resolved", result: resultFrom(next, outcome, next.headerBy) };
  }

  if (
    next.ball.position.z < -4 ||
    next.ball.position.z > 72 ||
    next.ball.position.x < -8 ||
    next.ball.position.x > 113
  ) {
    return { ...next, phase: "resolved", result: resultFrom(next, "wide") };
  }

  return next;
}

export function simulateSetPiece(
  context: SetPieceContext,
  gesture: Partial<SetPieceGesture>,
  config: SetPieceSimulationConfig = DEFAULT_SET_PIECE_CONFIG,
) {
  let state = createSetPieceRuntimeState(context, normalizeGesture(gesture));
  const maxSteps = Math.ceil(config.maxSeconds / config.fixedDelta) + 4;
  for (let step = 0; step < maxSteps && state.phase !== "resolved"; step += 1) {
    state = stepSetPiece(state, config);
  }
  if (!state.result) {
    state = { ...state, phase: "resolved", result: resultFrom(state, "rebound", state.headerBy) };
  }
  return state;
}

export class SetPieceRuntime {
  state: SetPieceRuntimeState;
  readonly config: SetPieceSimulationConfig;

  constructor(
    context: SetPieceContext,
    gesture: Partial<SetPieceGesture>,
    config: SetPieceSimulationConfig = DEFAULT_SET_PIECE_CONFIG,
  ) {
    this.config = config;
    this.state = createSetPieceRuntimeState(context, gesture);
  }

  step() {
    this.state = stepSetPiece(this.state, this.config);
    return this.state;
  }

  finish() {
    while (this.state.phase !== "resolved") this.step();
    return this.state.result!;
  }
}
