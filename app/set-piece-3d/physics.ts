import type {
  SetPiece3DRequest,
  SetPiece3DResult,
  SetPieceInput,
  SetPieceKeeperResolution,
  SetPieceTrajectoryPoint,
  SetPieceVector3,
} from "./types.ts";

const GRAVITY = 9.81;
const GOAL_WIDTH = 7.32;
const GOAL_HEIGHT = 2.44;
const DT = 1 / 120;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicUnit(value: string) {
  return stableHash(value) / 4294967295;
}

function normalizeInput(input: SetPieceInput): SetPieceInput {
  return {
    aimX: clamp(input.aimX, -1, 1),
    lift: clamp(input.lift, 0, 1),
    curve: clamp(input.curve, -1, 1),
    power: clamp(input.power, 0.12, 1),
  };
}

export const DEFAULT_SET_PIECE_INPUT: SetPieceInput = {
  aimX: 0,
  lift: 0.52,
  curve: 0,
  power: 0.72,
};

export function setPieceInputFromDrag(
  deltaX: number,
  deltaY: number,
  viewportWidth: number,
  viewportHeight: number,
  curveHint = 0,
): SetPieceInput {
  const width = Math.max(1, viewportWidth);
  const height = Math.max(1, viewportHeight);
  const distance = Math.hypot(deltaX / width, deltaY / height);
  return normalizeInput({
    aimX: clamp(deltaX / (width * 0.3), -1, 1),
    lift: clamp(-deltaY / (height * 0.38), 0.05, 1),
    curve: clamp(curveHint + deltaX / (width * 0.85), -1, 1),
    power: clamp(0.28 + distance * 1.45, 0.22, 1),
  });
}

export function setPieceInputFromGamepad(
  aimX: number,
  aimY: number,
  curveAxis: number,
  powerAxis: number,
): SetPieceInput {
  return normalizeInput({
    aimX,
    lift: clamp((-aimY + 1) / 2, 0.05, 1),
    curve: curveAxis,
    power: clamp((powerAxis + 1) / 2, 0.2, 1),
  });
}

function effectiveAccuracy(request: SetPiece3DRequest) {
  return request.kind === "free-kick-direct"
    ? request.takerRatings.shooting * 0.68 + request.takerRatings.dribbling * 0.32
    : request.takerRatings.passing * 0.72 + request.takerRatings.dribbling * 0.28;
}

function effectivePower(request: SetPiece3DRequest) {
  return request.kind === "free-kick-direct"
    ? request.takerRatings.shooting * 0.7 + request.takerRatings.physical * 0.3
    : request.takerRatings.passing * 0.74 + request.takerRatings.physical * 0.26;
}

function effectiveCurve(request: SetPiece3DRequest) {
  return request.takerRatings.dribbling * 0.55 + request.takerRatings.passing * 0.45;
}

function skillAdjustedInput(request: SetPiece3DRequest, raw: SetPieceInput): SetPieceInput {
  const input = normalizeInput(raw);
  const accuracy = effectiveAccuracy(request);
  const power = effectivePower(request);
  const curve = effectiveCurve(request);
  const error = clamp((100 - accuracy) / 100, 0.04, 0.65);
  const lateralNoise = (deterministicUnit(request.id + ":x") * 2 - 1) * error * 0.42;
  const liftNoise = (deterministicUnit(request.id + ":y") * 2 - 1) * error * 0.22;
  const powerNoise = (deterministicUnit(request.id + ":p") * 2 - 1) * error * 0.12;
  return {
    aimX: clamp(input.aimX + lateralNoise, -1, 1),
    lift: clamp(input.lift + liftNoise, 0.03, 1),
    curve: clamp(input.curve * (0.45 + curve / 135), -1, 1),
    power: clamp(input.power * (0.82 + power / 450) + powerNoise, 0.16, 1),
  };
}

