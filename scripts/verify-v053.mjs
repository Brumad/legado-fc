import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  OPPONENT_TACTICS,
  createFixture,
  migrateCareer,
} from "../app/game-engine.ts";
import { createPlayableMatchState } from "../app/gameplay-integration.ts";
import {
  DEFAULT_MATCH_CORE_CONFIG,
  FixedStepMatchRuntime,
  addMatchStoppage,
  createMatchCoreState,
  getFoundationAiInput,
  moveMatchPlayer,
  normalizeMatchInput,
  resolveAutomaticSubstitutions,
  resolvePossessionAction,
  resolveTackles,
  validateMatchCoreState,
} from "../app/match-core/index.ts";

function ratings(overrides = {}) {
  return {
    pace: 65,
    shooting: 65,
    passing: 65,
    dribbling: 65,
    defending: 65,
    physical: 65,
    goalkeeping: 20,
    ...overrides,
  };
}

function player(id, side, x, y, options = {}) {
  return {
    id,
    side,
    role: options.role ?? "MEI",
    controlled: options.controlled ?? false,
    active: true,
    position: { x, y },
    homePosition: options.homePosition ?? { x, y },
    velocity: { x: 0, y: 0 },
    stamina: options.stamina ?? 100,
    ratings: ratings(options.ratings),
  };
}

assert.equal(OPPONENT_TACTICS.length, 12, "a 0.5.3 deve manter exatamente 12 perfis táticos");
assert.equal(new Set(OPPONENT_TACTICS.map((item) => item.id)).size, 12, "táticas precisam de ids únicos");
assert.ok(new Set(OPPONENT_TACTICS.map((item) => item.formation)).size >= 8, "as táticas precisam produzir formações estruturalmente diferentes");

// Dificuldade muda comportamento da IA, não placar.
{
  const common = {
    id: "press-test",
    name: "Pressão teste",
    formation: "4-3-3",
    pressing: 90,
    tempo: 50,
    defensiveLine: 60,
    width: 60,
    aggression: 60,
    risk: 50,
  };
  const base = createMatchCoreState({
    matchId: "difficulty-behavior",
    players: [
      player("owner", "home", 50, 34),
      player("ai", "away", 68, 34, { homePosition: { x: 92, y: 55 } }),
      player("away-two", "away", 90, 10),
    ],
    teamSetup: {
      away: { difficulty: "Promessa", tactic: common, rivalryLevel: 0 },
    },
  });
  const withBall = {
    ...base,
    ball: { ...base.ball, position: { x: 50, y: 34 }, possessionPlayerId: "owner", lastTouchPlayerId: "owner", lastTouchSide: "home" },
  };
  const promise = getFoundationAiInput(withBall.players[1], withBall);
  const legendState = {
    ...withBall,
    teamSetup: {
      ...withBall.teamSetup,
      away: { ...withBall.teamSetup.away, difficulty: "Lenda" },
    },
  };
  const legend = getFoundationAiInput(legendState.players[1], legendState);
  assert.equal(promise.sprint, false, "Promessa não deve pressionar de tão longe");
  assert.equal(legend.sprint, true, "Lenda deve reagir e pressionar de mais longe");
}

// Formação tática altera posições reais de início.
{
  const career = migrateCareer({ id: "shape-v053", name: "Shape", countryId: "BR", division: 1, careerSeed: 53054, difficulty: "Lenda" });
  const seen = new Map();
  for (let offset = 0; offset < 40 && seen.size < 4; offset += 1) {
    const sample = migrateCareer({ ...career, matches: offset, seasonRound: (offset % 10) + 1 });
    const fixture = createFixture(sample);
    const created = createPlayableMatchState(sample, fixture);
    const opponentSide = created.context.playerSide === "home" ? "away" : "home";
    const setup = created.state.teamSetup[opponentSide];
    const signature = created.state.players
      .filter((item) => item.side === opponentSide)
      .map((item) => `${item.homePosition.x.toFixed(1)}:${item.homePosition.y.toFixed(1)}`)
      .join("|");
    seen.set(setup.tactic.formation, signature);
  }
  assert.ok(seen.size >= 3, "diferentes formações precisam chegar ao campo com posições diferentes");
  assert.equal(new Set(seen.values()).size, seen.size, "formações distintas não podem compartilhar exatamente o mesmo shape");
}

