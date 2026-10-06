import { addMatchStoppage } from "./clock.ts";
import { appendMatchEvent } from "./state.ts";
import { oppositeSide } from "./rules.ts";
import type {
  MatchCoreConfig,
  MatchCoreState,
  MatchInputFrame,
  MatchPlayerRatings,
  MatchPlayerRuntimeStats,
  MatchPlayerState,
  MatchRestartState,
  MatchSide,
  Vector2,
} from "./types.ts";

const fallbackRatings: MatchPlayerRatings = {
  pace: 65, shooting: 62, passing: 64, dribbling: 64, defending: 62, physical: 65, goalkeeping: 20,
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function length(vector: Vector2) {
  return Math.hypot(vector.x, vector.y);
}

function distance(a: Vector2, b: Vector2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(vector: Vector2, fallback: Vector2): Vector2 {
  const magnitude = length(vector);
  return magnitude > 0.0001
    ? { x: vector.x / magnitude, y: vector.y / magnitude }
    : fallback;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicUnit(state: MatchCoreState, key: string) {
  return stableHash(`${state.matchId}:${state.tick}:${key}`) / 4294967295;
}

function playerStats(state: MatchCoreState, playerId: string): MatchPlayerRuntimeStats {
  return state.stats.players[playerId] ?? {
    goals: 0,
    assists: 0,
    shots: 0,
    passes: 0,
    completedPasses: 0,
    tackles: 0,
    fouls: 0,
    touches: 0,
    offsides: 0,
    yellowCards: 0,
    redCards: 0,
  };
}

function updatePlayerStats(
  state: MatchCoreState,
  playerId: string,
  patch: Partial<MatchPlayerRuntimeStats>,
): MatchCoreState {
  const current = playerStats(state, playerId);
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    const typedKey = key as keyof MatchPlayerRuntimeStats;
    next[typedKey] = current[typedKey] + (value ?? 0);
  }
  return {
    ...state,
    stats: {
      ...state.stats,
      players: { ...state.stats.players, [playerId]: next },
    },
  };
}

type TeamStatKey =
  | "shots" | "passes" | "completedPasses" | "tackles" | "fouls" | "corners" | "throwIns"
  | "offsides" | "yellowCards" | "redCards" | "substitutions" | "injuries";

function updateTeamStat(
  state: MatchCoreState,
  side: MatchSide,
  key: TeamStatKey,
  amount = 1,
): MatchCoreState {
  return {
    ...state,
    stats: {
      ...state.stats,
      [side]: {
        ...state.stats[side],
        [key]: state.stats[side][key] + amount,
      },
    },
  };
}

function withCooldown(state: MatchCoreState, playerId: string, ticks: number): MatchCoreState {
  return {
    ...state,
    players: state.players.map((player) => player.id === playerId
      ? { ...player, actionCooldownTicks: ticks }
      : player),
  };
}

function choosePassTarget(
  owner: MatchPlayerState,
  state: MatchCoreState,
  input: MatchInputFrame,
  throughBall: boolean,
): MatchPlayerState | null {
  const teammates = state.players.filter((player) =>
    player.active && !player.redCard && player.side === owner.side && player.id !== owner.id
  );
  if (!teammates.length) return null;
  const facing = normalize(
    Math.hypot(input.moveX, input.moveY) > 0.1
      ? { x: input.moveX, y: input.moveY }
      : owner.facing ?? { x: owner.side === "home" ? 1 : -1, y: 0 },
    { x: owner.side === "home" ? 1 : -1, y: 0 },
  );
  return teammates
    .map((teammate) => {
      const delta = { x: teammate.position.x - owner.position.x, y: teammate.position.y - owner.position.y };
      const range = Math.max(0.2, length(delta));
      const direction = normalize(delta, facing);
      const alignment = direction.x * facing.x + direction.y * facing.y;
      const forwardBias = owner.side === "home" ? delta.x : -delta.x;
      const score = alignment * 5
        + Math.min(throughBall ? 30 : 20, range) * 0.04
        + forwardBias * (throughBall ? 0.045 : 0.015)
        - range * 0.03;
      return { teammate, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.teammate ?? null;
}

function executionTarget(
  state: MatchCoreState,
  player: MatchPlayerState,
  target: Vector2,
  skill: number,
  maxErrorMeters: number,
  key: string,
): Vector2 {
  const errorStrength = clamp((100 - skill) / 65, 0.04, 1);
  const lateral = (deterministicUnit(state, `${key}:y`) * 2 - 1) * maxErrorMeters * errorStrength;
  const longitudinal = (deterministicUnit(state, `${key}:x`) * 2 - 1) * maxErrorMeters * 0.35 * errorStrength;
  return {
    x: target.x + longitudinal * (player.side === "home" ? 1 : -1),
    y: target.y + lateral,
  };
}

function isOffsideTarget(state: MatchCoreState, owner: MatchPlayerState, target: MatchPlayerState) {
  if (target.role === "GOL") return false;
  const half = state.pitch.length / 2;
  const inOpponentHalf = owner.side === "home" ? target.position.x > half : target.position.x < half;
  if (!inOpponentHalf) return false;
  const opponents = state.players
    .filter((player) => player.active && !player.redCard && player.side !== owner.side)
    .map((player) => player.position.x)
    .sort((a, b) => owner.side === "home" ? b - a : a - b);
  if (opponents.length < 2) return false;
  const secondLast = opponents[1];
  if (owner.side === "home") {
    const line = Math.max(state.ball.position.x, secondLast);
    return target.position.x > line + 0.08;
  }
  const line = Math.min(state.ball.position.x, secondLast);
  return target.position.x < line - 0.08;
}

function offsideRestart(
  state: MatchCoreState,
  owner: MatchPlayerState,
  target: MatchPlayerState,
  config: MatchCoreConfig,
): MatchCoreState {
  const defending = oppositeSide(owner.side);
  let next: MatchCoreState = {
    ...state,
    restart: {
      type: "free-kick",
      side: defending,
      position: { ...target.position },
      ticksRemaining: config.restartDelayTicks,
      label: "Impedimento",
    },
    clock: addMatchStoppage(state.clock, 8),
    ball: {
      ...state.ball,
      position: { ...target.position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  };
  next = updateTeamStat(next, owner.side, "offsides");
  next = updatePlayerStats(next, target.id, { offsides: 1 });
  next = appendMatchEvent(next, { tick: state.tick, type: "offside", playerId: target.id, side: owner.side });
  return appendMatchEvent(next, { tick: state.tick, type: "restart", restart: "free-kick", side: defending });
}

function kickBall(
  state: MatchCoreState,
  owner: MatchPlayerState,
  target: Vector2,
  speed: number,
  cooldown: number,
): MatchCoreState {
  const direction = normalize(
    { x: target.x - owner.position.x, y: target.y - owner.position.y },
    owner.facing ?? { x: owner.side === "home" ? 1 : -1, y: 0 },
  );
  return withCooldown({
    ...state,
    ball: {
      ...state.ball,
      possessionPlayerId: null,
      position: {
        x: owner.position.x + direction.x * 0.8,
        y: owner.position.y + direction.y * 0.8,
      },
      velocity: { x: direction.x * speed, y: direction.y * speed },
      previousTouchPlayerId: state.ball.lastTouchPlayerId && state.ball.lastTouchPlayerId !== owner.id
        ? state.ball.lastTouchPlayerId
        : state.ball.previousTouchPlayerId,
      lastTouchPlayerId: owner.id,
      lastTouchSide: owner.side,
      pickupCooldownTicks: 10,
    },
  }, owner.id, cooldown);
}

export function claimLooseBall(state: MatchCoreState, config: MatchCoreConfig): MatchCoreState {
  if (state.restart || state.ball.possessionPlayerId || state.ball.pickupCooldownTicks > 0) return state;
  const ballSpeed = Math.hypot(state.ball.velocity.x, state.ball.velocity.y);
  const candidates = state.players
    .filter((player) => {
      if (!player.active || player.redCard) return false;
      const ratings = player.ratings ?? fallbackRatings;
      const keeperBonus = player.role === "GOL"
        ? 0.45 + ratings.goalkeeping / 220
        : ratings.dribbling / 500;
      return distance(player.position, state.ball.position)
        <= config.possessionRadius + keeperBonus + Math.min(0.45, ballSpeed * 0.015);
    })
    .sort((a, b) => {
      const aDistance = distance(a.position, state.ball.position);
      const bDistance = distance(b.position, state.ball.position);
      if (Math.abs(aDistance - bDistance) > 0.03) return aDistance - bDistance;
      const aControl = a.role === "GOL" ? (a.ratings?.goalkeeping ?? 20) : (a.ratings?.dribbling ?? 65);
      const bControl = b.role === "GOL" ? (b.ratings?.goalkeeping ?? 20) : (b.ratings?.dribbling ?? 65);
      if (Math.abs(aControl - bControl) > 1) return bControl - aControl;
      if (Math.abs(a.stamina - b.stamina) > 0.5) return b.stamina - a.stamina;
      return a.id.localeCompare(b.id);
    });
  const winner = candidates[0];
  if (!winner) return state;

  let next: MatchCoreState = {
    ...state,
    ball: {
      ...state.ball,
      possessionPlayerId: winner.id,
      previousTouchPlayerId: state.ball.lastTouchPlayerId && state.ball.lastTouchPlayerId !== winner.id
        ? state.ball.lastTouchPlayerId
        : state.ball.previousTouchPlayerId,
      lastTouchPlayerId: winner.id,
      lastTouchSide: winner.side,
      pickupCooldownTicks: 0,
    },
  };
  next = updatePlayerStats(next, winner.id, { touches: 1 });

  const previousPlayer = state.ball.lastTouchPlayerId
    ? state.players.find((player) => player.id === state.ball.lastTouchPlayerId)
    : null;
  if (previousPlayer?.side === winner.side && previousPlayer.id !== winner.id) {
    next = updateTeamStat(next, winner.side, "completedPasses");
    next = updatePlayerStats(next, previousPlayer.id, { completedPasses: 1 });
  }
  return next;
}

export function resolvePossessionAction(
  state: MatchCoreState,
  inputs: ReadonlyMap<string, MatchInputFrame>,
  config: MatchCoreConfig,
): MatchCoreState {
  const ownerId = state.ball.possessionPlayerId;
  if (!ownerId || state.restart) return state;
  const owner = state.players.find((player) => player.id === ownerId && player.active && !player.redCard);
  if (!owner || (owner.actionCooldownTicks ?? 0) > 0) return state;
  const input = inputs.get(owner.id);
  if (!input) return state;
  const ratings = owner.ratings ?? fallbackRatings;

  if (input.shoot) {
    const intendedGoal = {
      x: owner.side === "home" ? state.pitch.length + 1.2 : -1.2,
      y: Math.max(
        state.pitch.width / 2 - 3,
        Math.min(state.pitch.width / 2 + 3, state.pitch.width / 2 + input.moveY * 2.2),
      ),
    };
    const goal = executionTarget(state, owner, intendedGoal, ratings.shooting, 4.8, "shot");
    const shotPower = config.shotSpeed * (0.82 + ratings.shooting / 100 * 0.3);
    let next = kickBall(state, owner, goal, shotPower, config.actionCooldownTicks);
    next = updateTeamStat(next, owner.side, "shots");
    next = updatePlayerStats(next, owner.id, { shots: 1 });
    return appendMatchEvent(next, { tick: state.tick, type: "shot", playerId: owner.id, side: owner.side });
  }

  if (input.pass || input.throughBall) {
    const target = choosePassTarget(owner, state, input, input.throughBall);
    if (!target) return state;
    let next = updateTeamStat(state, owner.side, "passes");
    next = updatePlayerStats(next, owner.id, { passes: 1 });
    if (isOffsideTarget(next, owner, target)) return offsideRestart(next, owner, target, config);

    const lead = input.throughBall
      ? {
          x: target.position.x + (owner.side === "home" ? 4.5 : -4.5),
          y: target.position.y,
        }
      : target.position;
    const precision = executionTarget(next, owner, lead, ratings.passing, input.throughBall ? 3.8 : 2.2, input.throughBall ? "through" : "pass");
    next = kickBall(
      next,
      owner,
      precision,
      (input.throughBall ? config.throughBallSpeed : config.passSpeed) * (0.9 + ratings.passing / 100 * 0.18),
      Math.round(config.actionCooldownTicks * 0.7),
    );
    return appendMatchEvent(next, {
      tick: state.tick,
      type: input.throughBall ? "through-ball" : "pass",
      playerId: owner.id,
      side: owner.side,
    });
  }
  return state;
}

function deterministicTackleSuccess(state: MatchCoreState, tackler: MatchPlayerState, owner: MatchPlayerState) {
  const defender = tackler.ratings ?? fallbackRatings;
  const attacker = owner.ratings ?? fallbackRatings;
  const staminaEdge = (tackler.stamina - owner.stamina) * 0.08;
  const chance = clamp(
    50
      + (defender.defending - attacker.dribbling) * 0.48
      + (defender.physical - attacker.physical) * 0.16
      + staminaEdge,
    24,
    82,
  );
  return deterministicUnit(state, `tackle:${tackler.id}:${owner.id}`) * 100 < chance;
}

function applyDiscipline(
  state: MatchCoreState,
  tackler: MatchPlayerState,
  owner: MatchPlayerState,
): MatchCoreState {
  const setup = state.teamSetup[tackler.side];
  const defender = tackler.ratings ?? fallbackRatings;
  const attacker = owner.ratings ?? fallbackRatings;
  const cardChance = clamp(
    12
      + setup.tactic.aggression * 0.28
      + setup.rivalryLevel * 0.14
      + Math.max(0, attacker.dribbling - defender.defending) * 0.25
      + Math.max(0, 35 - tackler.stamina) * 0.3,
    8,
    58,
  );
  const directRedChance = clamp((setup.tactic.aggression - 70) * 0.08 + setup.rivalryLevel * 0.025, 0.5, 6);
  const roll = deterministicUnit(state, `card:${tackler.id}:${owner.id}`) * 100;
  if (roll >= cardChance) return state;

  const current = state.players.find((player) => player.id === tackler.id) ?? tackler;
  const directRed = roll < directRedChance;
  const secondYellow = (current.yellowCards ?? 0) >= 1;
  if (directRed || secondYellow) {
    let next: MatchCoreState = {
      ...state,
      players: state.players.map((player) => player.id === tackler.id
        ? { ...player, redCard: true, active: false, velocity: { x: 0, y: 0 } }
        : player),
      clock: addMatchStoppage(state.clock, 18),
    };
    next = updateTeamStat(next, tackler.side, "redCards");
    next = updatePlayerStats(next, tackler.id, { redCards: 1 });
    return appendMatchEvent(next, { tick: state.tick, type: "red-card", playerId: tackler.id, side: tackler.side });
  }

  let next: MatchCoreState = {
    ...state,
    players: state.players.map((player) => player.id === tackler.id
      ? { ...player, yellowCards: (player.yellowCards ?? 0) + 1 }
      : player),
    clock: addMatchStoppage(state.clock, 10),
  };
  next = updateTeamStat(next, tackler.side, "yellowCards");
  next = updatePlayerStats(next, tackler.id, { yellowCards: 1 });
  return appendMatchEvent(next, { tick: state.tick, type: "yellow-card", playerId: tackler.id, side: tackler.side });
}

function applyCollisionInjury(
  state: MatchCoreState,
  tackler: MatchPlayerState,
  owner: MatchPlayerState,
): MatchCoreState {
  const setup = state.teamSetup[tackler.side];
  const physical = owner.ratings?.physical ?? 65;
  const chance = clamp(
    2.5
      + setup.tactic.aggression * 0.06
      + Math.max(0, 45 - owner.stamina) * 0.12
      + Math.max(0, 62 - physical) * 0.12,
    1.5,
    17,
  );
  const roll = deterministicUnit(state, `injury:${tackler.id}:${owner.id}`) * 100;
  if (roll >= chance || owner.injured) return state;
  const moderate = deterministicUnit(state, `injury-severity:${owner.id}`) < 0.28;
  const severity = moderate ? "Moderada" as const : "Leve" as const;
  let next: MatchCoreState = {
    ...state,
    players: state.players.map((player) => player.id === owner.id
      ? { ...player, injured: true, injurySeverity: severity }
      : player),
    clock: addMatchStoppage(state.clock, moderate ? 35 : 18),
  };
  next = updateTeamStat(next, owner.side, "injuries");
  return appendMatchEvent(next, { tick: state.tick, type: "injury", playerId: owner.id, side: owner.side, severity });
}

function shouldPlayAdvantage(state: MatchCoreState, owner: MatchPlayerState) {
  const attackingThird = owner.side === "home"
    ? owner.position.x >= state.pitch.length * 0.62
    : owner.position.x <= state.pitch.length * 0.38;
  return attackingThird && !owner.redCard && owner.injurySeverity !== "Moderada";
}

export function resolveTackles(
  state: MatchCoreState,
  inputs: ReadonlyMap<string, MatchInputFrame>,
  config: MatchCoreConfig,
): MatchCoreState {
  const ownerId = state.ball.possessionPlayerId;
  if (!ownerId || state.restart) return state;
  const owner = state.players.find((player) => player.id === ownerId && player.active && !player.redCard);
  if (!owner) return state;

  const tacklers = state.players
    .filter((player) =>
      player.active &&
      !player.redCard &&
      player.side !== owner.side &&
      (player.actionCooldownTicks ?? 0) <= 0 &&
      inputs.get(player.id)?.tackle &&
      distance(player.position, owner.position) <= config.tackleRadius
    )
    .sort((a, b) => distance(a.position, owner.position) - distance(b.position, owner.position));
  const tackler = tacklers[0];
  if (!tackler) return state;

  if (deterministicTackleSuccess(state, tackler, owner)) {
    let next = withCooldown({
      ...state,
      ball: {
        ...state.ball,
        possessionPlayerId: tackler.id,
        previousTouchPlayerId: owner.id,
        lastTouchPlayerId: tackler.id,
        lastTouchSide: tackler.side,
        pickupCooldownTicks: 0,
      },
    }, tackler.id, config.actionCooldownTicks);
    next = updateTeamStat(next, tackler.side, "tackles");
    next = updatePlayerStats(next, tackler.id, { tackles: 1, touches: 1 });
    return appendMatchEvent(next, { tick: state.tick, type: "tackle", playerId: tackler.id, side: tackler.side });
  }

  let next = withCooldown(state, tackler.id, config.actionCooldownTicks * 2);
  next = updateTeamStat(next, tackler.side, "fouls");
  next = updatePlayerStats(next, tackler.id, { fouls: 1 });
  next = appendMatchEvent(next, {
    tick: state.tick,
    type: "foul",
    playerId: tackler.id,
    side: tackler.side,
    againstPlayerId: owner.id,
  });
  next = applyDiscipline(next, tackler, owner);
  next = applyCollisionInjury(next, tackler, owner);

  if (shouldPlayAdvantage(next, owner) && next.players.find((player) => player.id === owner.id)?.active !== false) {
    next = {
      ...next,
      clock: addMatchStoppage(next.clock, 4),
      ball: {
        ...next.ball,
        possessionPlayerId: owner.id,
        lastTouchPlayerId: owner.id,
        lastTouchSide: owner.side,
      },
    };
    return appendMatchEvent(next, { tick: state.tick, type: "advantage", side: owner.side });
  }

  const freeKick: MatchRestartState = {
    type: "free-kick",
    side: owner.side,
    position: { ...owner.position },
    ticksRemaining: config.restartDelayTicks,
    label: "Falta",
  };
  next = {
    ...next,
    restart: freeKick,
    clock: addMatchStoppage(next.clock, 12),
    ball: {
      ...next.ball,
      position: { ...owner.position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  };
  return appendMatchEvent(next, { tick: state.tick, type: "restart", restart: "free-kick", side: owner.side });
}

export function resolveAutomaticSubstitutions(state: MatchCoreState): MatchCoreState {
  if (state.clock.phase !== "second-half" || state.clock.minute < 60 || state.restart) return state;
  let next = state;
  for (const side of ["home", "away"] as MatchSide[]) {
    if (next.stats[side].substitutions >= 3) continue;
    const candidate = next.players
      .filter((player) =>
        player.side === side &&
        player.active &&
        !player.controlled &&
        !player.redCard &&
        !player.substituted &&
        player.role !== "GOL" &&
        (player.injurySeverity === "Moderada" || player.stamina < 30)
      )
      .sort((a, b) => {
        if (a.injurySeverity === "Moderada" && b.injurySeverity !== "Moderada") return -1;
        if (b.injurySeverity === "Moderada" && a.injurySeverity !== "Moderada") return 1;
        return a.stamina - b.stamina;
      })[0];
    if (!candidate) continue;

    next = {
      ...next,
      players: next.players.map((player) => player.id === candidate.id
        ? {
            ...player,
            substituted: true,
            injured: false,
            injurySeverity: "",
            stamina: Math.max(76, player.stamina),
            actionCooldownTicks: 0,
          }
        : player),
      clock: addMatchStoppage(next.clock, 22),
    };
    next = updateTeamStat(next, side, "substitutions");
    next = appendMatchEvent(next, { tick: next.tick, type: "substitution", playerId: candidate.id, side });
  }
  return next;
}

export function giveRestartPossession(state: MatchCoreState): MatchCoreState {
  if (!state.restart || state.restart.ticksRemaining > 0) return state;
  const restart = state.restart;
  const candidate = state.players
    .filter((player) => player.active && !player.redCard && player.side === restart.side)
    .sort((a, b) => distance(a.position, restart.position) - distance(b.position, restart.position))[0];
  if (!candidate) return { ...state, restart: null };

  let next: MatchCoreState = {
    ...state,
    restart: null,
    ball: {
      ...state.ball,
      position: { ...restart.position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: candidate.id,
      previousTouchPlayerId: state.ball.lastTouchPlayerId,
      lastTouchPlayerId: candidate.id,
      lastTouchSide: candidate.side,
      pickupCooldownTicks: 0,
    },
  };
  next = updatePlayerStats(next, candidate.id, { touches: 1 });
  return next;
}

export function tickRestart(state: MatchCoreState): MatchCoreState {
  if (!state.restart) return state;
  return {
    ...state,
    ball: {
      ...state.ball,
      position: { ...state.restart.position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
    },
    restart: {
      ...state.restart,
      ticksRemaining: Math.max(0, state.restart.ticksRemaining - 1),
    },
  };
}

export function recordRestartStat(state: MatchCoreState, restart: MatchRestartState): MatchCoreState {
  if (restart.type === "corner") return updateTeamStat(state, restart.side, "corners");
  if (restart.type === "throw-in") return updateTeamStat(state, restart.side, "throwIns");
  return state;
}

export function awardGoal(state: MatchCoreState, side: MatchSide): MatchCoreState {
  const scorerId = state.ball.lastTouchPlayerId ?? undefined;
  const scorer = scorerId ? state.players.find((player) => player.id === scorerId) : undefined;
  const assistId = state.ball.previousTouchPlayerId ?? undefined;
  const assister = assistId ? state.players.find((player) => player.id === assistId) : undefined;

  let next: MatchCoreState = {
    ...state,
    clock: addMatchStoppage(state.clock, 18),
    score: {
      ...state.score,
      [side]: state.score[side] + 1,
    },
  };
  if (scorer && scorer.side === side) next = updatePlayerStats(next, scorer.id, { goals: 1 });
  if (assister && assister.side === side && assister.id !== scorer?.id) next = updatePlayerStats(next, assister.id, { assists: 1 });

  return appendMatchEvent(next, {
    tick: state.tick,
    type: "goal",
    side,
    scorerId: scorer?.side === side ? scorer.id : undefined,
    assistId: assister?.side === side && assister.id !== scorer?.id ? assister.id : undefined,
  });
}

export function opposite(side: MatchSide) {
  return oppositeSide(side);
}
