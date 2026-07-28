import {
  COUNTRIES,
  LEAGUE_TEAMS,
  ORIGINS,
  TEAMS,
  createFixture,
  generateMatchPlan,
  generateStandings,
  getLeagueDefinition,
  getPreparationActionCount,
  migrateCareer,
  simulateFullRound,
} from "../app/game-engine.ts";

const signatures = new Set();
const scorelines = new Set();
const momentPatterns = new Set();
const momentKinds = new Set();
let victories = 0;
let draws = 0;
let losses = 0;
let totalGoals = 0;
let unusualScorelines = 0;

for (let index = 0; index < 1000; index += 1) {
  const career = migrateCareer({
    id: "balance-career",
    name: "Teste de Variedade",
    matches: index,
    careerSeed: 741903,
    position: ["Atacante", "Ponta", "Meia", "Lateral", "Zagueiro"][index % 5],
  });
  const plan = generateMatchPlan(career, createFixture(career));
  signatures.add(plan.signature);
  scorelines.add(`${plan.baseHomeGoals}-${plan.baseAwayGoals}`);
  momentPatterns.add(plan.moments.map((moment) => `${moment.minute}:${moment.kind}`).join("|"));
  plan.moments.forEach((moment) => momentKinds.add(moment.kind));
  totalGoals += plan.baseHomeGoals + plan.baseAwayGoals;
  if (plan.baseHomeGoals > plan.baseAwayGoals) victories += 1;
  else if (plan.baseHomeGoals === plan.baseAwayGoals) draws += 1;
  else losses += 1;
  if (plan.baseHomeGoals + plan.baseAwayGoals >= 6) unusualScorelines += 1;
}

if (signatures.size !== 1000) throw new Error(`Assinaturas únicas: ${signatures.size}/1000`);
if (momentPatterns.size < 990) throw new Error(`Padrões de lance insuficientes: ${momentPatterns.size}/1000`);
if (scorelines.size < 12) throw new Error(`Pouca variedade de placares: ${scorelines.size}`);

const winRate = victories / 1000;
const drawRate = draws / 1000;
const lossRate = losses / 1000;
const averageGoals = totalGoals / 1000;
if (winRate < .2 || winRate > .55) throw new Error(`Taxa de vitórias fora da meta: ${winRate}`);
if (drawRate < .18 || drawRate > .36) throw new Error(`Taxa de empates fora da meta: ${drawRate}`);
if (lossRate < .2 || lossRate > .5) throw new Error(`Taxa de derrotas fora da meta: ${lossRate}`);
if (averageGoals < 1.7 || averageGoals > 3.1) throw new Error(`Média de gols fora da meta: ${averageGoals}`);
if (unusualScorelines > 45) throw new Error(`Placares com seis ou mais gols: ${unusualScorelines}/1000`);

for (const kind of ["dribble", "freeKick", "corner", "penalty", "counter", "aerial"]) {
  if (!momentKinds.has(kind)) throw new Error(`Tipo de lance não apareceu nas simulações: ${kind}`);
}

if (COUNTRIES.length !== 12) throw new Error(`Países disponíveis: ${COUNTRIES.length}/12`);
if (TEAMS.length !== 505) throw new Error(`Clubes disponíveis: ${TEAMS.length}/505`);
let firstDivisionPlayers = 0;
for (const country of COUNTRIES) {
  if (country.leagues.length !== 2) throw new Error(`${country.name} não possui duas divisões`);
  for (const division of [1, 2]) {
    const league = getLeagueDefinition(country.id, division);
    if (league.teams.length !== league.format.teamCount) {
      throw new Error(`${league.name}: ${league.teams.length}/${league.format.teamCount} clubes`);
    }
    if (league.format.matchesPerRound !== Math.floor(league.format.teamCount / 2)) {
      throw new Error(`${league.name}: número incorreto de partidas por rodada`);
    }
    if (league.teams.some((team) => team.squad.length !== 11)) {
      throw new Error(`${league.name} possui clube sem 11 titulares`);
    }
  }
  firstDivisionPlayers += country.leagues[0].teams.reduce((total, team) => total + team.squad.length, 0);
}
if (firstDivisionPlayers !== 2750) throw new Error(`Titulares na elite: ${firstDivisionPlayers}/2750`);

for (let days = 3; days <= 9; days += 1) {
  const actions = getPreparationActionCount(days);
  if (actions !== Math.floor(days / 2)) throw new Error(`Calendário de ${days} dias gerou ${actions} ações`);
  if (actions < 1 || actions > 4) throw new Error(`Quantidade inválida de ações para ${days} dias: ${actions}`);
}

