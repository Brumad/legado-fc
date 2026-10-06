import type { CareerState, Fixture, MatchApproach, MatchStatistics, OpponentTactic, PlayerAttributes, Team } from "./game-engine.ts";
import { generateMatchPlan, TEAMS } from "./game-engine.ts";
import { createMatchCoreState } from "./match-core/state.ts";
import type {
  MatchCoreState,
  MatchPlayerRatings,
  MatchPlayerState,
  MatchSide,
  MatchTacticalProfile,
  MatchTeamSetup,
} from "./match-core/types.ts";

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

function mirrorX(x: number) { return 105 - x; }
function clamp(value: number, min=35, max=95) { return Math.max(min, Math.min(max, Math.round(value))); }

function squadRatings(overall: number, role: string): MatchPlayerRatings {
  const base = overall;
  return {
    pace: clamp(base + (["PD","PE","LD","LE"].includes(role) ? 5 : role === "GOL" ? -18 : 0)),
    shooting: clamp(base + (["ATA","PD","PE"].includes(role) ? 5 : role === "GOL" ? -28 : -3)),
    passing: clamp(base + (["MEI","VOL"].includes(role) ? 5 : role === "GOL" ? -6 : 0)),
    dribbling: clamp(base + (["MEI","PD","PE"].includes(role) ? 4 : role === "GOL" ? -18 : -1)),
    defending: clamp(base + (["ZAG","VOL","LD","LE"].includes(role) ? 6 : role === "ATA" ? -12 : role === "GOL" ? -5 : 0)),
    physical: clamp(base + (["ZAG","VOL","ATA"].includes(role) ? 4 : 0)),
    goalkeeping: clamp(role === "GOL" ? base + 8 : 20, 10, 96),
  };
}

function careerRatings(attributes: PlayerAttributes): MatchPlayerRatings {
  return {
    pace: attributes.pace,
    shooting: attributes.shooting,
    passing: attributes.passing,
    dribbling: attributes.dribbling,
    defending: attributes.defending,
    physical: attributes.physical,
    goalkeeping: 20,
  };
}

function teamPlayers(
  team: Team,
  side: MatchSide,
  controlledPlayerId: string | null,
  career?: CareerState,
): MatchPlayerState[] {
  return team.squad.slice(0, 11).map((player, index) => {
    const base = homeShape[index] ?? homeShape[homeShape.length - 1];
    const position = side === "home" ? { x: base[0], y: base[1] } : { x: mirrorX(base[0]), y: base[1] };
    const controlled = Boolean(controlledPlayerId && index === 7);
    return {
      id: controlled ? controlledPlayerId! : player.id,
      side,
      role: controlled && career
        ? career.position === "Atacante" ? "ATA" : career.position === "Ponta" ? "PE" : career.position === "Meia" ? "MEI" : career.position === "Lateral" ? "LD" : "ZAG"
        : player.position,
      controlled,
      active: true,
      position,
      homePosition: { ...position },
      velocity: { x: 0, y: 0 },
      facing: { x: side === "home" ? 1 : -1, y: 0 },
      stamina: 100,
      ratings: controlled && career ? careerRatings(career.attributes) : squadRatings(player.overall, player.position),
      actionCooldownTicks: 0,
    };
  });
}

function findCareerTeam(career: CareerState) {
  const team = TEAMS.find((candidate) => candidate.id === career.clubId);
  if (!team) throw new Error(`Clube da carreira não encontrado: ${career.clubId}`);
  return team;
}

function tacticalProfile(tactic: OpponentTactic): MatchTacticalProfile {
  return {
    id: tactic.id,
    name: tactic.name,
    formation: tactic.formation,
    pressing: tactic.pressing,
    tempo: tactic.tempo,
    defensiveLine: tactic.defensiveLine,
    width: tactic.width,
    aggression: tactic.aggression,
    risk: tactic.risk,
  };
}

const balancedProfile: MatchTacticalProfile = {
  id: "equilibrado",
  name: "Equilibrado",
  formation: "4-3-3",
  pressing: 58,
  tempo: 62,
  defensiveLine: 56,
  width: 62,
  aggression: 55,
  risk: 50,
};

