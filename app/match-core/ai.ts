import { normalizeMatchInput } from "./input.ts";
import type {
  MatchCoreState,
  MatchDifficulty,
  MatchInputFrame,
  MatchPlayerState,
  MatchSide,
  MatchTacticalProfile,
  Vector2,
} from "./types.ts";

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function distance(a: Vector2, b: Vector2) { return Math.hypot(a.x - b.x, a.y - b.y); }
function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}
function directionTo(from: Vector2, to: Vector2) {
  const dx = to.x - from.x, dy = to.y - from.y, magnitude = Math.hypot(dx, dy);
  return magnitude > 0.001 ? { x: dx / magnitude, y: dy / magnitude } : { x: 0, y: 0 };
}
function attackSign(side: MatchSide) { return side === "home" ? 1 : -1; }
function difficultyReaction(difficulty: MatchDifficulty) {
  return difficulty === "Promessa" ? 36 : difficulty === "Lenda" ? 12 : 22;
}
function difficultyQuality(difficulty: MatchDifficulty) {
  return difficulty === "Promessa" ? 0.78 : difficulty === "Lenda" ? 1.15 : 1;
}

export function getTacticalAnchor(
  player: MatchPlayerState,
  state: MatchCoreState,
  tactic: MatchTacticalProfile,
  phase: "attack" | "defend" | "neutral",
): Vector2 {
  const base = player.homePosition ?? player.position;
  if (player.role === "GOL") {
    return {
      x: player.side === "home" ? 5.8 : state.pitch.length - 5.8,
      y: clamp(state.ball.position.y, state.pitch.width / 2 - 9, state.pitch.width / 2 + 9),
    };
  }
  const sign = attackSign(player.side);
  const lineShift = (tactic.defensiveLine - 50) / 50 * 6.5 * sign;
  const phaseShift = phase === "attack"
    ? (2.5 + tactic.risk / 100 * 7.5) * sign
    : phase === "defend"
      ? -(2 + (100 - tactic.defensiveLine) / 100 * 4) * sign
      : 0;
  const widthScale = 0.72 + tactic.width / 100 * 0.62;
  return {
    x: clamp(base.x + lineShift + phaseShift, 2, state.pitch.length - 2),
    y: clamp(state.pitch.width / 2 + (base.y - state.pitch.width / 2) * widthScale, 2, state.pitch.width - 2),
  };
}

function pressureRank(player: MatchPlayerState, state: MatchCoreState, target: MatchPlayerState) {
  return state.players
    .filter((candidate) => candidate.active && candidate.side === player.side && candidate.role !== "GOL")
    .sort((a, b) => distance(a.position, target.position) - distance(b.position, target.position))
    .findIndex((candidate) => candidate.id === player.id);
}

function nearestMark(player: MatchPlayerState, state: MatchCoreState, anchor: Vector2) {
  return state.players
    .filter((candidate) => candidate.active && candidate.side !== player.side && candidate.role !== "GOL")
    .map((candidate) => ({ candidate, score: distance(candidate.position, anchor) + distance(candidate.position, player.position) * 0.35 }))
    .sort((a, b) => a.score - b.score)[0]?.candidate;
}