function directLaunch(request: SetPiece3DRequest, input: SetPieceInput) {
  const distance = Math.max(8, request.distanceToGoal);
  const speed = lerp(18, 34.5, input.power);
  const targetX = request.goalOffsetX + input.aimX * (GOAL_WIDTH * 0.54);
  const targetY = lerp(0.35, 3.55, input.lift);
  const flight = clamp(distance / Math.max(10, speed * 0.88), 0.46, 1.8);
  return {
    velocity: {
      x: targetX / flight,
      y: (targetY + 0.5 * GRAVITY * flight * flight) / flight,
      z: distance / flight,
    },
    curve: input.curve * lerp(2.2, 5.4, effectiveCurve(request) / 100),
    maxTime: Math.max(2.2, flight + 0.9),
  };
}

function crossLaunch(request: SetPiece3DRequest, input: SetPieceInput) {
  const distance = request.kind === "corner" ? 28 : Math.max(20, request.distanceToGoal * 0.72);
  const speed = lerp(15, 27.5, input.power);
  const targetX = input.aimX * (request.kind === "corner" ? 10 : 8);
  const targetY = lerp(1.8, 5.6, input.lift);
  const flight = clamp(distance / Math.max(9, speed * 0.74), 0.75, 2.45);
  return {
    velocity: {
      x: targetX / flight,
      y: (targetY + 0.5 * GRAVITY * flight * flight) / flight,
      z: distance / flight,
    },
    curve: input.curve * lerp(1.8, 4.5, effectiveCurve(request) / 100),
    maxTime: Math.max(3.2, flight + 1.1),
  };
}

export function buildSetPieceTrajectory(
  request: SetPiece3DRequest,
  rawInput: SetPieceInput,
): SetPieceTrajectoryPoint[] {
  const input = skillAdjustedInput(request, rawInput);
  const launch = request.kind === "free-kick-direct"
    ? directLaunch(request, input)
    : crossLaunch(request, input);
  const points: SetPieceTrajectoryPoint[] = [];
  let position: SetPieceVector3 = { x: 0, y: 0.11, z: 0 };
  let velocity = { ...launch.velocity };
  let time = 0;

  for (let step = 0; step < Math.ceil(launch.maxTime / DT); step += 1) {
    const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
    const curveFactor = Math.max(0.15, velocity.z / Math.max(1, speed));
    const curveAcceleration = launch.curve * curveFactor * Math.exp(-time * 0.48);
    velocity = {
      x: velocity.x + curveAcceleration * DT,
      y: velocity.y - GRAVITY * DT,
      z: velocity.z * Math.exp(-0.055 * DT),
    };
    position = {
      x: position.x + velocity.x * DT,
      y: position.y + velocity.y * DT,
      z: position.z + velocity.z * DT,
    };
    time += DT;
    points.push({
      x: position.x,
      y: position.y,
      z: position.z,
      vx: velocity.x,
      vy: velocity.y,
      vz: velocity.z,
      t: time,
    });

    if (position.y < 0.1 && time > 0.24) {
      if (Math.abs(velocity.y) > 2.2) {
        position.y = 0.1;
        velocity.y = Math.abs(velocity.y) * 0.36;
        velocity.x *= 0.82;
        velocity.z *= 0.82;
      } else if (request.kind !== "free-kick-direct") {
        break;
      }
    }
    if (position.z > Math.max(request.distanceToGoal + 5, 36)) break;
  }
  return points;
}

function crossingAtZ(
  points: SetPieceTrajectoryPoint[],
  targetZ: number,
): SetPieceTrajectoryPoint | null {
  for (let index = 1; index < points.length; index += 1) {
    const before = points[index - 1];
    const after = points[index];
    if (before.z <= targetZ && after.z >= targetZ) {
      const span = Math.max(0.0001, after.z - before.z);
      const factor = clamp((targetZ - before.z) / span, 0, 1);
      return {
        t: lerp(before.t, after.t, factor),
        x: lerp(before.x, after.x, factor),
        y: lerp(before.y, after.y, factor),
        z: targetZ,
        vx: lerp(before.vx, after.vx, factor),
        vy: lerp(before.vy, after.vy, factor),
        vz: lerp(before.vz, after.vz, factor),
      };
    }
  }
  return null;
}

