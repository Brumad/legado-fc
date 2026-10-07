import { awardGoal } from "../match-core/actions.ts";
import { oppositeSide } from "../match-core/rules.ts";
import { appendMatchEvent } from "../match-core/state.ts";
import type {
  MatchCoreConfig,
  MatchCoreState,
  MatchPlayerState,
  MatchRestartState,
  MatchSide,
} from "../match-core/types.ts";
import type {
  SetPieceActor,
  SetPieceContext,
  SetPieceCornerSide,
  SetPieceKind,
  SetPieceResult,
  Vector3,
} from "./types.ts";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function actorFromPlayer(player: MatchPlayerState): SetPieceActor {
  const rating = player.role === "GOL"
    ? player.ratings?.goalkeeping ?? 65
    : Math.round((
        (player.ratings?.physical ?? 65) +
        (player.ratings?.shooting ?? 65) +
        (player.ratings?.defending ?? 65)
      ) / 3);
  return {
    playerId: player.id,
    side: player.side,
    role: player.role,
    position: { x: player.position.x, y: 0, z: player.position.y },
    rating,
  };
}

function attackingGoalX(side: MatchSide, pitchLength: number) {
  return side === "home" ? pitchLength : 0;
}

function distanceToGoal(state: MatchCoreState, side: MatchSide, position: { x: number; y: number }) {
  return Math.hypot(attackingGoalX(side, state.pitch.length) - position.x, state.pitch.width / 2 - position.y);
}

function classifyFreeKick(state: MatchCoreState, side: MatchSide): SetPieceKind {
  if (!state.restart) return "free-kick-direct";
  const distance = distanceToGoal(state, side, state.restart.position);
  const lateral = Math.abs(state.restart.position.y - state.pitch.width / 2);
  return distance <= 31 && lateral <= 18 ? "free-kick-direct" : "free-kick-cross";
}

function buildWall(
  state: MatchCoreState,
  attackingSide: MatchSide,
  origin: Vector3,
  defenders: SetPieceActor[],
): SetPieceActor[] {
  const goalX = attackingGoalX(attackingSide, state.pitch.length);
  const goalZ = state.pitch.width / 2;
  const dx = goalX - origin.x;
  const dz = goalZ - origin.z;
  const horizontal = Math.max(0.1, Math.hypot(dx, dz));
  const dirX = dx / horizontal;
  const dirZ = dz / horizontal;
  const wallCenter = {
    x: origin.x + dirX * 9.15,
    y: 0,
    z: origin.z + dirZ * 9.15,
  };
  const distance = Math.hypot(dx, dz);
  const count = clamp(Math.round(5 - (distance - 18) / 9), 2, 5);
  return defenders.slice(0, count).map((defender, index) => ({
    ...defender,
    position: {
      x: wallCenter.x - dirZ * (index - (count - 1) / 2) * 0.72,
      y: 0,
      z: wallCenter.z + dirX * (index - (count - 1) / 2) * 0.72,
    },
  }));
}

function cornerSide(state: MatchCoreState): SetPieceCornerSide {
  return (state.restart?.position.y ?? 0) < state.pitch.width / 2 ? "top" : "bottom";
}

export function canEnter3DSetPiece(
  state: MatchCoreState,
  controlledPlayerId: string,
) {
  if (!state.restart || (state.restart.type !== "free-kick" && state.restart.type !== "corner")) return false;
  const controlled = state.players.find((player) => player.id === controlledPlayerId && player.active && !player.redCard);
  return Boolean(controlled && controlled.side === state.restart.side);
}

export function createSetPieceContextFromMatch(
  state: MatchCoreState,
  controlledPlayerId: string,
  foot: "Direito" | "Esquerdo" = "Direito",
): SetPieceContext | null {
  if (!canEnter3DSetPiece(state, controlledPlayerId) || !state.restart) return null;
  const taker = state.players.find((player) => player.id === controlledPlayerId)!;
  const attackingSide = state.restart.side;
  const defendingSide = oppositeSide(attackingSide);
  const goalX = attackingGoalX(attackingSide, state.pitch.length);
  const defenders = state.players
    .filter((player) => player.active && !player.redCard && player.side === defendingSide)
    .map(actorFromPlayer);
  const attackers = state.players
    .filter((player) => player.active && !player.redCard && player.side === attackingSide && player.id !== taker.id)
    .map(actorFromPlayer);
  const keeperPlayer = state.players.find((player) => player.active && !player.redCard && player.side === defendingSide && player.role === "GOL")
    ?? state.players.find((player) => player.active && !player.redCard && player.side === defendingSide);
  if (!keeperPlayer) return null;

  const kind = state.restart.type === "corner" ? "corner" : classifyFreeKick(state, attackingSide);
  const origin = { x: state.restart.position.x, y: 0.11, z: state.restart.position.y };
  const keeperRating = keeperPlayer.ratings?.goalkeeping ?? 62;
  const difficulty = state.teamSetup[defendingSide].difficulty;
  const reactionModifier = difficulty === "Lenda" ? -0.08 : difficulty === "Promessa" ? 0.09 : 0;
  const keeperX = goalX + (attackingSide === "home" ? -0.35 : 0.35);

  return {
    id: `${state.matchId}:${state.tick}:${state.restart.type}:${attackingSide}`,
    matchId: state.matchId,
    kind,
    attackingSide,
    defendingSide,
    takerId: taker.id,
    origin2D: { ...state.restart.position },
    origin,
    goalX,
    goalCenterZ: state.pitch.width / 2,
    goalWidth: 7.32,
    goalHeight: 2.44,
    distanceToGoal: distanceToGoal(state, attackingSide, state.restart.position),
    cornerSide: state.restart.type === "corner" ? cornerSide(state) : undefined,
    wall: kind === "free-kick-direct" ? buildWall(state, attackingSide, origin, defenders.filter((actor) => actor.role !== "GOL")) : [],
    attackers,
    defenders: defenders.filter((actor) => actor.playerId !== keeperPlayer.id),
    keeper: {
      playerId: keeperPlayer.id,
      goalkeeping: keeperRating,
      position: { x: keeperX, y: 0.9, z: state.pitch.width / 2 },
      reactionDelay: clamp(0.5 - keeperRating / 260 + reactionModifier, 0.12, 0.52),
      maxSpeed: clamp(4.5 + keeperRating / 18, 6, 10),
      reach: clamp(0.95 + keeperRating / 145, 1.25, 1.65),
    },
    technique: {
      shooting: taker.ratings?.shooting ?? 65,
      passing: taker.ratings?.passing ?? 65,
      dribbling: taker.ratings?.dribbling ?? 65,
      physical: taker.ratings?.physical ?? 65,
      foot,
    },
  };
}

