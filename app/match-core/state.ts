import { DEFAULT_PITCH, MATCH_CORE_SCHEMA_VERSION } from "./config.ts";
import type {
  MatchClockState,
  MatchCoreEvent,
  MatchCoreState,
  MatchPlayerRatings,
  MatchPlayerRuntimeStats,
  MatchPlayerState,
  MatchRuntimeStats,
  MatchStateValidation,
  MatchTacticalProfile,
  MatchTeamRuntimeStats,
  MatchTeamSetup,
  PitchDimensions,
  Vector2,
} from "./types.ts";

function cloneVector(vector: Vector2): Vector2 { return { x: vector.x, y: vector.y }; }

export const DEFAULT_PLAYER_RATINGS: MatchPlayerRatings = {
  pace: 65, shooting: 62, passing: 64, dribbling: 64, defending: 62, physical: 65, goalkeeping: 20,
};

export const DEFAULT_TACTIC: MatchTacticalProfile = {
  id: "equilibrado",
  name: "Equilibrado",
  formation: "4-3-3",
  pressing: 55,
  tempo: 58,
  defensiveLine: 55,
  width: 60,
  aggression: 55,
  risk: 50,
};

export const DEFAULT_TEAM_SETUP: MatchTeamSetup = {
  difficulty: "Profissional",
  tactic: DEFAULT_TACTIC,
  rivalryLevel: 0,
};

export function createEmptyTeamStats(): MatchTeamRuntimeStats {
  return {
    possessionTicks: 0, shots: 0, passes: 0, completedPasses: 0, tackles: 0, fouls: 0,
    corners: 0, throwIns: 0, offsides: 0, yellowCards: 0, redCards: 0, substitutions: 0, injuries: 0,
  };
}

export function createEmptyPlayerStats(): MatchPlayerRuntimeStats {
  return {
    goals: 0, assists: 0, shots: 0, passes: 0, completedPasses: 0, tackles: 0, fouls: 0, touches: 0,
    offsides: 0, yellowCards: 0, redCards: 0,
  };
}

export function createRuntimeStats(players: MatchPlayerState[]): MatchRuntimeStats {
  return {
    home: createEmptyTeamStats(),
    away: createEmptyTeamStats(),
    players: Object.fromEntries(players.map((player) => [player.id, createEmptyPlayerStats()])),
  };
}

export function createMatchClock(): MatchClockState {
  return { phase: "pre-match", running: false, matchSeconds: 0, periodSeconds: 0, minute: 0, second: 0, addedTimeSeconds: 0 };
}

export function createMatchCoreState(options: {
  matchId: string;
  pitch?: PitchDimensions;
  players?: MatchPlayerState[];
  teamSetup?: Partial<Record<"home" | "away", MatchTeamSetup>>;
}): MatchCoreState {
  const pitch = options.pitch ?? DEFAULT_PITCH;
  const players = (options.players ?? []).map((player) => ({
    ...player,
    position: cloneVector(player.position),
    homePosition: cloneVector(player.homePosition ?? player.position),
    velocity: cloneVector(player.velocity),
    facing: cloneVector(player.facing ?? { x: player.side === "home" ? 1 : -1, y: 0 }),
    ratings: { ...DEFAULT_PLAYER_RATINGS, ...(player.ratings ?? {}) },
    actionCooldownTicks: player.actionCooldownTicks ?? 0,
    yellowCards: player.yellowCards ?? 0,
    redCard: player.redCard ?? false,
    injured: player.injured ?? false,
    injurySeverity: player.injurySeverity ?? "",
    substituted: player.substituted ?? false,
  }));
  return {
    version: MATCH_CORE_SCHEMA_VERSION,
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
      lastTouchPlayerId: null,
      previousTouchPlayerId: null,
      pickupCooldownTicks: 0,
    },
    players,
    teamSetup: {
      home: { ...DEFAULT_TEAM_SETUP, ...(options.teamSetup?.home ?? {}), tactic: { ...DEFAULT_TACTIC, ...(options.teamSetup?.home?.tactic ?? {}) } },
      away: { ...DEFAULT_TEAM_SETUP, ...(options.teamSetup?.away ?? {}), tactic: { ...DEFAULT_TACTIC, ...(options.teamSetup?.away?.tactic ?? {}) } },
    },
    restart: null,
    stats: createRuntimeStats(players),
    paused: false,
    finished: false,
    events: [],
  };
}

export function appendMatchEvent(state: MatchCoreState, event: MatchCoreEvent): MatchCoreState {
  const events = [...state.events, event];
  return { ...state, events: events.length > 220 ? events.slice(-220) : events };
}

export function validateMatchCoreState(state: MatchCoreState): MatchStateValidation {
  const errors: string[] = [];
  const finite = (value: number, label: string) => { if (!Number.isFinite(value)) errors.push(`${label} não é finito`); };
  if (!state.matchId) errors.push("matchId vazio");
  if (state.version !== MATCH_CORE_SCHEMA_VERSION) errors.push(`versão inesperada: ${state.version}`);
  finite(state.tick, "tick"); finite(state.pitch.length, "pitch.length"); finite(state.pitch.width, "pitch.width");
  finite(state.ball.position.x, "ball.position.x"); finite(state.ball.position.y, "ball.position.y");
  finite(state.ball.velocity.x, "ball.velocity.x"); finite(state.ball.velocity.y, "ball.velocity.y");
  finite(state.clock.matchSeconds, "clock.matchSeconds"); finite(state.clock.periodSeconds, "clock.periodSeconds");
  if (state.pitch.length <= 0 || state.pitch.width <= 0) errors.push("dimensões do campo inválidas");
  if (state.score.home < 0 || state.score.away < 0) errors.push("placar negativo");

  const ids = new Set<string>();
  for (const player of state.players) {
    if (!player.id) errors.push("jogador sem id");
    if (ids.has(player.id)) errors.push(`jogador duplicado: ${player.id}`);
    ids.add(player.id);
    finite(player.position.x, `${player.id}.position.x`); finite(player.position.y, `${player.id}.position.y`);
    finite(player.velocity.x, `${player.id}.velocity.x`); finite(player.velocity.y, `${player.id}.velocity.y`);
    finite(player.stamina, `${player.id}.stamina`);
    if (player.stamina < 0 || player.stamina > 100) errors.push(`${player.id}.stamina fora de 0..100`);
    if (player.ratings) for (const [key, value] of Object.entries(player.ratings)) finite(value, `${player.id}.ratings.${key}`);
  }
  if (state.ball.possessionPlayerId && !ids.has(state.ball.possessionPlayerId)) errors.push("posse aponta para jogador inexistente");
  return { valid: errors.length === 0, errors };
}
