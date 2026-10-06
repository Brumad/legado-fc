import assert from "node:assert/strict";
import {
  createFixture,
  getLeagueDefinition,
  migrateCareer,
} from "../app/game-engine.ts";
import {
  createPlayableMatchResult,
  createPlayableMatchState,
} from "../app/gameplay-integration.ts";
import {
  DEFAULT_MATCH_CORE_CONFIG,
  FixedStepMatchRuntime,
  startSecondHalf,
  validateMatchCoreState,
} from "../app/match-core/index.ts";

const career = migrateCareer({
  id: "playable-integration",
  name: "Jogador Integração",
  countryId: "BR",
  division: 1,
  seasonRound: 1,
  careerSeed: 505000,
});
const league = getLeagueDefinition(career.countryId, career.division);
assert.ok(league.teams.some((team) => team.id === career.clubId));

for (const home of [true, false]) {
  const baseFixture = createFixture(career);
  const fixture = { ...baseFixture, home };
  const { state, context } = createPlayableMatchState(career, fixture);

  assert.equal(state.players.length, 22);
  assert.equal(state.players.filter((player) => player.controlled).length, 1);
  assert.equal(state.players.find((player) => player.controlled)?.id, context.controlledPlayerId);
  assert.equal(context.playerSide, home ? "home" : "away");
  assert.equal(validateMatchCoreState(state).valid, true);

  const config = {
    ...DEFAULT_MATCH_CORE_CONFIG,
    halfDurationSeconds: 0.5,
    maxCatchUpSteps: 60,
  };
  const runtime = new FixedStepMatchRuntime(state, config);
  runtime.start();
  for (let frame = 0; frame < 30; frame += 1) runtime.advanceFrame(1 / 60);
  assert.equal(runtime.state.clock.phase, "half-time");

  runtime.state = startSecondHalf(runtime.state);
  for (let frame = 0; frame < 30; frame += 1) runtime.advanceFrame(1 / 60);
  assert.equal(runtime.state.finished, true);

  const result = createPlayableMatchResult(runtime.state, context, {
    goals: 1,
    rating: 7.4,
  });
  assert.equal(result.version, 1);
  assert.equal(result.fixtureId, fixture.id);
  assert.equal(result.goals, 1);
  assert.equal(result.rating, 7.4);
}

console.log(JSON.stringify({
  player: career.name,
  club: career.clubName,
  integration: "career -> 22-player match core -> result contract",
  homeAndAway: true,
}));
