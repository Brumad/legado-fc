import { clampPositionToPitch } from "./rules.ts";
import type { BallState, MatchCoreConfig, MatchCoreState, MatchInputFrame, MatchPlayerState, Vector2 } from "./types.ts";

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function vectorLength(vector: Vector2) { return Math.hypot(vector.x, vector.y); }
function normalized(vector: Vector2, fallback: Vector2 = { x: 1, y: 0 }): Vector2 {
  const length = vectorLength(vector);
  return length > 0.0001 ? { x: vector.x / length, y: vector.y / length } : fallback;
}
function approach(current: number, target: number, amount: number) {
  if (current < target) return Math.min(target, current + amount);
  return Math.max(target, current - amount);
}

export function moveMatchPlayer(
  player: MatchPlayerState,
  input: MatchInputFrame,
  state: MatchCoreState,
  deltaSeconds: number,
  config: MatchCoreConfig,
): MatchPlayerState {
  if (!player.active || player.redCard) return player;
  const ratings = player.ratings ?? { pace: 65, shooting: 62, passing: 64, dribbling: 64, defending: 62, physical: 65, goalkeeping: 20 };
  const inputLength = Math.hypot(input.moveX, input.moveY);
  const hasMove = inputLength > 0.001;
  const direction = hasMove ? normalized({ x: input.moveX, y: input.moveY }) : { x: 0, y: 0 };
  const sprinting = input.sprint && hasMove && player.stamina > 0;
  const paceFactor = 0.82 + ratings.pace / 100 * 0.36;
  const injuryFactor = player.injured ? (player.injurySeverity === "Moderada" ? 0.72 : 0.86) : 1;
  const fatigueFactor = 0.78 + player.stamina / 100 * 0.22;
  const targetSpeed = hasMove
    ? config.playerSpeedMetersPerSecond * paceFactor * injuryFactor * fatigueFactor * (sprinting ? config.sprintMultiplier : 1)
    : 0;
  const targetVelocity = { x: direction.x * targetSpeed, y: direction.y * targetSpeed };
  const accelerationFactor = 0.82 + ratings.dribbling / 100 * 0.3;
  const acceleration = (hasMove ? config.playerAcceleration : config.playerDeceleration) * accelerationFactor;
  const velocity = {
    x: approach(player.velocity.x, targetVelocity.x, acceleration * deltaSeconds),
    y: approach(player.velocity.y, targetVelocity.y, acceleration * deltaSeconds),
  };
  const enduranceFactor = clamp(1.18 - ratings.physical / 180, 0.62, 0.95);
  const recoveryFactor = 0.72 + ratings.physical / 100 * 0.48;
  const staminaDelta = sprinting
    ? -config.staminaDrainPerSecond * enduranceFactor * deltaSeconds
    : config.staminaRecoveryPerSecond * recoveryFactor * deltaSeconds;

  return {
    ...player,
    velocity,
    facing: hasMove ? direction : player.facing,
    stamina: clamp(player.stamina + staminaDelta, 0, 100),
    actionCooldownTicks: Math.max(0, (player.actionCooldownTicks ?? 0) - 1),
    position: clampPositionToPitch({
      x: player.position.x + velocity.x * deltaSeconds,
      y: player.position.y + velocity.y * deltaSeconds,
    }, state.pitch, 0.35),
  };
}

export function integrateBall(state: MatchCoreState, deltaSeconds: number, config: MatchCoreConfig): BallState {
  if (state.ball.possessionPlayerId) {
    const owner = state.players.find((player) => player.id === state.ball.possessionPlayerId && player.active && !player.redCard);
    if (owner) {
      const facing = normalized(owner.facing ?? { x: owner.side === "home" ? 1 : -1, y: 0 });
      const controlDistance = 0.62 + (100 - (owner.ratings?.dribbling ?? 65)) / 250;
      return {
        ...state.ball,
        position: { x: owner.position.x + facing.x * controlDistance, y: owner.position.y + facing.y * controlDistance },
        velocity: { ...owner.velocity },
        lastTouchSide: owner.side,
        lastTouchPlayerId: owner.id,
        pickupCooldownTicks: Math.max(0, state.ball.pickupCooldownTicks - 1),
      };
    }
  }
  const damping = Math.exp(-config.ballFrictionPerSecond * deltaSeconds);
  const rawVelocity = { x: state.ball.velocity.x * damping, y: state.ball.velocity.y * damping };
  const speed = vectorLength(rawVelocity);
  const velocity = speed > config.ballMaxSpeed
    ? { x: rawVelocity.x / speed * config.ballMaxSpeed, y: rawVelocity.y / speed * config.ballMaxSpeed }
    : rawVelocity;
  return {
    ...state.ball,
    position: { x: state.ball.position.x + velocity.x * deltaSeconds, y: state.ball.position.y + velocity.y * deltaSeconds },
    velocity,
    pickupCooldownTicks: Math.max(0, state.ball.pickupCooldownTicks - 1),
  };
}
