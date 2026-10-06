import { DEFAULT_MATCH_CORE_CONFIG } from "./config";
import { advanceMatchClock, pauseMatchClock, resumeMatchClock, startMatchClock, startSecondHalfClock } from "./clock";
import { normalizeMatchInput } from "./input";
import { appendMatchEvent } from "./state";
import { MatchCoreConfig, MatchCoreState, MatchInputFrame, MatchPlayerState, Vector2 } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function moveControlledPlayer(
  player: MatchPlayerState,
  input: MatchInputFrame,
  state: MatchCoreState,
  deltaSeconds: number,
  config: MatchCoreConfig,
): MatchPlayerState {
  if (!player.active || !player.controlled) return player;
  const hasMove = Math.abs(input.moveX) > 0.001 || Math.abs(input.moveY) > 0.001;
  const sprinting = input.sprint && hasMove && player.stamina > 0;
  const speed = config.playerSpeedMetersPerSecond * (sprinting ? config.sprintMultiplier : 1);
  const velocity: Vector2 = hasMove
    ? { x: input.moveX * speed, y: input.moveY * speed }
    : { x: 0, y: 0 };
  const margin = 0.4;
  const staminaDelta = sprinting
    ? -config.staminaDrainPerSecond * deltaSeconds
    : config.staminaRecoveryPerSecond * deltaSeconds;

  return {
    ...player,
    velocity,
    stamina: clamp(player.stamina + staminaDelta, 0, 100),
    position: {
      x: clamp(player.position.x + velocity.x * deltaSeconds, margin, state.pitch.length - margin),
      y: clamp(player.position.y + velocity.y * deltaSeconds, margin, state.pitch.width - margin),
    },
  };
}

function integrateBall(state: MatchCoreState, deltaSeconds: number, config: MatchCoreConfig) {
  if (state.ball.possessionPlayerId) {
    const owner = state.players.find((player) => player.id === state.ball.possessionPlayerId && player.active);
    if (owner) {
      return {
        ...state.ball,
        position: { x: owner.position.x, y: owner.position.y },
        velocity: { ...owner.velocity },
      };
    }
  }

  const damping = Math.exp(-config.ballFrictionPerSecond * deltaSeconds);
  return {
    ...state.ball,
    position: {
      x: clamp(state.ball.position.x + state.ball.velocity.x * deltaSeconds, 0, state.pitch.length),
      y: clamp(state.ball.position.y + state.ball.velocity.y * deltaSeconds, 0, state.pitch.width),
    },
    velocity: {
      x: state.ball.velocity.x * damping,
      y: state.ball.velocity.y * damping,
    },
  };
}

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

export function stepMatchCore(
  state: MatchCoreState,
  rawInput: Partial<MatchInputFrame> = {},
  config: MatchCoreConfig = DEFAULT_MATCH_CORE_CONFIG,
): MatchCoreState {
  if (state.finished || state.paused || !state.clock.running) return state;
  const input = normalizeMatchInput(rawInput);
  const deltaSeconds = config.fixedDeltaSeconds;
  const previousPhase = state.clock.phase;
  const players = state.players.map((player) => moveControlledPlayer(player, input, state, deltaSeconds, config));
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

  advanceFrame(realDeltaSeconds: number) {
    if (!Number.isFinite(realDeltaSeconds) || realDeltaSeconds <= 0) return this.state;
    if (!this.state.clock.running || this.state.paused || this.state.finished) {
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
      if (!this.state.clock.running || this.state.finished) {
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
