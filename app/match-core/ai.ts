import { normalizeMatchInput } from "./input.ts";
import type { MatchCoreState, MatchInputFrame, MatchPlayerState, Vector2 } from "./types.ts";

function distance(a: Vector2, b: Vector2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getFoundationAiInput(
  player: MatchPlayerState,
  state: MatchCoreState,
): MatchInputFrame {
  if (!player.active || player.controlled) return normalizeMatchInput();

  const anchor = player.homePosition ?? player.position;
  const ballDistance = distance(player.position, state.ball.position);
  const chaseRadius = player.role === "GOL" ? 6 : 12;
  const target = ballDistance <= chaseRadius ? state.ball.position : anchor;
  const dx = target.x - player.position.x;
  const dy = target.y - player.position.y;
  const magnitude = Math.hypot(dx, dy);

  if (magnitude < 0.35) return normalizeMatchInput();

  return normalizeMatchInput({
    moveX: dx / magnitude,
    moveY: dy / magnitude,
    sprint: ballDistance < 7 && player.role !== "GOL",
  });
}
