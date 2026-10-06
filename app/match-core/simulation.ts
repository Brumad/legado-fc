import { getFoundationAiInput } from "./ai.ts";
import { advanceMatchClock, pauseMatchClock, resumeMatchClock, startMatchClock, startSecondHalfClock } from "./clock.ts";
import { DEFAULT_MATCH_CORE_CONFIG } from "./config.ts";
import { normalizeMatchInput } from "./input.ts";
import { integrateBall, moveMatchPlayer } from "./physics.ts";
import { isActiveMatch } from "./rules.ts";
import { appendMatchEvent } from "./state.ts";
import type { MatchCoreConfig, MatchCoreState, MatchInputFrame } from "./types.ts";

export function startMatch(state: MatchCoreState): MatchCoreState {
  const clock = startMatchClock(state.clock);
  if (clock === state.clock) return state;
  return appendMatchEvent({ ...state, clock, paused: false }, { tick: state.tick, type: "kickoff" });
}

export function startSecondHalf(state: MatchCoreState): MatchCoreState {
  const clock = startSecondHalfClock(state.clock);
  if (clock === state.clock) return state;
  return appendMatchEvent({ ...state, clock, paused: false }, { tick: state.tick, type: "second-half" });
}

export function pauseMatch(state: MatchCoreState): MatchCoreState {
  const clock = pauseMatchClock(state.clock);
  if (clock === state.clock) return state;
  return appendMatchEvent({ ...state, clock, paused: true }, { tick: state.tick, type: "pause" });
}

export function resumeMatch(state: MatchCoreState): MatchCoreState {
  const clock = resumeMatchClock(state.clock);
  if (clock === state.clock) return state;
  return appendMatchEvent({ ...state, clock, paused: false }, { tick: state.tick, type: "resume" });
}

export function abandonMatch(state: MatchCoreState): MatchCoreState {
  if (state.finished) return state;
  const next = {
    ...state,
    paused: false,
    finished: true,
    clock: {
      ...state.clock,
      phase: "abandoned" as const,
      running: false,
    },
  };
  return appendMatchEvent(next, { tick: state.tick, type: "abandon" });
}

export function stepMatchCore(
  state: MatchCoreState,
  rawInput: Partial<MatchInputFrame> = {},
  config: MatchCoreConfig = DEFAULT_MATCH_CORE_CONFIG,
): MatchCoreState {
  if (!isActiveMatch(state)) return state;

  const controlledInput = normalizeMatchInput(rawInput);
  const deltaSeconds = config.fixedDeltaSeconds;
  const previousPhase = state.clock.phase;
  const players = state.players.map((player) => moveMatchPlayer(
    player,
    player.controlled ? controlledInput : getFoundationAiInput(player, state),
    state,
    deltaSeconds,
    config,
  ));

  let next: MatchCoreState = {
    ...state,
    tick: state.tick + 1,
    players,
    ball: integrateBall({ ...state, players }, deltaSeconds, config),
    clock: advanceMatchClock(state.clock, deltaSeconds, config),
  };

  if (previousPhase === "first-half" && next.clock.phase === "half-time") {
    next = appendMatchEvent(next, { tick: next.tick, type: "half-time" });
  }
  if (next.clock.phase === "finished" && previousPhase !== "finished") {
    next = appendMatchEvent({ ...next, finished: true }, { tick: next.tick, type: "full-time" });
  }
  return next;
}

export class FixedStepMatchRuntime {
  private accumulator = 0;
  private currentInput: MatchInputFrame;
  readonly config: MatchCoreConfig;
  state: MatchCoreState;

  constructor(state: MatchCoreState, config: MatchCoreConfig = DEFAULT_MATCH_CORE_CONFIG) {
    this.state = state;
    this.config = config;
    this.currentInput = normalizeMatchInput();
  }

  setInput(input: Partial<MatchInputFrame>) {
    this.currentInput = normalizeMatchInput(input);
  }

  start() {
    this.state = startMatch(this.state);
  }

  startSecondHalf() {
    this.state = startSecondHalf(this.state);
  }

  pause() {
    this.state = pauseMatch(this.state);
    this.accumulator = 0;
  }

  resume() {
    this.state = resumeMatch(this.state);
  }

  abandon() {
    this.state = abandonMatch(this.state);
    this.accumulator = 0;
  }

  advanceFrame(realDeltaSeconds: number) {
    if (!Number.isFinite(realDeltaSeconds) || realDeltaSeconds <= 0) return this.state;
    if (!isActiveMatch(this.state)) {
      this.accumulator = 0;
      return this.state;
    }

    const frameDelta = Math.min(realDeltaSeconds, this.config.maxFrameDeltaSeconds);
    this.accumulator += frameDelta;
    let steps = 0;
    while (this.accumulator + 1e-12 >= this.config.fixedDeltaSeconds && steps < this.config.maxCatchUpSteps) {
      this.state = stepMatchCore(this.state, this.currentInput, this.config);
      this.accumulator -= this.config.fixedDeltaSeconds;
      steps += 1;
      if (!isActiveMatch(this.state)) {
        this.accumulator = 0;
        break;
      }
    }
    if (steps >= this.config.maxCatchUpSteps) {
      this.accumulator = Math.min(this.accumulator, this.config.fixedDeltaSeconds);
    }
    return this.state;
  }
}
