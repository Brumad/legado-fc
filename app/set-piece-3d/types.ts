import type { MatchCoreState, MatchPlayerRatings, MatchRestartState, MatchSide, Vector2 } from "../match-core/types.ts";

export type SetPiece3DKind = "free-kick-direct" | "free-kick-cross" | "corner";
export type SetPiece3DOutcome = "goal" | "saved" | "out" | "cleared" | "rebound";
export type SetPieceRendererMode = "webgl" | "fallback-2d";

export type SetPieceVector3 = { x: number; y: number; z: number };

export type SetPieceInput = {
  aimX: number;
  lift: number;
  curve: number;
  power: number;
};

export type SetPieceAreaPlayer = {
  id: string;
  side: MatchSide;
  role: string;
  position: Vector2;
  ratings: MatchPlayerRatings;
};

export type SetPiece3DRequest = {
  id: string;
  kind: SetPiece3DKind;
  matchId: string;
  tick: number;
  attackingSide: MatchSide;
  defendingSide: MatchSide;
  takerId: string;
  keeperId: string;
  restart: MatchRestartState;
  origin2D: Vector2;
  goalX2D: number;
  goalCenterY2D: number;
  distanceToGoal: number;
  goalOffsetX: number;
  wallCount: number;
  cornerEdge: "top" | "bottom" | null;
  takerRatings: MatchPlayerRatings;
  keeperRatings: MatchPlayerRatings;
  areaPlayers: SetPieceAreaPlayer[];
  snapshot: Pick<MatchCoreState, "score" | "clock">;
};

export type SetPieceTrajectoryPoint = SetPieceVector3 & {
  t: number;
  vx: number;
  vy: number;
  vz: number;
};

export type SetPieceKeeperResolution = {
  reactionSeconds: number;
  targetX: number;
  targetY: number;
  maxReach: number;
  reached: boolean;
};

export type SetPiece3DResult = {
  requestId: string;
  kind: SetPiece3DKind;
  outcome: SetPiece3DOutcome;
  attackingSide: MatchSide;
  defendingSide: MatchSide;
  takerId: string;
  winnerPlayerId: string | null;
  winnerSide: MatchSide | null;
  trajectory: SetPieceTrajectoryPoint[];
  keeper: SetPieceKeeperResolution;
  finalBall: SetPieceVector3;
  shotOnTarget: boolean;
  renderer: SetPieceRendererMode;
};

export type SetPieceEligibility = {
  eligible: boolean;
  reason: string;
  request: SetPiece3DRequest | null;
};
