import { createFixture, generateMatchPlan, migrateCareer } from "../app/game-engine.ts";

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

console.log(JSON.stringify({
  simulatedMatches: 1000,
  uniqueSignatures: signatures.size,
  uniqueMomentPatterns: momentPatterns.size,
  distinctScorelines: scorelines.size,
}));
