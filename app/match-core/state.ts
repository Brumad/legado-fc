import { DEFAULT_PITCH } from "./config.ts";
import {
  MatchClockState,
  MatchCoreEvent,
  MatchCoreState,
  MatchPlayerState,
  MatchStateValidation,
  PitchDimensions,
  Vector2,
} from "./types.ts";

function cloneVector(vector: Vector2): Vector2 {
  return { x: vector.x, y: vector.y };
}

export function createMatchClock(): MatchClockState {
  return {
    phase: "pre-match",
    running: false,
    matchSeconds: 0,
    periodSeconds: 0,
    minute: 0,
    second: 0,
  };
}

export function createMatchCoreState(options: {
  matchId: string;
  pitch?: PitchDimensions;
  players?: MatchPlayerState[];
}): MatchCoreState {
  const pitch = options.pitch ?? DEFAULT_PITCH;
  return {
    version: 1,
    matchId: options.matchId,
    tick: 0,
    pitch: { ...pitch },
    clock: createMatchClock(),
    score: { home: 0, away: 0 },
    ball: {
      position: { x: pitch.length / 2, y: pitch.width / 2 },
      velocity: { x: 0, y: 0 },
      radius: 0.11,
      possessionPlayerId: null,
      lastTouchSide: null,
    },
    players: (options.players ?? []).map((player) => ({
      ...player,
      position: cloneVector(player.position),
      velocity: cloneVector(player.velocity),
    })),
    paused: false,
    finished: false,
    events: [],
  };
}

export function appendMatchEvent(state: MatchCoreState, event: MatchCoreEvent): MatchCoreState {
  const events = [...state.events, event];
  return {
    ...state,
    events: events.length > 120 ? events.slice(-120) : events,
  };
}

export function validateMatchCoreState(state: MatchCoreState): MatchStateValidation {
  const errors: string[] = [];
  const finite = (value: number, label: string) => {
    if (!Number.isFinite(value)) errors.push(`${label} não é finito`);
  };

  if (!state.matchId) errors.push("matchId vazio");
  if (state.version !== 1) errors.push(`versão inesperada: ${state.version}`);
  finite(state.tick, "tick");
  finite(state.pitch.length, "pitch.length");
  finite(state.pitch.width, "pitch.width");
  finite(state.ball.position.x, "ball.position.x");
  finite(state.ball.position.y, "ball.position.y");
  finite(state.ball.velocity.x, "ball.velocity.x");
  finite(state.ball.velocity.y, "ball.velocity.y");
  finite(state.clock.matchSeconds, "clock.matchSeconds");
  finite(state.clock.periodSeconds, "clock.periodSeconds");

  if (state.pitch.length <= 0 || state.pitch.width <= 0) errors.push("dimensões do campo inválidas");
  if (state.score.home < 0 || state.score.away < 0) errors.push("placar negativo");

  const ids = new Set<string>();
  for (const player of state.players) {
    if (!player.id) errors.push("jogador sem id");
    if (ids.has(player.id)) errors.push(`jogador duplicado: ${player.id}`);
    ids.add(player.id);
    finite(player.position.x, `${player.id}.position.x`);
    finite(player.position.y, `${player.id}.position.y`);
    finite(player.velocity.x, `${player.id}.velocity.x`);
    finite(player.velocity.y, `${player.id}.velocity.y`);
    finite(player.stamina, `${player.id}.stamina`);
    if (player.stamina < 0 || player.stamina > 100) errors.push(`${player.id}.stamina fora de 0..100`);
  }

  return { valid: errors.length === 0, errors };
}