function keeperResolution(
  request: SetPiece3DRequest,
  crossing: SetPieceTrajectoryPoint | null,
): SetPieceKeeperResolution {
  const gk = request.keeperRatings.goalkeeping;
  const reactionSeconds = lerp(0.42, 0.16, gk / 100);
  const targetX = crossing?.x ?? 0;
  const targetY = crossing?.y ?? 0;
  if (!crossing) {
    return { reactionSeconds, targetX, targetY, maxReach: 0, reached: false };
  }
  const movementTime = Math.max(0, crossing.t - reactionSeconds);
  const moveSpeed = lerp(4.5, 7.2, gk / 100);
  const armReach = lerp(0.65, 1.1, gk / 100);
  const maxReach = movementTime * moveSpeed + armReach;
  const horizontalNeed = Math.abs(targetX - request.goalOffsetX);
  const verticalReach = lerp(1.7, 2.65, gk / 100);
  return {
    reactionSeconds,
    targetX,
    targetY,
    maxReach,
    reached: horizontalNeed <= maxReach && targetY <= verticalReach,
  };
}

function wallBlocks(request: SetPiece3DRequest, points: SetPieceTrajectoryPoint[]) {
  if (request.kind !== "free-kick-direct" || request.wallCount <= 0) return false;
  const wallZ = Math.min(9.15, request.distanceToGoal * 0.47);
  const crossing = crossingAtZ(points, wallZ);
  if (!crossing) return false;
  const wallHalfWidth = request.wallCount * 0.34;
  const wallJumpHeight = 1.88 + deterministicUnit(request.id + ":wall") * 0.28;
  return Math.abs(crossing.x) <= wallHalfWidth && crossing.y <= wallJumpHeight;
}

function bestAreaPlayer(request: SetPiece3DRequest, side: "attack" | "defend") {
  const targetSide = side === "attack" ? request.attackingSide : request.defendingSide;
  return request.areaPlayers
    .filter((player) => player.side === targetSide && player.role !== "GOL")
    .map((player) => ({
      player,
      score: player.ratings.physical * 0.42
        + (side === "attack" ? player.ratings.shooting : player.ratings.defending) * 0.58
        + deterministicUnit(request.id + ":" + player.id) * 8,
    }))
    .sort((a, b) => b.score - a.score)[0] ?? null;
}

function resolveCross(
  request: SetPiece3DRequest,
  points: SetPieceTrajectoryPoint[],
  renderer: "webgl" | "fallback-2d",
): SetPiece3DResult {
  const final = points.at(-1) ?? { x: 0, y: 0.1, z: 0, t: 0, vx: 0, vy: 0, vz: 0 };
  const boxPlane = request.kind === "corner" ? 25 : Math.min(31, request.distanceToGoal * 0.72);
  const boxBall = crossingAtZ(points, boxPlane) ?? final;
  const keeper = keeperResolution(request, {
    ...boxBall,
    x: boxBall.x + request.goalOffsetX,
    z: request.distanceToGoal,
  });
  const attack = bestAreaPlayer(request, "attack");
  const defend = bestAreaPlayer(request, "defend");
  const crossQuality = clamp(
    request.takerRatings.passing * 0.64
      + request.takerRatings.dribbling * 0.18
      + Math.max(0, 24 - Math.abs(boxBall.x)) * 0.7
      + Math.max(0, 5 - Math.abs(boxBall.y - 2.8)) * 4,
    0,
    120,
  );

  if (keeper.reached && boxBall.y < 3.6 && Math.abs(boxBall.x) < 5.8) {
    return {
      requestId: request.id,
      kind: request.kind,
      outcome: "saved",
      attackingSide: request.attackingSide,
      defendingSide: request.defendingSide,
      takerId: request.takerId,
      winnerPlayerId: request.keeperId,
      winnerSide: request.defendingSide,
      trajectory: points,
      keeper,
      finalBall: { x: boxBall.x, y: boxBall.y, z: boxBall.z },
      shotOnTarget: false,
      renderer,
    };
  }

  const attackScore = (attack?.score ?? 0) + crossQuality * 0.58;
  const defendScore = (defend?.score ?? 0) + 44;
  if (attack && attackScore > defendScore + 8) {
    const headerQuality = attack.player.ratings.shooting * 0.55 + attack.player.ratings.physical * 0.45;
    const goal = headerQuality + crossQuality * 0.38 > 101;
    return {
      requestId: request.id,
      kind: request.kind,
      outcome: goal ? "goal" : "rebound",
      attackingSide: request.attackingSide,
      defendingSide: request.defendingSide,
      takerId: request.takerId,
      winnerPlayerId: attack.player.id,
      winnerSide: request.attackingSide,
      trajectory: points,
      keeper,
      finalBall: { x: boxBall.x, y: Math.max(0.1, boxBall.y), z: boxBall.z },
      shotOnTarget: goal,
      renderer,
    };
  }

  return {
    requestId: request.id,
    kind: request.kind,
    outcome: "cleared",
    attackingSide: request.attackingSide,
    defendingSide: request.defendingSide,
    takerId: request.takerId,
    winnerPlayerId: defend?.player.id ?? null,
    winnerSide: request.defendingSide,
    trajectory: points,
    keeper,
    finalBall: { x: boxBall.x, y: Math.max(0.1, boxBall.y), z: boxBall.z },
    shotOnTarget: false,
    renderer,
  };
}