// Postura muda com o placar e o minuto.
{
  const tactic = { id: "posture", name: "Postura", formation: "4-3-3", pressing: 60, tempo: 50, defensiveLine: 55, width: 60, aggression: 55, risk: 45 };
  const base = createMatchCoreState({
    matchId: "posture-v053",
    players: [
      player("owner", "home", 50, 34),
      player("ai", "away", 67, 34, { homePosition: { x: 87, y: 52 } }),
      player("a2", "away", 90, 12),
    ],
    teamSetup: { away: { difficulty: "Profissional", tactic, rivalryLevel: 80 } },
  });
  const common = {
    ...base,
    clock: { ...base.clock, phase: "second-half", running: true, minute: 78, matchSeconds: 78 * 60, periodSeconds: 33 * 60 },
    ball: { ...base.ball, position: { x: 50, y: 34 }, possessionPlayerId: "owner", lastTouchPlayerId: "owner", lastTouchSide: "home" },
  };
  const losing = getFoundationAiInput(common.players[1], { ...common, score: { home: 2, away: 0 } });
  const winning = getFoundationAiInput(common.players[1], { ...common, score: { home: 0, away: 2 } });
  assert.ok(losing.sprint || Math.hypot(losing.moveX, losing.moveY) >= Math.hypot(winning.moveX, winning.moveY), "time perdendo deve assumir postura ao menos tão agressiva quanto time vencendo");
}

// Atributos alteram velocidade real.
{
  const base = createMatchCoreState({
    matchId: "attribute-speed",
    players: [player("runner", "home", 30, 34)],
  });
  const slow = { ...base.players[0], ratings: ratings({ pace: 45 }) };
  const fast = { ...base.players[0], ratings: ratings({ pace: 92 }) };
  const input = normalizeMatchInput({ moveX: 1, sprint: true });
  let movedSlow = slow;
  let movedFast = fast;
  for (let step = 0; step < 20; step += 1) {
    movedSlow = moveMatchPlayer(movedSlow, input, { ...base, players: [movedSlow] }, 1 / 10, DEFAULT_MATCH_CORE_CONFIG);
    movedFast = moveMatchPlayer(movedFast, input, { ...base, players: [movedFast] }, 1 / 10, DEFAULT_MATCH_CORE_CONFIG);
  }
  assert.ok(movedFast.position.x > movedSlow.position.x + 0.5, "pace alto precisa produzir deslocamento maior após aceleração");
}

// Impedimento usa bola + segundo penúltimo defensor.
{
  let state = createMatchCoreState({
    matchId: "offside-real-position",
    players: [
      player("passer", "home", 50, 34, { controlled: true, ratings: { passing: 90 } }),
      player("runner", "home", 82, 34),
      player("d1", "away", 78, 28),
      player("d2", "away", 75, 40),
      player("gk", "away", 103, 34, { role: "GOL", ratings: { goalkeeping: 88 } }),
    ],
  });
  state = {
    ...state,
    clock: { ...state.clock, phase: "first-half", running: true },
    ball: { ...state.ball, position: { x: 50.5, y: 34 }, possessionPlayerId: "passer", lastTouchPlayerId: "passer", lastTouchSide: "home" },
  };
  state = resolvePossessionAction(state, new Map([["passer", normalizeMatchInput({ moveX: 1, pass: true })]]), DEFAULT_MATCH_CORE_CONFIG);
  assert.ok(state.events.some((event) => event.type === "offside"), "corrida além da segunda linha precisa gerar impedimento");
  assert.equal(state.stats.home.offsides, 1);
  assert.equal(state.restart?.side, "away");
}