function kickoffRestart(state: MatchCoreState, side: MatchSide, config: MatchCoreConfig): MatchRestartState {
  return {
    type: "kickoff",
    side,
    position: { x: state.pitch.length / 2, y: state.pitch.width / 2 },
    ticksRemaining: config.restartDelayTicks,
    label: "Saída de bola",
  };
}

function incrementTeamShot(state: MatchCoreState, side: MatchSide, takerId: string) {
  const player = state.stats.players[takerId];
  return {
    ...state,
    stats: {
      ...state.stats,
      [side]: { ...state.stats[side], shots: state.stats[side].shots + 1 },
      players: player
        ? { ...state.stats.players, [takerId]: { ...player, shots: player.shots + 1 } }
        : state.stats.players,
    },
  };
}

export function applySetPieceResultToMatch(
  baseState: MatchCoreState,
  result: SetPieceResult,
  config: MatchCoreConfig,
): MatchCoreState {
  let state: MatchCoreState = {
    ...baseState,
    paused: false,
    clock: {
      ...baseState.clock,
      running: baseState.clock.phase === "first-half" || baseState.clock.phase === "second-half",
    },
    restart: null,
  };

  if (result.kind === "free-kick-direct") state = incrementTeamShot(state, result.attackingSide, result.takerId);

  if (result.goal) {
    state = {
      ...state,
      ball: {
        ...state.ball,
        lastTouchPlayerId: result.receiverId ?? result.takerId,
        lastTouchSide: result.attackingSide,
        previousTouchPlayerId: result.receiverId ? result.takerId : state.ball.previousTouchPlayerId,
      },
    };
    state = awardGoal(state, result.attackingSide);
    const kickoffSide = oppositeSide(result.attackingSide);
    state = {
      ...state,
      restart: kickoffRestart(state, kickoffSide, config),
      ball: {
        ...state.ball,
        position: { x: state.pitch.length / 2, y: state.pitch.width / 2 },
        velocity: { x: 0, y: 0 },
        possessionPlayerId: null,
        pickupCooldownTicks: config.restartDelayTicks,
      },
    };
  } else if (result.saved) {
    state = {
      ...state,
      ball: {
        ...state.ball,
        position: { ...result.endPosition2D },
        velocity: { x: 0, y: 0 },
        possessionPlayerId: result.keeperId,
        lastTouchPlayerId: result.keeperId,
        lastTouchSide: result.defendingSide,
        pickupCooldownTicks: 0,
      },
    };
  } else if (result.outcome === "wide") {
    const x = result.defendingSide === "home" ? 5.5 : state.pitch.length - 5.5;
    state = {
      ...state,
      restart: {
        type: "goal-kick",
        side: result.defendingSide,
        position: { x, y: state.pitch.width / 2 },
        ticksRemaining: config.restartDelayTicks,
        label: "Tiro de meta",
      },
      ball: {
        ...state.ball,
        position: { x, y: state.pitch.width / 2 },
        velocity: { x: 0, y: 0 },
        possessionPlayerId: null,
        lastTouchPlayerId: result.takerId,
        lastTouchSide: result.attackingSide,
        pickupCooldownTicks: config.restartDelayTicks,
      },
    };
  } else {
    state = {
      ...state,
      ball: {
        ...state.ball,
        position: {
          x: clamp(result.endPosition2D.x, 0.15, state.pitch.length - 0.15),
          y: clamp(result.endPosition2D.y, 0.15, state.pitch.width - 0.15),
        },
        velocity: { ...result.endVelocity2D },
        possessionPlayerId: null,
        lastTouchPlayerId: result.receiverId ?? result.takerId,
        lastTouchSide: result.attackingSide,
        pickupCooldownTicks: 5,
      },
    };
  }

  return appendMatchEvent(state, {
    tick: state.tick,
    type: "set-piece-3d",
    side: result.attackingSide,
    kind: result.kind,
    outcome: result.outcome,
  });
}
