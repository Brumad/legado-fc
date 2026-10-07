import type {
  SetPieceBallState,
  SetPieceContext,
  SetPieceGesture,
  SetPieceSimulationConfig,
  Vector3,
} from "./types.ts";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function length2(x: number, z: number) {
  return Math.hypot(x, z);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicSigned(context: SetPieceContext, key: string) {
  return (stableHash(`${context.id}:${key}`) / 4294967295) * 2 - 1;
}

export function normalizeGesture(gesture: Partial<SetPieceGesture>): SetPieceGesture {
  return {
    aimX: clamp(gesture.aimX ?? 0, -1, 1),
    aimY: clamp(gesture.aimY ?? 0.55, 0, 1),
    power: clamp(gesture.power ?? 0.68, 0.08, 1),
    curve: clamp(gesture.curve ?? 0, -1, 1),
  };
}

export function gestureFromPointerPath(
  points: ReadonlyArray<{ x: number; y: number }>,
  width: number,
  height: number,
): SetPieceGesture {
  if (points.length < 2 || width <= 0 || height <= 0) return normalizeGesture({});
  const first = points[0];
  const last = points[points.length - 1];
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const distance = Math.hypot(dx, dy);
  const mid = points[Math.floor(points.length / 2)] ?? last;
  const lineMidX = (first.x + last.x) / 2;
  const curvePixels = mid.x - lineMidX;
  return normalizeGesture({
    aimX: dx / Math.max(70, width * 0.28),
    aimY: -dy / Math.max(90, height * 0.34),
    power: distance / Math.max(120, Math.min(width, height) * 0.45),
    curve: curvePixels / Math.max(35, width * 0.12),
  });
}

function targetForGesture(context: SetPieceContext, gesture: SetPieceGesture): Vector3 {
  const sign = context.attackingSide === "home" ? 1 : -1;
  if (context.kind === "corner") {
    const nearPostBias = gesture.aimX * 9;
    const depth = 4.5 + gesture.aimY * 8.5;
    return {
      x: context.goalX - sign * depth,
      y: 1.2 + gesture.aimY * 2.2,
      z: context.goalCenterZ + nearPostBias,
    };
  }
  if (context.kind === "free-kick-cross") {
    return {
      x: context.goalX - sign * (4.5 + gesture.aimY * 5),
      y: 1.5 + gesture.aimY * 2.4,
      z: context.goalCenterZ + gesture.aimX * 10.5,
    };
  }
  return {
    x: context.goalX,
    y: 0.35 + gesture.aimY * 2.35,
    z: context.goalCenterZ + gesture.aimX * 3.25,
  };
}

export function createLaunchBall(
  context: SetPieceContext,
  rawGesture: Partial<SetPieceGesture>,
): { gesture: SetPieceGesture; ball: SetPieceBallState } {
  const gesture = normalizeGesture(rawGesture);
  const technique = context.kind === "corner" || context.kind === "free-kick-cross"
    ? context.technique.passing
    : context.technique.shooting;
  const accuracy = clamp((technique + context.technique.dribbling * 0.35) / 1.35, 35, 98);
  const error = (100 - accuracy) / 100;
  const target = targetForGesture(context, gesture);
  target.z += deterministicSigned(context, "lateral-error") * error * (context.kind === "corner" ? 3.2 : 1.35);
  target.y += deterministicSigned(context, "height-error") * error * (context.kind === "corner" ? 0.9 : 0.45);

  const dx = target.x - context.origin.x;
  const dz = target.z - context.origin.z;
  const horizontal = Math.max(0.1, length2(dx, dz));
  const directionX = dx / horizontal;
  const directionZ = dz / horizontal;
  const physical = clamp(context.technique.physical, 35, 98);
  const baseSpeed = context.kind === "corner"
    ? 16 + gesture.power * 9
    : context.kind === "free-kick-cross"
      ? 17 + gesture.power * 10
      : 20 + gesture.power * 12;
  const speed = baseSpeed * (0.88 + physical / 100 * 0.18);
  const distanceFactor = clamp(horizontal / 30, 0.55, 1.25);
  const elevation = context.kind === "corner"
    ? 0.24 + gesture.aimY * 0.28
    : context.kind === "free-kick-cross"
      ? 0.2 + gesture.aimY * 0.28
      : 0.12 + gesture.aimY * 0.23 + distanceFactor * 0.035;
  const horizontalSpeed = speed * Math.cos(elevation);
  const spinSkill = clamp((context.technique.dribbling + technique) / 2, 35, 98);

  return {
    gesture,
    ball: {
      position: { ...context.origin, y: 0.11 },
      velocity: {
        x: directionX * horizontalSpeed,
        y: speed * Math.sin(elevation),
        z: directionZ * horizontalSpeed,
      },
      spin: gesture.curve * (0.55 + spinSkill / 100 * 1.05),
      radius: 0.11,
      bounces: 0,
    },
  };
}

export function stepBallPhysics(
  ball: SetPieceBallState,
  config: SetPieceSimulationConfig,
): SetPieceBallState {
  const dt = config.fixedDelta;
  const drag = Math.exp(-config.drag * dt);
  const horizontalSpeed = Math.hypot(ball.velocity.x, ball.velocity.z);
  const magnus = ball.spin * config.magnus * horizontalSpeed;
  const directionX = horizontalSpeed > 0.001 ? ball.velocity.x / horizontalSpeed : 0;
  const directionZ = horizontalSpeed > 0.001 ? ball.velocity.z / horizontalSpeed : 0;

  let velocity = {
    x: (ball.velocity.x - directionZ * magnus * dt) * drag,
    y: (ball.velocity.y - config.gravity * dt - Math.abs(ball.spin) * 0.035 * dt) * drag,
    z: (ball.velocity.z + directionX * magnus * dt) * drag,
  };
  let position = {
    x: ball.position.x + velocity.x * dt,
    y: ball.position.y + velocity.y * dt,
    z: ball.position.z + velocity.z * dt,
  };
  let bounces = ball.bounces;

  if (position.y < ball.radius) {
    position = { ...position, y: ball.radius };
    if (Math.abs(velocity.y) > 1.1 && bounces < 3) {
      velocity = {
        x: velocity.x * config.groundFriction,
        y: Math.abs(velocity.y) * config.groundRestitution,
        z: velocity.z * config.groundFriction,
      };
      bounces += 1;
    } else {
      velocity = {
        x: velocity.x * Math.pow(config.groundFriction, dt * 10),
        y: 0,
        z: velocity.z * Math.pow(config.groundFriction, dt * 10),
      };
    }
  }

  return { ...ball, position, velocity, bounces };
}

export function finiteVector3(value: Vector3) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}

export function projectTo2D(value: Vector3) {
  return { x: value.x, y: value.z };
}
