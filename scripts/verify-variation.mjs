import {
  COUNTRIES,
  LEAGUE_TEAMS,
  ORIGINS,
  TEAMS,
  createFixture,
  generateMatchPlan,
  generateStandings,
  getLeagueDefinition,
  migrateCareer,
} from "../app/game-engine.ts";

const signatures = new Set();
const scorelines = new Set();
const momentPatterns = new Set();
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

if (COUNTRIES.length !== 4) throw new Error(`Países disponíveis: ${COUNTRIES.length}/4`);
if (TEAMS.length !== 96) throw new Error(`Clubes disponíveis: ${TEAMS.length}/96`);
for (const country of COUNTRIES) {
  if (country.leagues.length !== 2) throw new Error(`${country.name} não possui duas divisões`);
  if (getLeagueDefinition(country.id, 1).teams.length !== 12 || getLeagueDefinition(country.id, 2).teams.length !== 12) {
    throw new Error(`${country.name} não possui 12 clubes por divisão`);
  }
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
          seasonRound: (match % 22) + 1,
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
for (let round = 1; round <= 22; round += 1) {
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
if ([...seasonOpponents.values()].some((matches) => matches !== 2)) {
  throw new Error("O calendário não produziu turno e returno equilibrados");
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
  distinctScorelines: scorelines.size,
  winRate: Number(winRate.toFixed(3)),
  drawRate: Number(drawRate.toFixed(3)),
  lossRate: Number(lossRate.toFixed(3)),
  averageGoals: Number(averageGoals.toFixed(2)),
  unusualScorelines,
  countries: COUNTRIES.length,
  totalClubs: TEAMS.length,
  scenarioWinRateRange: [
    Number(Math.min(...scenarioWinRates).toFixed(3)),
    Number(Math.max(...scenarioWinRates).toFixed(3)),
  ],
  seasonOpponents: seasonOpponents.size,
  leagueTeams: standings.length,
}));
