import { normalizeMatchInput } from "./input.ts";
import type { MatchCoreState, MatchInputFrame, MatchPlayerState, Vector2 } from "./types.ts";

function distance(a: Vector2, b: Vector2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function directionTo(from: Vector2, to: Vector2) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const magnitude = Math.hypot(dx, dy);
  return magnitude > 0.001 ? { x: dx / magnitude, y: dy / magnitude } : { x: 0, y: 0 };
}

export function getFoundationAiInput(
  player: MatchPlayerState,
  state: MatchCoreState,
): MatchInputFrame {
  if (!player.active || player.controlled || state.restart) return normalizeMatchInput();

  const anchor = player.homePosition ?? player.position;
  const ballOwner = state.ball.possessionPlayerId
    ? state.players.find((candidate) => candidate.id === state.ball.possessionPlayerId)
    : null;
  const ownsBall = ballOwner?.id === player.id;
  const teammateOwnsBall = Boolean(ballOwner && ballOwner.side === player.side);
  const opponentOwnsBall = Boolean(ballOwner && ballOwner.side !== player.side);
  const attackGoal = { x: player.side === "home" ? state.pitch.length : 0, y: state.pitch.width / 2 };
  const ballDistance = distance(player.position, state.ball.position);
  const seed = stableHash(`${player.id}:${Math.floor(state.tick / 24)}`);

  if (ownsBall) {
    const goalDistance = distance(player.position, attackGoal);
    const target = directionTo(player.position, attackGoal);
    const shoot = goalDistance < 24 && seed % 100 < 34;
    const pass = !shoot && seed % 100 < 4;
    return normalizeMatchInput({
      moveX: target.x,
      moveY: target.y,
      sprint: goalDistance > 18 && player.role !== "GOL",
      shoot,
      pass,
    });
  }

  if (opponentOwnsBall && ballOwner) {
    const ownerDistance = distance(player.position, ballOwner.position);
    const chaseRadius = player.role === "GOL" ? 7 : 16;
    if (ownerDistance <= chaseRadius) {
      const target = directionTo(player.position, ballOwner.position);
      return normalizeMatchInput({
        moveX: target.x,
        moveY: target.y,
        sprint: ownerDistance > 3 && player.role !== "GOL",
        tackle: ownerDistance <= 1.35 && seed % 45 === 0,
      });
    }
  }

  if (!ballOwner && ballDistance <= (player.role === "GOL" ? 8 : 13)) {
    const target = directionTo(player.position, state.ball.position);
    return normalizeMatchInput({
      moveX: target.x,
      moveY: target.y,
      sprint: ballDistance > 4 && player.role !== "GOL",
    });
  }

  if (teammateOwnsBall && ballOwner) {
    const forward = player.side === "home" ? 5 : -5;
    const support = {
      x: Math.max(1, Math.min(state.pitch.length - 1, anchor.x + forward)),
      y: anchor.y,
    };
    const target = directionTo(player.position, support);
    return normalizeMatchInput({ moveX: target.x, moveY: target.y });
  }

  const target = directionTo(player.position, anchor);
  if (distance(player.position, anchor) < 0.4) return normalizeMatchInput();
  return normalizeMatchInput({ moveX: target.x, moveY: target.y });
}
