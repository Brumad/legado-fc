import {
  COUNTRIES,
  WORLD_TEAMS,
  advanceWorldSeason,
  createInitialWorldPlayers,
  getWorldRanking,
  migrateCareer,
} from "../app/game-engine.ts";

const expectedPlayers = WORLD_TEAMS.reduce((total, team) => total + team.squad.length, 0);
const initialPlayers = createInitialWorldPlayers(4012026, 2026);
if (initialPlayers.length !== expectedPlayers) {
  throw new Error(`Mundo incompleto: ${initialPlayers.length}/${expectedPlayers} atletas`);
}
if (new Set(initialPlayers.map((player) => player.id)).size !== expectedPlayers) {
  throw new Error("O mundo inicial possui jogadores duplicados");
}
if (initialPlayers.some((player) => player.age < 18 || player.age > 32 || player.potential < player.overall)) {
  throw new Error("Faixa de idade ou potencial inválida no mundo inicial");
}
if (initialPlayers.some((player) => !player.nationality || !player.nationalityId)) {
  throw new Error("Existem jogadores sem nacionalidade no mundo inicial");
}

const clubsByStrength = WORLD_TEAMS.slice().sort((a, b) => a.strength - b.strength);
const lowerClubIds = new Set(clubsByStrength.slice(0, Math.ceil(clubsByStrength.length / 4)).map((team) => team.id));
const upperClubIds = new Set(clubsByStrength.slice(-Math.ceil(clubsByStrength.length / 4)).map((team) => team.id));
const strongestLowerClubPlayer = Math.max(...initialPlayers.filter((player) => lowerClubIds.has(player.teamId)).map((player) => player.overall));
const strongestUpperClubPlayer = Math.max(...initialPlayers.filter((player) => upperClubIds.has(player.teamId)).map((player) => player.overall));
if (strongestLowerClubPlayer >= 85 || strongestUpperClubPlayer <= strongestLowerClubPlayer) {
  throw new Error(`Hierarquia de clubes inválida: elite ${strongestUpperClubPlayer}, clubes menores ${strongestLowerClubPlayer}`);
}
const weakestClub = clubsByStrength[0];
const weakestClubPlayer = initialPlayers.find((player) => player.teamId === weakestClub.id);
const distortedPlayers = initialPlayers.map((player) => player.id === weakestClubPlayer?.id
  ? { ...player, overall: 95, potential: 95, nationality: undefined, nationalityId: undefined }
  : player);
const rebalancedLegacy = migrateCareer({
  id: "save-041-before-hotfix",
  name: "Save Rebalanceado",
  saveVersion: 4,
  careerSeed: 4012026,
  worldPlayers: distortedPlayers,
});
const correctedPlayer = rebalancedLegacy.worldPlayers.find((player) => player.id === weakestClubPlayer?.id);
if (!correctedPlayer?.nationality || correctedPlayer.overall > weakestClub.strength + 5) {
  throw new Error("A migração não corrigiu nacionalidade e craque incompatível com clube menor");
}

const legacyCareer = migrateCareer({
  id: "save-033",
  name: "Carreira Migrada",
  season: 2026,
  careerSeed: 4012026,
});
if (legacyCareer.saveVersion !== 5 || legacyCareer.worldPlayers.length !== expectedPlayers) {
  throw new Error("A migração da 0.3.3 não criou o universo persistente");
}
const eliteCareer = migrateCareer({
  ...legacyCareer,
  name: "Craque do Teste",
  nationality: "Portugal",
  attributes: { pace: 95, shooting: 95, passing: 95, dribbling: 95, defending: 95, physical: 95 },
});
const eliteRanking = getWorldRanking(eliteCareer);
if (eliteRanking[0]?.id !== `career-player-${eliteCareer.id}` || eliteRanking[0].nationality !== "Portugal") {
  throw new Error("O atleta da carreira com overall 95 não liderou o ranking mundial com sua nacionalidade");
}

const firstAdvance = advanceWorldSeason(legacyCareer, 5, "2026: permanência na divisão");
if (firstAdvance.worldTransfers.length !== 36) {
  throw new Error(`Janela mundial incompleta: ${firstAdvance.worldTransfers.length}/36 transferências`);
}
if (firstAdvance.worldHistory[0]?.champions.length !== COUNTRIES.length) {
  throw new Error("O mapa mundial não registrou os campeões dos 12 países");
}
if (firstAdvance.seasonArchive.length !== 1 || firstAdvance.worldLastUpdatedSeason !== 2026) {
  throw new Error("O arquivo da primeira temporada não foi persistido");
}
for (const transfer of firstAdvance.worldTransfers) {
  const destination = WORLD_TEAMS.find((team) => team.id === transfer.toTeamId);
  if (!destination) throw new Error(`Destino desconhecido para ${transfer.playerName}`);
  if (transfer.overall >= 87 && destination.strength < 81) {
    throw new Error(`Craque de overall ${transfer.overall} foi enviado para clube de força ${destination.strength}`);
  }
}

const guarded = advanceWorldSeason(
  migrateCareer({ ...legacyCareer, ...firstAdvance }),
  5,
  "não deve duplicar",
);
if (guarded.worldHistory.length !== 1 || guarded.worldTransfers.length !== 36) {
  throw new Error("A mesma temporada mundial foi simulada duas vezes");
}

let longCareer = legacyCareer;
let totalProspects = 0;
for (let index = 0; index < 15; index += 1) {
  const advanced = advanceWorldSeason(longCareer, (index % 12) + 1, `${longCareer.season}: temporada simulada`);
  totalProspects += advanced.worldHistory[0]?.generatedProspects ?? 0;
  longCareer = migrateCareer({
    ...longCareer,
    ...advanced,
    season: longCareer.season + 1,
    age: longCareer.age + 1,
  });
}

if (longCareer.worldPlayers.length !== expectedPlayers) {
  throw new Error("A renovação de gerações alterou o tamanho do universo");
}
if (longCareer.worldHistory.length !== 12 || longCareer.seasonArchive.length !== 15) {
  throw new Error("Os limites do histórico mundial não foram respeitados");
}
if (longCareer.worldTransfers.length !== 180) {
  throw new Error(`Histórico de mercado inesperado: ${longCareer.worldTransfers.length}/180`);
}
if (totalProspects <= 0 || longCareer.worldPlayers.some((player) => player.status !== "Ativo")) {
  throw new Error("Aposentadorias e novos talentos não renovaram o mundo");
}

const serializedBytes = Buffer.byteLength(JSON.stringify(longCareer), "utf8");
if (serializedBytes > 2_000_000) {
  throw new Error(`Save mundial grande demais: ${serializedBytes} bytes`);
}

console.log(JSON.stringify({
  seasonsSimulated: 15,
  countries: COUNTRIES.length,
  trackedPlayers: longCareer.worldPlayers.length,
  retainedTransfers: longCareer.worldTransfers.length,
  archivedWorldSeasons: longCareer.worldHistory.length,
  careerSeasons: longCareer.seasonArchive.length,
  generatedProspects: totalProspects,
  strongestLowerClubPlayer,
  strongestUpperClubPlayer,
  eliteCareerRank: 1,
  serializedBytes,
}));
