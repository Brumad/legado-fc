import { clampPositionToPitch } from "./rules.ts";
import type {
  BallState,
  MatchCoreConfig,
  MatchCoreState,
  MatchInputFrame,
  MatchPlayerState,
  Vector2,
} from "./types.ts";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function moveMatchPlayer(
  player: MatchPlayerState,
  input: MatchInputFrame,
  state: MatchCoreState,
  deltaSeconds: number,
  config: MatchCoreConfig,
): MatchPlayerState {
  if (!player.active) return player;
  const hasMove = Math.abs(input.moveX) > 0.001 || Math.abs(input.moveY) > 0.001;
  const sprinting = input.sprint && hasMove && player.stamina > 0;
  const speed = config.playerSpeedMetersPerSecond * (sprinting ? config.sprintMultiplier : 1);
  const velocity: Vector2 = hasMove
    ? { x: input.moveX * speed, y: input.moveY * speed }
    : { x: 0, y: 0 };
  const staminaDelta = sprinting
    ? -config.staminaDrainPerSecond * deltaSeconds
    : config.staminaRecoveryPerSecond * deltaSeconds;

  return {
    ...player,
    velocity,
    stamina: clamp(player.stamina + staminaDelta, 0, 100),
    position: clampPositionToPitch({
      x: player.position.x + velocity.x * deltaSeconds,
      y: player.position.y + velocity.y * deltaSeconds,
    }, state.pitch, 0.4),
  };
}

export function integrateBall(
  state: MatchCoreState,
  deltaSeconds: number,
  config: MatchCoreConfig,
): BallState {
  if (state.ball.possessionPlayerId) {
    const owner = state.players.find((player) => player.id === state.ball.possessionPlayerId && player.active);
    if (owner) {
      return {
        ...state.ball,
        position: { x: owner.position.x, y: owner.position.y },
        velocity: { ...owner.velocity },
        lastTouchSide: owner.side,
      };
    }
  }

  const damping = Math.exp(-config.ballFrictionPerSecond * deltaSeconds);
  return {
    ...state.ball,
    position: clampPositionToPitch({
      x: state.ball.position.x + state.ball.velocity.x * deltaSeconds,
      y: state.ball.position.y + state.ball.velocity.y * deltaSeconds,
    }, state.pitch),
    velocity: {
      x: state.ball.velocity.x * damping,
      y: state.ball.velocity.y * damping,
    },
  };
}