export function createPlayableMatchState(
  career: CareerState,
  fixture: Fixture,
): { state: MatchCoreState; context: PlayableMatchContext } {
  const careerTeam = findCareerTeam(career);
  const playerSide: MatchSide = fixture.home ? "home" : "away";
  const opponentSide: MatchSide = playerSide === "home" ? "away" : "home";
  const controlledPlayerId = `career-player-${career.id}`;
  const homeTeam = fixture.home ? careerTeam : fixture.opponent;
  const awayTeam = fixture.home ? fixture.opponent : careerTeam;
  const matchPlan = generateMatchPlan(career, fixture);

  const players = [
    ...teamPlayers(homeTeam, "home", playerSide === "home" ? controlledPlayerId : null, playerSide === "home" ? career : undefined),
    ...teamPlayers(awayTeam, "away", playerSide === "away" ? controlledPlayerId : null, playerSide === "away" ? career : undefined),
  ];
  if (players.length !== 22) throw new Error(`Partida jogável exige 22 jogadores; recebidos ${players.length}`);
  if (players.filter((player) => player.controlled).length !== 1) throw new Error("Partida jogável exige exatamente um atleta controlado");

  const playerSetup: MatchTeamSetup = {
    difficulty: "Profissional",
    tactic: balancedProfile,
    rivalryLevel: matchPlan.rivalryLevel,
  };
  const opponentSetup: MatchTeamSetup = {
    difficulty: career.difficulty,
    tactic: tacticalProfile(matchPlan.opponentTactic),
    rivalryLevel: matchPlan.rivalryLevel,
  };

  const state = createMatchCoreState({
    matchId: `playable-${career.id}-${fixture.id}`,
    players,
    teamSetup: {
      [playerSide]: playerSetup,
      [opponentSide]: opponentSetup,
    },
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

export function createPlayableMatchStatistics(state: MatchCoreState, context: PlayableMatchContext): MatchStatistics {
  const playerSide = context.playerSide;
  const opponentSide: MatchSide = playerSide === "home" ? "away" : "home";
  const own = state.stats[playerSide], rival = state.stats[opponentSide];
  const ownGoals = state.score[playerSide], rivalGoals = state.score[opponentSide];
  return {
    playerTeam: {
      possession: possessionPercent(state, playerSide),
      shots: own.shots,
      shotsOnTarget: Math.max(ownGoals, Math.round(own.shots * 0.38)),
      bigChances: Math.max(ownGoals, Math.round(own.shots * 0.2)),
      corners: own.corners,
      fouls: own.fouls,
      offsides: own.offsides,
      yellowCards: own.yellowCards,
      redCards: own.redCards,
      expectedGoals: Math.round((own.shots * 0.11 + ownGoals * 0.18) * 100) / 100,
    },
    opponent: {
      possession: possessionPercent(state, opponentSide),
      shots: rival.shots,
      shotsOnTarget: Math.max(rivalGoals, Math.round(rival.shots * 0.38)),
      bigChances: Math.max(rivalGoals, Math.round(rival.shots * 0.2)),
      corners: rival.corners,
      fouls: rival.fouls,
      offsides: rival.offsides,
      yellowCards: rival.yellowCards,
      redCards: rival.redCards,
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
  const rating = Math.max(4, Math.min(10, 6 + (playerStats?.goals ?? 0) * 1.25 + (playerStats?.assists ?? 0) * 0.75 + (playerStats?.tackles ?? 0) * 0.08 + (playerStats?.completedPasses ?? 0) * 0.015 - (playerStats?.fouls ?? 0) * 0.08));
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
    yellowCards: playerStats?.yellowCards ?? 0,
    redCard: Boolean(controlled?.redCard),
    injuryStatus: controlled?.injured ? (controlled.injurySeverity || "Leve") : "",
    energySpent: Math.max(0, Math.round(100 - (controlled?.stamina ?? 100))),
    approach: "Equilibrado",
    statistics: createPlayableMatchStatistics(state, context),
    ...overrides,
  };
}
