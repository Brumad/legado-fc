import { getFoundationAiInput } from "./ai.ts";
import {
  awardGoal,
  claimLooseBall,
  giveRestartPossession,
  recordRestartStat,
  resolveAutomaticSubstitutions,
  resolvePossessionAction,
  resolveTackles,
  tickRestart,
} from "./actions.ts";
import { addMatchStoppage, advanceMatchClock, pauseMatchClock, resumeMatchClock, startMatchClock, startSecondHalfClock } from "./clock.ts";
import { DEFAULT_MATCH_CORE_CONFIG } from "./config.ts";
import { normalizeMatchInput } from "./input.ts";
import { integrateBall, moveMatchPlayer } from "./physics.ts";
import { createRestartForBoundary, evaluateBallBoundary, isActiveMatch, oppositeSide } from "./rules.ts";
import { appendMatchEvent } from "./state.ts";
import type {
  MatchCoreConfig,
  MatchCoreState,
  MatchInputFrame,
  MatchPlayerState,
  MatchRestartState,
  MatchSide,
} from "./types.ts";

function kickoffRestart(state: MatchCoreState, side: MatchSide, config: MatchCoreConfig): MatchRestartState {
  return {
    type: "kickoff",
    side,
    position: { x: state.pitch.length / 2, y: state.pitch.width / 2 },
    ticksRemaining: config.restartDelayTicks,
    label: "Saída de bola",
  };
}

function resetPlayersToShape(players: MatchPlayerState[]): MatchPlayerState[] {
  return players.map((player) => ({
    ...player,
    position: { ...(player.homePosition ?? player.position) },
    velocity: { x: 0, y: 0 },
    facing: { x: player.side === "home" ? 1 : -1, y: 0 },
    actionCooldownTicks: 0,
  }));
}

export function startMatch(
  state: MatchCoreState,
  config: MatchCoreConfig = DEFAULT_MATCH_CORE_CONFIG,
): MatchCoreState {
  const clock = startMatchClock(state.clock);
  if (clock === state.clock) return state;
  const next: MatchCoreState = {
    ...state,
    clock,
    paused: false,
    players: resetPlayersToShape(state.players),
    restart: kickoffRestart(state, "home", config),
    ball: {
      ...state.ball,
      position: { x: state.pitch.length / 2, y: state.pitch.width / 2 },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  };
  return appendMatchEvent(next, { tick: state.tick, type: "kickoff" });
}

export function startSecondHalf(
  state: MatchCoreState,
  config: MatchCoreConfig = DEFAULT_MATCH_CORE_CONFIG,
): MatchCoreState {
  const clock = startSecondHalfClock(state.clock, config);
  if (clock === state.clock) return state;
  const next: MatchCoreState = {
    ...state,
    clock,
    paused: false,
    players: resetPlayersToShape(state.players),
    restart: kickoffRestart(state, "away", config),
    ball: {
      ...state.ball,
      position: { x: state.pitch.length / 2, y: state.pitch.width / 2 },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  };
  return appendMatchEvent(next, { tick: state.tick, type: "second-half" });
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

function withPossessionTick(state: MatchCoreState): MatchCoreState {
  const owner = state.ball.possessionPlayerId
    ? state.players.find((player) => player.id === state.ball.possessionPlayerId)
    : null;
  if (!owner) return state;
  return {
    ...state,
    stats: {
      ...state.stats,
      [owner.side]: {
        ...state.stats[owner.side],
        possessionTicks: state.stats[owner.side].possessionTicks + 1,
      },
    },
  };
}

function resolveBoundary(state: MatchCoreState, config: MatchCoreConfig): MatchCoreState {
  if (state.restart || state.ball.possessionPlayerId) return state;
  const boundary = evaluateBallBoundary(state.ball.position, state.pitch, state.ball.radius);
  if (boundary.kind === "in-play") return state;

  if (boundary.kind === "goal") {
    let next = awardGoal(state, boundary.side);
    const kickoffSide = oppositeSide(boundary.side);
    next = {
      ...next,
      players: resetPlayersToShape(next.players),
      restart: kickoffRestart(next, kickoffSide, config),
      ball: {
        ...next.ball,
        position: { x: next.pitch.length / 2, y: next.pitch.width / 2 },
        velocity: { x: 0, y: 0 },
        possessionPlayerId: null,
        pickupCooldownTicks: config.restartDelayTicks,
      },
    };
    return next;
  }

  const restart = createRestartForBoundary(state, boundary.edge, config.restartDelayTicks);
  let next = appendMatchEvent({ ...state, clock: addMatchStoppage(state.clock, 6) }, { tick: state.tick, type: "ball-out", edge: boundary.edge });
  next = recordRestartStat(next, restart);
  next = {
    ...next,
    restart,
    ball: {
      ...next.ball,
      position: { ...restart.position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  };
  return appendMatchEvent(next, { tick: state.tick, type: "restart", restart: restart.type, side: restart.side });
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
  const inputMap = new Map<string, MatchInputFrame>();
  for (const player of state.players) {
    inputMap.set(
      player.id,
      player.controlled ? controlledInput : getFoundationAiInput(player, state),
    );
  }

  const players = state.players.map((player) => moveMatchPlayer(
    player,
    inputMap.get(player.id) ?? normalizeMatchInput(),
    state,
    deltaSeconds,
    config,
  ));

  let next: MatchCoreState = {
    ...state,
    tick: state.tick + 1,
    players,
    clock: advanceMatchClock(state.clock, deltaSeconds * config.matchClockRate, config),
  };

  if (next.restart) {
    next = tickRestart(next);
    next = giveRestartPossession(next);
  } else {
    next = claimLooseBall(next, config);
    next = resolveTackles(next, inputMap, config);
    next = resolvePossessionAction(next, inputMap, config);
    next = { ...next, ball: integrateBall(next, deltaSeconds, config) };
    next = resolveBoundary(next, config);
  }

  next = resolveAutomaticSubstitutions(next);
  next = withPossessionTick(next);

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

  replaceState(state: MatchCoreState) {
    this.state = state;
    this.accumulator = 0;
    this.currentInput = normalizeMatchInput();
    return this.state;
  }

  start() {
    this.state = startMatch(this.state, this.config);
  }

  startSecondHalf() {
    this.state = startSecondHalf(this.state, this.config);
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
