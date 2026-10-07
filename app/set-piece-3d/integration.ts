import {
  DEFAULT_MATCH_CORE_CONFIG,
  addMatchStoppage,
  appendMatchEvent,
  oppositeSide,
} from "../match-core/index.ts";
import type {
  MatchCoreConfig,
  MatchCoreState,
  MatchPlayerRatings,
  MatchPlayerState,
  MatchSide,
} from "../match-core/types.ts";
import {
  DEFAULT_SET_PIECE_INPUT,
  resolveSetPiece3D,
} from "./physics.ts";
import type {
  SetPiece3DRequest,
  SetPiece3DResult,
  SetPieceEligibility,
  SetPieceInput,
  SetPieceRendererMode,
} from "./types.ts";

const fallbackRatings: MatchPlayerRatings = {
  pace: 65, shooting: 62, passing: 64, dribbling: 64,
  defending: 62, physical: 65, goalkeeping: 20,
};

function distanceToGoal(state: MatchCoreState, side: MatchSide) {
  const goalX = side === "home" ? state.pitch.length : 0;
  const dx = goalX - state.restart!.position.x;
  const dy = state.pitch.width / 2 - state.restart!.position.y;
  return Math.hypot(dx, dy);
}

function activeKeeper(state: MatchCoreState, side: MatchSide) {
  return state.players.find((player) =>
    player.side === side && player.active && !player.redCard && player.role === "GOL"
  ) ?? state.players.find((player) => player.side === side && player.active && !player.redCard);
}

function controlledTaker(state: MatchCoreState, controlledPlayerId: string) {
  return state.players.find((player) =>
    player.id === controlledPlayerId && player.active && !player.redCard && !player.substituted
  );
}

function setPieceKind(state: MatchCoreState): SetPiece3DRequest["kind"] | null {
  if (state.restart?.type === "corner") return "corner";
  if (state.restart?.type !== "free-kick") return null;
  const distance = distanceToGoal(state, state.restart.side);
  const lateral = Math.abs(state.restart.position.y - state.pitch.width / 2);
  return distance <= 31.5 && lateral <= 23 ? "free-kick-direct" : "free-kick-cross";
}

export function createSetPiece3DRequest(
  state: MatchCoreState,
  controlledPlayerId: string,
): SetPieceEligibility {
  const restart = state.restart;
  if (!restart) return { eligible: false, reason: "Sem bola parada ativa.", request: null };
  const kind = setPieceKind(state);
  if (!kind) return { eligible: false, reason: "Reinício não suportado em 3D.", request: null };
  const taker = controlledTaker(state, controlledPlayerId);
  if (!taker) return { eligible: false, reason: "Atleta controlado indisponível.", request: null };
  if (restart.side !== taker.side) return { eligible: false, reason: "Cobrança pertence ao adversário.", request: null };

  const defendingSide = oppositeSide(restart.side);
  const keeper = activeKeeper(state, defendingSide);
  if (!keeper) return { eligible: false, reason: "Goleiro adversário indisponível.", request: null };

  const goalX2D = restart.side === "home" ? state.pitch.length : 0;
  const distance = distanceToGoal(state, restart.side);
  const goalOffsetX = state.pitch.width / 2 - restart.position.y;
  const wallCount = kind === "free-kick-direct"
    ? distance < 20 ? 5 : distance < 27 ? 4 : 3
    : 0;
  const cornerEdge = kind === "corner"
    ? restart.position.y < state.pitch.width / 2 ? "top" : "bottom"
    : null;

  const areaPlayers = state.players
    .filter((player) => player.active && !player.redCard)
    .map((player) => ({
      id: player.id,
      side: player.side,
      role: player.role,
      position: { ...player.position },
      ratings: { ...fallbackRatings, ...(player.ratings ?? {}) },
    }));

  return {
    eligible: true,
    reason: "Cobrança 3D disponível.",
    request: {
      id: `${state.matchId}:${state.tick}:${restart.type}:${restart.side}`,
      kind,
      matchId: state.matchId,
      tick: state.tick,
      attackingSide: restart.side,
      defendingSide,
      takerId: taker.id,
      keeperId: keeper.id,
      restart: { ...restart, position: { ...restart.position } },
      origin2D: { ...restart.position },
      goalX2D,
      goalCenterY2D: state.pitch.width / 2,
      distanceToGoal: distance,
      goalOffsetX,
      wallCount,
      cornerEdge,
      takerRatings: { ...fallbackRatings, ...(taker.ratings ?? {}) },
      keeperRatings: { ...fallbackRatings, ...(keeper.ratings ?? {}) },
      areaPlayers,
      snapshot: {
        score: { ...state.score },
        clock: { ...state.clock },
      },
    },
  };
}

function addTeamStat(state: MatchCoreState, side: MatchSide, key: "shots" | "completedPasses") {
  return {
    ...state,
    stats: {
      ...state.stats,
      [side]: {
        ...state.stats[side],
        [key]: state.stats[side][key] + 1,
      },
    },
  };
}

function addPlayerStat(state: MatchCoreState, playerId: string, key: "goals" | "assists" | "shots" | "completedPasses") {
  const current = state.stats.players[playerId];
  if (!current) return state;
  return {
    ...state,
    stats: {
      ...state.stats,
      players: {
        ...state.stats.players,
        [playerId]: { ...current, [key]: current[key] + 1 },
      },
    },
  };
}

