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
  return withDisplayTime({ ...clock, phase: "first-half", running: true });
}

export function startSecondHalfClock(clock: MatchClockState): MatchClockState {
  if (clock.phase !== "half-time") return clock;
  return withDisplayTime({ ...clock, phase: "second-half", running: true, periodSeconds: 0 });
}

export function pauseMatchClock(clock: MatchClockState): MatchClockState {
  if (!clock.running) return clock;
  return { ...clock, running: false };
}

export function resumeMatchClock(clock: MatchClockState): MatchClockState {
  if (clock.phase !== "first-half" && clock.phase !== "second-half") return clock;
  return { ...clock, running: true };
}

export function advanceMatchClock(
  clock: MatchClockState,
  deltaSeconds: number,
  config: MatchCoreConfig,
): MatchClockState {
  if (!clock.running || (clock.phase !== "first-half" && clock.phase !== "second-half")) return clock;
  const delta = Math.max(0, Number.isFinite(deltaSeconds) ? deltaSeconds : 0);
  const periodSeconds = Math.min(config.halfDurationSeconds, clock.periodSeconds + delta);
  const consumed = periodSeconds - clock.periodSeconds;
  const matchSeconds = clock.matchSeconds + consumed;

  if (periodSeconds >= config.halfDurationSeconds) {
    if (clock.phase === "first-half") {
      return withDisplayTime({
        ...clock,
        phase: "half-time",
        running: false,
        periodSeconds: config.halfDurationSeconds,
        matchSeconds,
      });
    }
    return withDisplayTime({
      ...clock,
      phase: "finished",
      running: false,
      periodSeconds: config.halfDurationSeconds,
      matchSeconds,
    });
  }

  return withDisplayTime({ ...clock, periodSeconds, matchSeconds });
}