// Disciplina e lesão precisam nascer de contatos reais.
{
  let foundCard = false;
  let foundInjury = false;
  for (let tick = 1; tick <= 700 && (!foundCard || !foundInjury); tick += 1) {
    let state = createMatchCoreState({
      matchId: "discipline-" + tick,
      players: [
        player("owner", "home", 50, 34, { ratings: { dribbling: 95, physical: 45 }, stamina: 30 }),
        player("tackler", "away", 50.6, 34, { controlled: true, ratings: { defending: 35, physical: 75 }, stamina: 35 }),
      ],
      teamSetup: {
        away: {
          difficulty: "Lenda",
          tactic: { id: "duelo", name: "Duelo", formation: "4-4-2", pressing: 80, tempo: 70, defensiveLine: 60, width: 55, aggression: 100, risk: 80 },
          rivalryLevel: 100,
        },
      },
    });
    state = {
      ...state,
      tick,
      clock: { ...state.clock, phase: "first-half", running: true },
      ball: { ...state.ball, position: { x: 50, y: 34 }, possessionPlayerId: "owner", lastTouchPlayerId: "owner", lastTouchSide: "home" },
    };
    const next = resolveTackles(state, new Map([
      ["owner", normalizeMatchInput()],
      ["tackler", normalizeMatchInput({ tackle: true })],
    ]), { ...DEFAULT_MATCH_CORE_CONFIG, tackleRadius: 2 });
    foundCard ||= next.events.some((event) => event.type === "yellow-card" || event.type === "red-card");
    foundInjury ||= next.events.some((event) => event.type === "injury");
  }
  assert.equal(foundCard, true, "faltas reais precisam poder gerar cartões");
  assert.equal(foundInjury, true, "disputas reais precisam poder gerar lesões");
}

// Substituição abstrata do slot tático por fadiga/lesão.
{
  let state = createMatchCoreState({
    matchId: "auto-sub",
    players: [
      player("tired", "home", 50, 34, { stamina: 18 }),
      player("other", "away", 60, 34),
    ],
  });
  state = {
    ...state,
    clock: { ...state.clock, phase: "second-half", running: true, minute: 67, matchSeconds: 67 * 60, periodSeconds: 22 * 60 },
  };
  state = resolveAutomaticSubstitutions(state);
  assert.equal(state.stats.home.substitutions, 1);
  assert.equal(state.players.find((item) => item.id === "tired")?.substituted, true);
  assert.ok(state.events.some((event) => event.type === "substitution"));
}

// Acréscimos prolongam o período e voltam para 45:00 no começo do segundo tempo.
{
  const state = createMatchCoreState({
    matchId: "stoppage",
    players: [player("p", "home", 52, 34, { controlled: true })],
  });
  const runtime = new FixedStepMatchRuntime(state, {
    ...DEFAULT_MATCH_CORE_CONFIG,
    matchClockRate: 1,
    halfDurationSeconds: 2,
    restartDelayTicks: 0,
    maxCatchUpSteps: 120,
  });
  runtime.start();
  runtime.state = { ...runtime.state, clock: addMatchStoppage(runtime.state.clock, 1) };
  for (let i = 0; i < 120; i += 1) runtime.advanceFrame(1 / 60);
  assert.equal(runtime.state.clock.phase, "first-half", "acréscimo precisa impedir encerramento aos 2s base");
  for (let i = 0; i < 60; i += 1) runtime.advanceFrame(1 / 60);
  assert.equal(runtime.state.clock.phase, "half-time");
  runtime.startSecondHalf();
  assert.equal(runtime.state.clock.matchSeconds, 2);
  assert.equal(runtime.state.clock.addedTimeSeconds, 0);
}