function kickoffAfterGoal(
  state: MatchCoreState,
  side: MatchSide,
  config: MatchCoreConfig,
): MatchCoreState {
  const center = { x: state.pitch.length / 2, y: state.pitch.width / 2 };
  return {
    ...state,
    restart: {
      type: "kickoff",
      side,
      position: center,
      ticksRemaining: config.restartDelayTicks,
      label: "Saída de bola",
    },
    ball: {
      ...state.ball,
      position: center,
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  };
}

function givePossession(state: MatchCoreState, playerId: string | null, side: MatchSide) {
  const player = playerId
    ? state.players.find((candidate) => candidate.id === playerId && candidate.active && !candidate.redCard)
    : state.players.find((candidate) => candidate.side === side && candidate.active && !candidate.redCard);
  if (!player) return state;
  return {
    ...state,
    restart: null,
    ball: {
      ...state.ball,
      position: { ...player.position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: player.id,
      previousTouchPlayerId: state.ball.lastTouchPlayerId,
      lastTouchPlayerId: player.id,
      lastTouchSide: player.side,
      pickupCooldownTicks: 0,
    },
  };
}

function goalKick(
  state: MatchCoreState,
  defendingSide: MatchSide,
  config: MatchCoreConfig,
): MatchCoreState {
  const x = defendingSide === "home" ? 5.5 : state.pitch.length - 5.5;
  const position = { x, y: state.pitch.width / 2 };
  return {
    ...state,
    restart: {
      type: "goal-kick",
      side: defendingSide,
      position,
      ticksRemaining: config.restartDelayTicks,
      label: "Tiro de meta",
    },
    ball: {
      ...state.ball,
      position,
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  };
}

export function applySetPiece3DResult(
  state: MatchCoreState,
  request: SetPiece3DRequest,
  result: SetPiece3DResult,
  config: MatchCoreConfig = DEFAULT_MATCH_CORE_CONFIG,
): MatchCoreState {
  if (result.requestId !== request.id) throw new Error("Resultado 3D pertence a outra cobrança.");
  if (!state.restart || state.restart.type !== request.restart.type || state.restart.side !== request.attackingSide) {
    throw new Error("Estado 2D mudou antes do retorno da cobrança 3D.");
  }

  const preservedClock = { ...state.clock };
  let next: MatchCoreState = {
    ...state,
    clock: preservedClock,
    ball: {
      ...state.ball,
      lastTouchPlayerId: result.winnerPlayerId ?? request.takerId,
      lastTouchSide: result.winnerSide ?? request.attackingSide,
    },
  };

  if (request.kind === "free-kick-direct") {
    next = addTeamStat(next, request.attackingSide, "shots");
    next = addPlayerStat(next, request.takerId, "shots");
  }

  if (result.outcome === "goal") {
    const scorerId = result.winnerPlayerId && result.winnerSide === request.attackingSide
      ? result.winnerPlayerId
      : request.takerId;
    next = {
      ...next,
      score: { ...next.score, [request.attackingSide]: next.score[request.attackingSide] + 1 },
      clock: addMatchStoppage(preservedClock, 18),
    };
    next = addPlayerStat(next, scorerId, "goals");
    if (scorerId !== request.takerId && request.kind !== "free-kick-direct") {
      next = addPlayerStat(next, request.takerId, "assists");
      next = addTeamStat(next, request.attackingSide, "completedPasses");
      next = addPlayerStat(next, request.takerId, "completedPasses");
    }
    next = appendMatchEvent(next, {
      tick: state.tick,
      type: "goal",
      side: request.attackingSide,
      scorerId,
      assistId: scorerId !== request.takerId ? request.takerId : undefined,
    });
    next = kickoffAfterGoal(next, request.defendingSide, config);
  } else if (result.outcome === "saved") {
    next = givePossession(next, request.keeperId, request.defendingSide);
  } else if (result.outcome === "out") {
    next = goalKick(next, request.defendingSide, config);
  } else if (result.outcome === "cleared") {
    next = givePossession(next, result.winnerPlayerId, request.defendingSide);
  } else {
    next = givePossession(next, result.winnerPlayerId, result.winnerSide ?? request.attackingSide);
  }

  return appendMatchEvent(next, {
    tick: state.tick,
    type: "set-piece-3d",
    setPiece: request.kind,
    outcome: result.outcome,
    playerId: request.takerId,
    side: request.attackingSide,
    renderer: result.renderer,
  });
}

export function resolveSetPieceFallback(
  state: MatchCoreState,
  controlledPlayerId: string,
  input: SetPieceInput = DEFAULT_SET_PIECE_INPUT,
  config: MatchCoreConfig = DEFAULT_MATCH_CORE_CONFIG,
): { state: MatchCoreState; result: SetPiece3DResult | null } {
  const eligibility = createSetPiece3DRequest(state, controlledPlayerId);
  if (!eligibility.request) return { state, result: null };
  const result = resolveSetPiece3D(eligibility.request, input, "fallback-2d");
  return {
    state: applySetPiece3DResult(state, eligibility.request, result, config),
    result,
  };
}

export function preservedSetPieceFields(before: MatchCoreState, after: MatchCoreState) {
  return {
    matchId: before.matchId === after.matchId,
    minute: before.clock.minute === after.clock.minute,
    second: before.clock.second === after.clock.second,
    yellowCards: before.stats.home.yellowCards === after.stats.home.yellowCards
      && before.stats.away.yellowCards === after.stats.away.yellowCards,
    redCards: before.stats.home.redCards === after.stats.home.redCards
      && before.stats.away.redCards === after.stats.away.redCards,
    injuries: before.stats.home.injuries === after.stats.home.injuries
      && before.stats.away.injuries === after.stats.away.injuries,
  };
}
