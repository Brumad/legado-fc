import type { MatchCoreState, MatchSide, PitchDimensions, Vector2 } from "./types.ts";

export type BallBoundaryResult =
  | { kind: "in-play" }
  | { kind: "goal"; side: MatchSide }
  | { kind: "out"; edge: "left" | "right" | "top" | "bottom" };

const GOAL_WIDTH_METERS = 7.32;

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

export function evaluateBallBoundary(position: Vector2, pitch: PitchDimensions): BallBoundaryResult {
  const goalTop = (pitch.width - GOAL_WIDTH_METERS) / 2;
  const goalBottom = goalTop + GOAL_WIDTH_METERS;
  const insideGoalMouth = position.y >= goalTop && position.y <= goalBottom;

  if (position.x < 0) {
    return insideGoalMouth ? { kind: "goal", side: "away" } : { kind: "out", edge: "left" };
  }
  if (position.x > pitch.length) {
    return insideGoalMouth ? { kind: "goal", side: "home" } : { kind: "out", edge: "right" };
  }
  if (position.y < 0) return { kind: "out", edge: "top" };
  if (position.y > pitch.width) return { kind: "out", edge: "bottom" };
  return { kind: "in-play" };
}

export function isActiveMatch(state: MatchCoreState) {
  return !state.finished
    && !state.paused
    && state.clock.running
    && (state.clock.phase === "first-half" || state.clock.phase === "second-half");
}
