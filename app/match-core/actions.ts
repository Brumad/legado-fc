import { appendMatchEvent } from "./state.ts";
import { oppositeSide } from "./rules.ts";
import type {
  MatchCoreConfig,
  MatchCoreState,
  MatchInputFrame,
  MatchPlayerRuntimeStats,
  MatchPlayerState,
  MatchRestartState,
  MatchSide,
  Vector2,
} from "./types.ts";

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

function updateTeamStat(
  state: MatchCoreState,
  side: MatchSide,
  key: "shots" | "passes" | "completedPasses" | "tackles" | "fouls" | "corners" | "throwIns",
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
  const teammates = state.players.filter((player) => player.active && player.side === owner.side && player.id !== owner.id);
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
      const score = alignment * 5 + Math.min(throughBall ? 30 : 20, range) * 0.04 + forwardBias * (throughBall ? 0.045 : 0.015) - range * 0.03;
      return { teammate, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.teammate ?? null;
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
    .filter((player) => player.active && distance(player.position, state.ball.position) <= config.possessionRadius + Math.min(0.45, ballSpeed * 0.015))
    .sort((a, b) => {
      const aDistance = distance(a.position, state.ball.position);
      const bDistance = distance(b.position, state.ball.position);
      if (Math.abs(aDistance - bDistance) > 0.03) return aDistance - bDistance;
      if (Math.abs(a.stamina - b.stamina) > 0.5) return b.stamina - a.stamina;
      return a.id.localeCompare(b.id);
    });
  const winner = candidates[0];
  if (!winner) return state;

  let next = {
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
  const owner = state.players.find((player) => player.id === ownerId && player.active);
  if (!owner || (owner.actionCooldownTicks ?? 0) > 0) return state;
  const input = inputs.get(owner.id);
  if (!input) return state;

  if (input.shoot) {
    const goal = {
      x: owner.side === "home" ? state.pitch.length + 1.2 : -1.2,
      y: Math.max(
        state.pitch.width / 2 - 3,
        Math.min(state.pitch.width / 2 + 3, state.pitch.width / 2 + input.moveY * 2.2),
      ),
    };
    let next = kickBall(state, owner, goal, config.shotSpeed, config.actionCooldownTicks);
    next = updateTeamStat(next, owner.side, "shots");
    next = updatePlayerStats(next, owner.id, { shots: 1 });
    return appendMatchEvent(next, { tick: state.tick, type: "shot", playerId: owner.id, side: owner.side });
  }

  if (input.pass || input.throughBall) {
    const target = choosePassTarget(owner, state, input, input.throughBall);
    if (!target) return state;
    const lead = input.throughBall
      ? {
          x: target.position.x + (owner.side === "home" ? 4.5 : -4.5),
          y: target.position.y,
        }
      : target.position;
    let next = kickBall(
      state,
      owner,
      lead,
      input.throughBall ? config.throughBallSpeed : config.passSpeed,
      Math.round(config.actionCooldownTicks * 0.7),
    );
    next = updateTeamStat(next, owner.side, "passes");
    next = updatePlayerStats(next, owner.id, { passes: 1 });
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
  let hash = state.tick * 1103515245 + tackler.id.length * 97 + owner.id.length * 53;
  for (const char of tackler.id) hash = (hash ^ char.charCodeAt(0)) * 16777619;
  return Math.abs(hash % 100) < 62;
}

export function resolveTackles(
  state: MatchCoreState,
  inputs: ReadonlyMap<string, MatchInputFrame>,
  config: MatchCoreConfig,
): MatchCoreState {
  const ownerId = state.ball.possessionPlayerId;
  if (!ownerId || state.restart) return state;
  const owner = state.players.find((player) => player.id === ownerId && player.active);
  if (!owner) return state;

  const tacklers = state.players
    .filter((player) =>
      player.active &&
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

  const freeKick: MatchRestartState = {
    type: "free-kick",
    side: owner.side,
    position: { ...owner.position },
    ticksRemaining: config.restartDelayTicks,
    label: "Falta",
  };
  let next = withCooldown({
    ...state,
    restart: freeKick,
    ball: {
      ...state.ball,
      position: { ...owner.position },
      velocity: { x: 0, y: 0 },
      possessionPlayerId: null,
      pickupCooldownTicks: config.restartDelayTicks,
    },
  }, tackler.id, config.actionCooldownTicks * 2);
  next = updateTeamStat(next, tackler.side, "fouls");
  next = updatePlayerStats(next, tackler.id, { fouls: 1 });
  next = appendMatchEvent(next, {
    tick: state.tick,
    type: "foul",
    playerId: tackler.id,
    side: tackler.side,
    againstPlayerId: owner.id,
  });
  return appendMatchEvent(next, { tick: state.tick, type: "restart", restart: "free-kick", side: owner.side });
}

export function giveRestartPossession(state: MatchCoreState): MatchCoreState {
  if (!state.restart || state.restart.ticksRemaining > 0) return state;
  const restart = state.restart;
  const candidate = state.players
    .filter((player) => player.active && player.side === restart.side)
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
    score: {
      ...state.score,
      [side]: state.score[side] + 1,
    },
  };
  if (scorer && scorer.side === side) {
    next = updatePlayerStats(next, scorer.id, { goals: 1 });
  }
  if (assister && assister.side === side && assister.id !== scorer?.id) {
    next = updatePlayerStats(next, assister.id, { assists: 1 });
  }

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
