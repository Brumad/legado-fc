import {
  LEAGUE_TEAMS,
  createFixture,
  generateMatchPlan,
  generateStandings,
  migrateCareer,
} from "../app/game-engine.ts";

const signatures = new Set();
const scorelines = new Set();
const momentPatterns = new Set();

for (let index = 0; index < 1000; index += 1) {
  const career = migrateCareer({
    name: "Teste de Variedade",
    matches: index,
    careerSeed: 741903,
    position: ["Atacante", "Ponta", "Meia", "Lateral", "Zagueiro"][index % 5],
  });
  const plan = generateMatchPlan(career, createFixture(career));
  signatures.add(plan.signature);
  scorelines.add(`${plan.baseHomeGoals}-${plan.baseAwayGoals}`);
  momentPatterns.add(plan.moments.map((moment) => `${moment.minute}:${moment.kind}`).join("|"));
}

if (signatures.size !== 1000) throw new Error(`Assinaturas únicas: ${signatures.size}/1000`);
if (momentPatterns.size < 990) throw new Error(`Padrões de lance insuficientes: ${momentPatterns.size}/1000`);
if (scorelines.size < 12) throw new Error(`Pouca variedade de placares: ${scorelines.size}`);

const seasonOpponents = new Map();
for (let round = 1; round <= 22; round += 1) {
  const career = migrateCareer({
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
  seasonOpponents: seasonOpponents.size,
  leagueTeams: standings.length,
}));