export function resolveSetPiece3D(
  request: SetPiece3DRequest,
  rawInput: SetPieceInput,
  renderer: "webgl" | "fallback-2d" = "webgl",
): SetPiece3DResult {
  const points = buildSetPieceTrajectory(request, rawInput);
  const final = points.at(-1) ?? { x: 0, y: 0.1, z: 0, t: 0, vx: 0, vy: 0, vz: 0 };

  if (request.kind !== "free-kick-direct") {
    return resolveCross(request, points, renderer);
  }

  if (wallBlocks(request, points)) {
    return {
      requestId: request.id,
      kind: request.kind,
      outcome: "cleared",
      attackingSide: request.attackingSide,
      defendingSide: request.defendingSide,
      takerId: request.takerId,
      winnerPlayerId: null,
      winnerSide: request.defendingSide,
      trajectory: points,
      keeper: keeperResolution(request, null),
      finalBall: { x: final.x, y: final.y, z: final.z },
      shotOnTarget: false,
      renderer,
    };
  }

  const goalCrossing = crossingAtZ(points, request.distanceToGoal);
  const keeper = keeperResolution(request, goalCrossing);
  const insideGoal = Boolean(
    goalCrossing
      && Math.abs(goalCrossing.x - request.goalOffsetX) <= GOAL_WIDTH / 2
      && goalCrossing.y >= 0
      && goalCrossing.y <= GOAL_HEIGHT,
  );

  const outcome = insideGoal
    ? keeper.reached ? "saved" : "goal"
    : goalCrossing ? "out" : "rebound";

  return {
    requestId: request.id,
    kind: request.kind,
    outcome,
    attackingSide: request.attackingSide,
    defendingSide: request.defendingSide,
    takerId: request.takerId,
    winnerPlayerId: outcome === "saved" ? request.keeperId : null,
    winnerSide: outcome === "saved" || outcome === "out" ? request.defendingSide : outcome === "goal" ? request.attackingSide : null,
    trajectory: points,
    keeper,
    finalBall: {
      x: goalCrossing?.x ?? final.x,
      y: goalCrossing?.y ?? final.y,
      z: goalCrossing?.z ?? final.z,
    },
    shotOnTarget: insideGoal,
    renderer,
  };
}

export function isFiniteTrajectory(points: SetPieceTrajectoryPoint[]) {
  return points.length > 4 && points.every((point) =>
    [point.t, point.x, point.y, point.z, point.vx, point.vy, point.vz].every(Number.isFinite)
  );
}
