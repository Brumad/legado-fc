import type {
  MatchCoreState,
  MatchRestartState,
  MatchSide,
  PitchDimensions,
  Vector2,
} from "./types.ts";

export type BallBoundaryResult =
  | { kind: "in-play" }
  | { kind: "goal"; side: MatchSide }
  | { kind: "out"; edge: "left" | "right" | "top" | "bottom" };

const GOAL_WIDTH_METERS = 7.32;

export function oppositeSide(side: MatchSide): MatchSide {
  return side === "home" ? "away" : "home";
}

export function clampPositionToPitch(
  position: Vector2,
  pitch: PitchDimensions,
  margin = 0,
): Vector2 {
  return {
    x: Math.max(margin, Math.min(pitch.length - margin, position.x)),
    y: Math.max(margin, Math.min(pitch.width - margin, position.y)),
  };
}

export function evaluateBallBoundary(
  position: Vector2,
  pitch: PitchDimensions,
  radius = 0,
): BallBoundaryResult {
  const goalTop = (pitch.width - GOAL_WIDTH_METERS) / 2;
  const goalBottom = goalTop + GOAL_WIDTH_METERS;
  const insideGoalMouth = position.y >= goalTop && position.y <= goalBottom;

  if (position.x + radius < 0) {
    return insideGoalMouth ? { kind: "goal", side: "away" } : { kind: "out", edge: "left" };
  }
  if (position.x - radius > pitch.length) {
    return insideGoalMouth ? { kind: "goal", side: "home" } : { kind: "out", edge: "right" };
  }
  if (position.y + radius < 0) return { kind: "out", edge: "top" };
  if (position.y - radius > pitch.width) return { kind: "out", edge: "bottom" };
  return { kind: "in-play" };
}

export function createRestartForBoundary(
  state: MatchCoreState,
  edge: "left" | "right" | "top" | "bottom",
  delayTicks: number,
): MatchRestartState {
  const lastTouch = state.ball.lastTouchSide ?? "home";
  const receivingSide = oppositeSide(lastTouch);

  if (edge === "top" || edge === "bottom") {
    return {
      type: "throw-in",
      side: receivingSide,
      position: {
        x: Math.max(2, Math.min(state.pitch.length - 2, state.ball.position.x)),
        y: edge === "top" ? 0.35 : state.pitch.width - 0.35,
      },
      ticksRemaining: delayTicks,
      label: "Lateral",
    };
  }

  const defendingSide: MatchSide = edge === "left" ? "home" : "away";
  const attackingSide = oppositeSide(defendingSide);
  const cornerY = state.ball.position.y < state.pitch.width / 2 ? 0.45 : state.pitch.width - 0.45;

  if (lastTouch === defendingSide) {
    return {
      type: "corner",
      side: attackingSide,
      position: { x: edge === "left" ? 0.45 : state.pitch.length - 0.45, y: cornerY },
      ticksRemaining: delayTicks,
      label: "Escanteio",
    };
  }

  return {
    type: "goal-kick",
    side: defendingSide,
    position: {
      x: edge === "left" ? 5.5 : state.pitch.length - 5.5,
      y: state.pitch.width / 2,
    },
    ticksRemaining: delayTicks,
    label: "Tiro de meta",
  };
}

export function isActiveMatch(state: MatchCoreState) {
  return !state.finished
    && !state.paused
    && state.clock.running
    && (state.clock.phase === "first-half" || state.clock.phase === "second-half");
}
