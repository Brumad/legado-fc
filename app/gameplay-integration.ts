import type { CareerState, Fixture, MatchApproach, MatchStatistics, Team } from "./game-engine.ts";
import { TEAMS } from "./game-engine.ts";
import { createMatchCoreState } from "./match-core/state.ts";
import type { MatchCoreState, MatchPlayerState, MatchSide } from "./match-core/types.ts";

export type PlayableMatchContext = {
  careerId: string;
  fixtureId: string;
  controlledPlayerId: string;
  playerSide: MatchSide;
  homeTeamId: string;
  awayTeamId: string;
};

export type PlayableMatchResult = {
  version: 1;
  fixtureId: string;
  matchId: string;
  playerSide: MatchSide;
  homeGoals: number;
  awayGoals: number;
  playerTeamGoals: number;
  opponentGoals: number;
  goals: number;
  assists: number;
  rating: number;
  minutesPlayed: number;
  yellowCards: number;
  redCard: boolean;
  injuryStatus: string;
  energySpent: number;
  approach: MatchApproach;
  statistics: MatchStatistics;
};

const homeShape = [
  [6, 34], [20, 8], [18, 25], [18, 43], [20, 60],
  [38, 20], [38, 48], [54, 34], [58, 10], [58, 58], [68, 34],
] as const;

function mirrorX(x: number) {
  return 105 - x;
}

function teamPlayers(team: Team, side: MatchSide, controlledPlayerId: string | null): MatchPlayerState[] {
  return team.squad.slice(0, 11).map((player, index) => {
    const base = homeShape[index] ?? homeShape[homeShape.length - 1];
    const position = side === "home"
      ? { x: base[0], y: base[1] }
      : { x: mirrorX(base[0]), y: base[1] };
    return {
      id: controlledPlayerId && index === 7 ? controlledPlayerId : player.id,
      side,
      role: player.position,
      controlled: Boolean(controlledPlayerId && index === 7),
      active: true,
      position,
      homePosition: { ...position },
      velocity: { x: 0, y: 0 },
      facing: { x: side === "home" ? 1 : -1, y: 0 },
      stamina: 100,
      actionCooldownTicks: 0,
    };
  });
}

function findCareerTeam(career: CareerState) {
  const team = TEAMS.find((candidate) => candidate.id === career.clubId);
  if (!team) throw new Error(`Clube da carreira não encontrado: ${career.clubId}`);
  return team;
}

export function createPlayableMatchState(
  career: CareerState,
  fixture: Fixture,
): { state: MatchCoreState; context: PlayableMatchContext } {
  const careerTeam = findCareerTeam(career);
  const playerSide: MatchSide = fixture.home ? "home" : "away";
  const controlledPlayerId = `career-player-${career.id}`;
  const homeTeam = fixture.home ? careerTeam : fixture.opponent;
  const awayTeam = fixture.home ? fixture.opponent : careerTeam;

  const players = [
    ...teamPlayers(homeTeam, "home", playerSide === "home" ? controlledPlayerId : null),
    ...teamPlayers(awayTeam, "away", playerSide === "away" ? controlledPlayerId : null),
  ];

  if (players.length !== 22) {
    throw new Error(`Partida jogável exige 22 jogadores; recebidos ${players.length}`);
  }
  if (players.filter((player) => player.controlled).length !== 1) {
    throw new Error("Partida jogável exige exatamente um atleta controlado");
  }

  const state = createMatchCoreState({
    matchId: `playable-${career.id}-${fixture.id}`,
    players,
  });

  return {
    state,
    context: {
      careerId: career.id,
      fixtureId: fixture.id,
      controlledPlayerId,
      playerSide,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
    },
  };
}

function possessionPercent(state: MatchCoreState, side: MatchSide) {
  const total = state.stats.home.possessionTicks + state.stats.away.possessionTicks;
  if (!total) return 50;
  return Math.round(state.stats[side].possessionTicks / total * 100);
}

export function createPlayableMatchStatistics(
  state: MatchCoreState,
  context: PlayableMatchContext,
): MatchStatistics {
  const playerSide = context.playerSide;
  const opponentSide: MatchSide = playerSide === "home" ? "away" : "home";
  const own = state.stats[playerSide];
  const rival = state.stats[opponentSide];
  const ownGoals = state.score[playerSide];
  const rivalGoals = state.score[opponentSide];

  return {
    playerTeam: {
      possession: possessionPercent(state, playerSide),
      shots: own.shots,
      shotsOnTarget: Math.max(ownGoals, Math.round(own.shots * 0.38)),
      bigChances: Math.max(ownGoals, Math.round(own.shots * 0.2)),
      corners: own.corners,
      fouls: own.fouls,
      offsides: 0,
      yellowCards: 0,
      redCards: 0,
      expectedGoals: Math.round((own.shots * 0.11 + ownGoals * 0.18) * 100) / 100,
    },
    opponent: {
      possession: possessionPercent(state, opponentSide),
      shots: rival.shots,
      shotsOnTarget: Math.max(rivalGoals, Math.round(rival.shots * 0.38)),
      bigChances: Math.max(rivalGoals, Math.round(rival.shots * 0.2)),
      corners: rival.corners,
      fouls: rival.fouls,
      offsides: 0,
      yellowCards: 0,
      redCards: 0,
      expectedGoals: Math.round((rival.shots * 0.11 + rivalGoals * 0.18) * 100) / 100,
    },
  };
}

export function createPlayableMatchResult(
  state: MatchCoreState,
  context: PlayableMatchContext,
  overrides: Partial<Omit<PlayableMatchResult, "version" | "fixtureId" | "matchId" | "playerSide" | "homeGoals" | "awayGoals" | "playerTeamGoals" | "opponentGoals">> = {},
): PlayableMatchResult {
  if (!state.finished) throw new Error("Não é possível concluir uma partida jogável antes do apito final");
  const controlled = state.players.find((player) => player.id === context.controlledPlayerId);
  const playerStats = state.stats.players[context.controlledPlayerId];
  const playerTeamGoals = state.score[context.playerSide];
  const opponentSide: MatchSide = context.playerSide === "home" ? "away" : "home";
  const opponentGoals = state.score[opponentSide];
  const rating = Math.max(4, Math.min(10,
    6 +
    (playerStats?.goals ?? 0) * 1.25 +
    (playerStats?.assists ?? 0) * 0.75 +
    (playerStats?.tackles ?? 0) * 0.08 +
    (playerStats?.completedPasses ?? 0) * 0.015 -
    (playerStats?.fouls ?? 0) * 0.08
  ));

  return {
    version: 1,
    fixtureId: context.fixtureId,
    matchId: state.matchId,
    playerSide: context.playerSide,
    homeGoals: state.score.home,
    awayGoals: state.score.away,
    playerTeamGoals,
    opponentGoals,
    goals: playerStats?.goals ?? 0,
    assists: playerStats?.assists ?? 0,
    rating: Math.round(rating * 10) / 10,
    minutesPlayed: 90,
    yellowCards: 0,
    redCard: false,
    injuryStatus: "",
    energySpent: Math.max(0, Math.round(100 - (controlled?.stamina ?? 100))),
    approach: "Equilibrado",
    statistics: createPlayableMatchStatistics(state, context),
    ...overrides,
  };
}
