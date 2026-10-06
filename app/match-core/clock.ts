import type { MatchClockState, MatchCoreConfig } from "./types.ts";

function withDisplayTime(clock: MatchClockState): MatchClockState {
  const rounded = Math.max(0, clock.matchSeconds);
  return {
    ...clock,
    minute: Math.floor(rounded / 60),
    second: Math.floor(rounded % 60),
  };
}

export function startMatchClock(clock: MatchClockState): MatchClockState {
  if (clock.phase !== "pre-match") return clock;
  return withDisplayTime({ ...clock, phase: "first-half", running: true, addedTimeSeconds: 0 });
}

export function startSecondHalfClock(clock: MatchClockState, config?: MatchCoreConfig): MatchClockState {
  if (clock.phase !== "half-time") return clock;
  const secondHalfBase = config?.halfDurationSeconds ?? 45 * 60;
  return withDisplayTime({
    ...clock,
    phase: "second-half",
    running: true,
    periodSeconds: 0,
    matchSeconds: secondHalfBase,
    addedTimeSeconds: 0,
  });
}

export function pauseMatchClock(clock: MatchClockState): MatchClockState {
  if (!clock.running) return clock;
  return { ...clock, running: false };
}

export function resumeMatchClock(clock: MatchClockState): MatchClockState {
  if (clock.phase !== "first-half" && clock.phase !== "second-half") return clock;
  return { ...clock, running: true };
}

export function addMatchStoppage(clock: MatchClockState, seconds: number): MatchClockState {
  if (clock.phase !== "first-half" && clock.phase !== "second-half") return clock;
  const capped = Math.min(5 * 60, Math.max(0, clock.addedTimeSeconds + Math.max(0, seconds)));
  return { ...clock, addedTimeSeconds: capped };
}

export function advanceMatchClock(
  clock: MatchClockState,
  deltaSeconds: number,
  config: MatchCoreConfig,
): MatchClockState {
  if (!clock.running || (clock.phase !== "first-half" && clock.phase !== "second-half")) return clock;
  const delta = Math.max(0, Number.isFinite(deltaSeconds) ? deltaSeconds : 0);
  const periodTarget = config.halfDurationSeconds + Math.max(0, clock.addedTimeSeconds);
  const rawPeriodSeconds = clock.periodSeconds + delta;
  const reachedPeriodEnd = rawPeriodSeconds >= periodTarget - 1e-9;
  const periodSeconds = reachedPeriodEnd ? periodTarget : Math.min(periodTarget, rawPeriodSeconds);
  const displayBase = clock.phase === "first-half" ? 0 : config.halfDurationSeconds;
  const matchSeconds = displayBase + periodSeconds;

  if (reachedPeriodEnd) {
    if (clock.phase === "first-half") {
      return withDisplayTime({
        ...clock,
        phase: "half-time",
        running: false,
        periodSeconds: periodTarget,
        matchSeconds,
      });
    }
    return withDisplayTime({
      ...clock,
      phase: "finished",
      running: false,
      periodSeconds: periodTarget,
      matchSeconds,
    });
  }

  return withDisplayTime({ ...clock, periodSeconds, matchSeconds });
}
