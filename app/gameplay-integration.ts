import type { CareerState, Fixture, MatchApproach, MatchStatistics, Team } from "./game-engine";
import { TEAMS } from "./game-engine";
import { createMatchCoreState } from "./match-core/state";
import type { MatchCoreState, MatchPlayerState, MatchSide } from "./match-core/types";

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
  homeGoals: number;
  awayGoals: number;
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
      velocity: { x: 0, y: 0 },
      stamina: 100,
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
  const opponentSide: MatchSide = fixture.home ? "away" : "home";
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

export function createEmptyPlayableStatistics(): MatchStatistics {
  const empty = {
    possession: 50,
    shots: 0,
    shotsOnTarget: 0,
    bigChances: 0,
    corners: 0,
    fouls: 0,
    offsides: 0,
    yellowCards: 0,
    redCards: 0,
    expectedGoals: 0,
  };
  return {
    playerTeam: { ...empty },
    opponent: { ...empty },
  };
}

export function createPlayableMatchResult(
  state: MatchCoreState,
  context: PlayableMatchContext,
  overrides: Partial<Omit<PlayableMatchResult, "version" | "fixtureId" | "matchId" | "homeGoals" | "awayGoals">> = {},
): PlayableMatchResult {
  if (!state.finished) throw new Error("Não é possível concluir uma partida jogável antes do apito final");
  return {
    version: 1,
    fixtureId: context.fixtureId,
    matchId: state.matchId,
    homeGoals: state.score.home,
    awayGoals: state.score.away,
    goals: 0,
    assists: 0,
    rating: 6,
    minutesPlayed: 90,
    yellowCards: 0,
    redCard: false,
    injuryStatus: "",
    energySpent: 0,
    approach: "Equilibrado",
    statistics: createEmptyPlayableStatistics(),
    ...overrides,
  };
}