// 100 partidas IA x IA: sem soft lock, estado finito e gols não são scripts de placar.
{
  let totalGoals = 0;
  let matchesWithGoals = 0;
  let maxGoals = 0;
  for (let index = 0; index < 100; index += 1) {
    const career = migrateCareer({
      id: "ai-v053-" + index,
      name: "IA " + index,
      countryId: ["BR","AR","PT","EN","ES","IT","DE","FR","NL","MX","US","JP"][index % 12],
      division: index % 3 === 0 ? 1 : 2,
      seasonRound: (index % 10) + 1,
      matches: index,
      careerSeed: 530000 + index * 97,
      difficulty: index % 3 === 0 ? "Promessa" : index % 3 === 1 ? "Profissional" : "Lenda",
    });
    const fixture = createFixture(career);
    const created = createPlayableMatchState(career, fixture);
    const state = {
      ...created.state,
      players: created.state.players.map((item) => ({ ...item, controlled: false })),
    };
    const runtime = new FixedStepMatchRuntime(state, {
      ...DEFAULT_MATCH_CORE_CONFIG,
      matchClockRate: 60,
      restartDelayTicks: 1,
      maxCatchUpSteps: 120,
    });
    runtime.start();

    let guard = 0;
    while (runtime.state.clock.phase === "first-half" && guard < 3400) {
      runtime.advanceFrame(1 / 60);
      guard += 1;
    }
    assert.equal(runtime.state.clock.phase, "half-time", "primeiro tempo IA x IA travou no jogo " + index);
    runtime.startSecondHalf();
    guard = 0;
    while (!runtime.state.finished && guard < 3400) {
      runtime.advanceFrame(1 / 60);
      guard += 1;
    }
    assert.equal(runtime.state.finished, true, "partida IA x IA travou no jogo " + index);
    const validation = validateMatchCoreState(runtime.state);
    assert.equal(validation.valid, true, validation.errors.join("; "));

    const goals = runtime.state.score.home + runtime.state.score.away;
    totalGoals += goals;
    maxGoals = Math.max(maxGoals, goals);
    if (goals > 0) matchesWithGoals += 1;
  }
  const averageGoals = totalGoals / 100;
  assert.ok(matchesWithGoals >= 5, "IA precisa conseguir marcar sem placar roteirizado; jogos com gol=" + matchesWithGoals + " total=" + totalGoals);
  assert.ok(averageGoals >= 0.15 && averageGoals <= 8, "média de gols saiu de uma faixa segura: " + averageGoals + " em " + matchesWithGoals + " jogos com gol");
  assert.ok(maxGoals <= 15, "placar extremo sugere regressão: " + maxGoals);
}

const [creator, css, canvas, screen] = await Promise.all([
  readFile(new URL("../app/career-creator.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(new URL("../app/playable-match-canvas.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/playable-match-screen.tsx", import.meta.url), "utf8"),
]);

assert.match(creator, /COUNTRIES\.length/);
assert.match(creator, /country-choice-shell/);
assert.match(creator, /creator-position-grid/);
assert.match(creator, /facialHair/);
assert.match(css, /max-width:\s*390px/);
assert.match(css, /orientation:\s*landscape/);
assert.match(css, /country-choice-shell[\s\S]*overflow-y:\s*auto/);
assert.match(canvas, /playable-joystick/);
assert.doesNotMatch(canvas, /playable-dpad/);
assert.match(screen, /short:\s*30/);
assert.match(screen, /standard:\s*15/);
assert.match(screen, /long:\s*9/);

console.log(JSON.stringify({
  version: "0.5.3",
  tactics: OPPONENT_TACTICS.length,
  analogMobileControl: true,
  matchDurations: ["3 min", "6 min", "10 min"],
  realDifficultyBehavior: true,
  realOffside: true,
  discipline: true,
  injury: true,
  substitution: true,
  stoppageTime: true,
  aiVsAiMatches: 100,
}));