const scenarioWinRates = [];
for (const country of COUNTRIES) {
  for (const division of [1, 2]) {
    for (const origin of ORIGINS) {
      let scenarioWins = 0;
      for (let match = 0; match < 120; match += 1) {
        const career = migrateCareer({
          id: `scenario-${country.id}-${division}-${origin.id}`,
          name: "Teste de Equilíbrio",
          countryId: country.id,
          division,
          origin: origin.id,
          matches: match,
          seasonRound: (match % getLeagueDefinition(country.id, division).format.rounds) + 1,
          careerSeed: 91357,
        });
        const plan = generateMatchPlan(career, createFixture(career));
        if (plan.baseHomeGoals > plan.baseAwayGoals) scenarioWins += 1;
      }
      const scenarioWinRate = scenarioWins / 120;
      scenarioWinRates.push(scenarioWinRate);
      if (scenarioWinRate > .65) {
        throw new Error(`Cenário com vitórias excessivas: ${country.name}, divisão ${division}, ${origin.id}: ${scenarioWinRate}`);
      }
    }
  }
}

const seasonOpponents = new Map();
const brazilSecond = getLeagueDefinition("BR", 2);
for (let round = 1; round <= brazilSecond.format.rounds; round += 1) {
  const career = migrateCareer({
    id: "calendar-career",
    name: "Teste de Temporada",
    matches: 0,
    seasonRound: round,
    careerSeed: 741903,
  });
  const opponent = createFixture(career).opponent.id;
  seasonOpponents.set(opponent, (seasonOpponents.get(opponent) ?? 0) + 1);
}
if (seasonOpponents.size !== LEAGUE_TEAMS.length - 1) {
  throw new Error(`Calendário incompleto: ${seasonOpponents.size}/${LEAGUE_TEAMS.length - 1} adversários`);
}

for (const country of COUNTRIES) {
  const league = getLeagueDefinition(country.id, 1);
  const club = league.teams[0];
  const opponent = league.teams[1];
  const career = migrateCareer({
    id: `round-${country.id}`,
    name: "Atleta de Teste",
    countryId: country.id,
    countryName: country.name,
    division: 1,
    leagueId: league.id,
    leagueName: league.name,
    clubId: club.id,
    clubName: club.name,
    clubShort: club.short,
    clubColor: club.color,
    clubStrength: club.strength,
    seasonRound: 1,
    careerSeed: 81173,
  });
  const round = simulateFullRound(career, { clubGoals: 2, opponentGoals: 1, opponentId: opponent.id, goals: 1, assists: 1 });
  if (round.lastRoundResults.length !== league.format.matchesPerRound) {
    throw new Error(`${league.name}: rodada simulou ${round.lastRoundResults.length}/${league.format.matchesPerRound} partidas`);
  }
  if (round.leagueTable.some((record) => record.played !== 1)) {
    throw new Error(`${league.name}: nem todos os clubes foram atualizados na rodada`);
  }
  if (!round.leagueLeaders.some((player) => player.name === career.name && player.goals === 1 && player.assists === 1)) {
    throw new Error(`${league.name}: estatísticas do jogador não foram creditadas`);
  }
}
if ([...seasonOpponents.values()].some((matches) => matches !== 2)) {
  throw new Error("O calendário não produziu turno e returno equilibrados");
}

const showcaseCareer = migrateCareer({
  id: "developer-showcase",
  name: "Jogador Dev",
  countryId: "BR",
  division: 1,
  seasonRound: 1,
  careerSeed: 99351,
});
const showcase = generateMatchPlan(showcaseCareer, createFixture(showcaseCareer), true);
const showcaseKinds = new Set(showcase.moments.map((moment) => moment.kind));
if (showcase.moments.length !== 9 || showcaseKinds.size !== 9) {
  throw new Error(`Modo dev incompleto: ${showcase.moments.length} lances, ${showcaseKinds.size} tipos`);
}

const standingsCareer = migrateCareer({
  seasonMatches: 8,
  seasonWins: 4,
  seasonDraws: 2,
  seasonLosses: 2,
  seasonPoints: 14,
  seasonGoalsFor: 12,
  seasonGoalsAgainst: 8,
});
const standings = generateStandings(standingsCareer);
if (standings.length !== LEAGUE_TEAMS.length) throw new Error("Tabela da liga incompleta");
if (!standings.some((row) => row.isPlayerTeam && row.points === 14)) throw new Error("Dados do clube do jogador ausentes");

console.log(JSON.stringify({
  simulatedMatches: 1000,
  uniqueSignatures: signatures.size,
  uniqueMomentPatterns: momentPatterns.size,
  momentKinds: [...momentKinds].sort(),
  distinctScorelines: scorelines.size,
  winRate: Number(winRate.toFixed(3)),
  drawRate: Number(drawRate.toFixed(3)),
  lossRate: Number(lossRate.toFixed(3)),
  averageGoals: Number(averageGoals.toFixed(2)),
  unusualScorelines,
  countries: COUNTRIES.length,
  totalClubs: TEAMS.length,
  firstDivisionPlayers,
  scenarioWinRateRange: [
    Number(Math.min(...scenarioWinRates).toFixed(3)),
    Number(Math.max(...scenarioWinRates).toFixed(3)),
  ],
  seasonOpponents: seasonOpponents.size,
  leagueTeams: standings.length,
}));