export function getFoundationAiInput(player: MatchPlayerState, state: MatchCoreState): MatchInputFrame {
  if (!player.active || player.controlled || state.restart || player.redCard) return normalizeMatchInput();

  const setup = state.teamSetup[player.side];
  const tactic = setup.tactic;
  const quality = difficultyQuality(setup.difficulty);
  const reactionWindow = difficultyReaction(setup.difficulty);
  const ratings = player.ratings ?? { pace: 65, shooting: 62, passing: 64, dribbling: 64, defending: 62, physical: 65, goalkeeping: 20 };
  const ballOwner = state.ball.possessionPlayerId ? state.players.find((candidate) => candidate.id === state.ball.possessionPlayerId) : null;
  const ownsBall = ballOwner?.id === player.id;
  const teammateOwnsBall = Boolean(ballOwner && ballOwner.side === player.side);
  const opponentOwnsBall = Boolean(ballOwner && ballOwner.side !== player.side);
  const attackGoal = { x: player.side === "home" ? state.pitch.length : 0, y: state.pitch.width / 2 };
  const ballDistance = distance(player.position, state.ball.position);
  const decisionSeed = stableHash(`${player.id}:${Math.floor(state.tick / reactionWindow)}:${tactic.id}`);
  const decision = decisionSeed % 1000;

  if (player.role === "GOL") {
    const ownGoalX = player.side === "home" ? 0 : state.pitch.length;
    const insideBox = player.side === "home" ? state.ball.position.x < 17 : state.ball.position.x > state.pitch.length - 17;
    if (!ballOwner && insideBox && ballDistance < 10 + ratings.goalkeeping / 20) {
      const target = directionTo(player.position, state.ball.position);
      return normalizeMatchInput({ moveX: target.x, moveY: target.y, sprint: ballDistance > 3 });
    }
    if (ownsBall) {
      const mate = state.players.filter((candidate) => candidate.side === player.side && candidate.role !== "GOL" && candidate.active)
        .sort((a,b)=>distance(a.position,player.position)-distance(b.position,player.position))[0];
      const target = mate ? directionTo(player.position,mate.position) : { x: attackSign(player.side), y: 0 };
      return normalizeMatchInput({ moveX: target.x, moveY: target.y, pass: decision % 7 === 0 });
    }
    const anchor = { x: player.side === "home" ? ownGoalX + 5.8 : ownGoalX - 5.8, y: clamp(state.ball.position.y, 25, 43) };
    const target = directionTo(player.position, anchor);
    return normalizeMatchInput({ moveX: target.x, moveY: target.y });
  }

  if (ownsBall) {
    const goalDistance = distance(player.position, attackGoal);
    const toGoal = directionTo(player.position, attackGoal);
    const shootThreshold = clamp((ratings.shooting - 50) * 0.5 + tactic.risk * 0.18 + (setup.difficulty === "Lenda" ? 8 : 0), 12, 62);
    const shoot = goalDistance < 20 + ratings.shooting / 10 && decision % 100 < shootThreshold;
    const passFrequency = clamp(7 + ratings.passing / 4 + (100 - tactic.tempo) / 10, 15, 42);
    const through = !shoot && goalDistance > 18 && tactic.risk > 55 && decision % 100 < passFrequency * 0.22;
    const pass = !shoot && !through && decision % 100 < passFrequency;
    return normalizeMatchInput({
      moveX: toGoal.x,
      moveY: toGoal.y,
      sprint: goalDistance > 17 && tactic.tempo > 55 && player.stamina > 25,
      shoot,
      pass,
      throughBall: through,
    });
  }

  if (opponentOwnsBall && ballOwner) {
    const rank = pressureRank(player, state, ballOwner);
    const pressers = tactic.pressing >= 82 ? 3 : tactic.pressing >= 60 ? 2 : 1;
    const ownerDistance = distance(player.position, ballOwner.position);
    const chaseRadius = (8 + tactic.pressing * 0.12 + setup.rivalryLevel * 0.04) * quality;
    if (rank >= 0 && rank < pressers && ownerDistance <= chaseRadius) {
      const target = directionTo(player.position, ballOwner.position);
      const tackleFrequency = clamp(70 - tactic.aggression * 0.45 - ratings.defending * 0.2, 14, 50);
      return normalizeMatchInput({
        moveX: target.x,
        moveY: target.y,
        sprint: ownerDistance > 2.4 && tactic.pressing > 55 && player.stamina > 22,
        tackle: ownerDistance <= 1.45 && decision % Math.max(8, Math.round(tackleFrequency / quality)) === 0,
      });
    }
    const anchor = getTacticalAnchor(player, state, tactic, "defend");
    const mark = nearestMark(player, state, anchor);
    const markBias = tactic.id === "marcacao-individual" ? 0.62 : 0.32;
    const targetPoint = mark ? {
      x: anchor.x * (1 - markBias) + mark.position.x * markBias,
      y: anchor.y * (1 - markBias) + mark.position.y * markBias,
    } : anchor;
    const target = directionTo(player.position, targetPoint);
    return normalizeMatchInput({ moveX: target.x, moveY: target.y, sprint: distance(player.position,targetPoint)>8 && tactic.tempo>70 });
  }

  if (!ballOwner && ballDistance <= 9 + tactic.pressing * 0.05) {
    const target = directionTo(player.position, state.ball.position);
    return normalizeMatchInput({ moveX: target.x, moveY: target.y, sprint: ballDistance > 4 && ratings.pace > 68 });
  }

  if (teammateOwnsBall && ballOwner) {
    const anchor = getTacticalAnchor(player, state, tactic, "attack");
    const sign = attackSign(player.side);
    const riskRun = tactic.risk > 60 && ratings.pace > 67 && decision % 100 < 18 * quality;
    const support = {
      x: clamp(anchor.x + (riskRun ? sign * (4 + ratings.pace / 25) : 0), 1, state.pitch.length - 1),
      y: anchor.y,
    };
    const target = directionTo(player.position, support);
    return normalizeMatchInput({ moveX: target.x, moveY: target.y, sprint: riskRun && player.stamina > 25 });
  }

  const anchor = getTacticalAnchor(player, state, tactic, "neutral");
  if (distance(player.position, anchor) < 0.4) return normalizeMatchInput();
  const target = directionTo(player.position, anchor);
  return normalizeMatchInput({ moveX: target.x, moveY: target.y });
}
