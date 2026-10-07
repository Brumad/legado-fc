import type { MatchSide, Vector2 } from "../match-core/types.ts";

export type SetPieceKind = "free-kick-direct" | "free-kick-cross" | "corner";
export type SetPieceOutcome = "goal" | "saved" | "blocked" | "wide" | "cleared" | "rebound" | "cross-complete";
export type SetPiecePhase = "aiming" | "flight" | "second-ball" | "resolved";
export type SetPieceCornerSide = "top" | "bottom";

export type Vector3 = { x: number; y: number; z: number };

export type SetPieceTechnique = {
  shooting: number;
  passing: number;
  dribbling: number;
  physical: number;
  foot: "Direito" | "Esquerdo";
};

export type SetPieceKeeper = {
  playerId: string;
  goalkeeping: number;
  position: Vector3;
  reactionDelay: number;
  maxSpeed: number;
  reach: number;
};

export type SetPieceActor = {
  playerId: string;
  side: MatchSide;
  role: string;
  position: Vector3;
  rating: number;
};

export type SetPieceContext = {
  id: string;
  matchId: string;
  kind: SetPieceKind;
  attackingSide: MatchSide;
  defendingSide: MatchSide;
  takerId: string;
  origin2D: Vector2;
  origin: Vector3;
  goalX: number;
  goalCenterZ: number;
  goalWidth: number;
  goalHeight: number;
  distanceToGoal: number;
  cornerSide?: SetPieceCornerSide;
  wall: SetPieceActor[];
  attackers: SetPieceActor[];
  defenders: SetPieceActor[];
  keeper: SetPieceKeeper;
  technique: SetPieceTechnique;
};

export type SetPieceGesture = {
  aimX: number;
  aimY: number;
  power: number;
  curve: number;
};

export type SetPieceBallState = {
  position: Vector3;
  velocity: Vector3;
  spin: number;
  radius: number;
  bounces: number;
};

export type SetPieceRuntimeState = {
  context: SetPieceContext;
  phase: SetPiecePhase;
  elapsed: number;
  ball: SetPieceBallState;
  keeper: SetPieceKeeper;
  gesture: SetPieceGesture;
  touchedBy?: string;
  headerBy?: string;
  result?: SetPieceResult;
  samples: Vector3[];
};

export type SetPieceResult = {
  kind: SetPieceKind;
  outcome: SetPieceOutcome;
  attackingSide: MatchSide;
  defendingSide: MatchSide;
  takerId: string;
  receiverId?: string;
  keeperId: string;
  endPosition: Vector3;
  endPosition2D: Vector2;
  endVelocity2D: Vector2;
  goal: boolean;
  saved: boolean;
  blocked: boolean;
  elapsed: number;
};

export type SetPieceSimulationConfig = {
  fixedDelta: number;
  gravity: number;
  drag: number;
  magnus: number;
  groundRestitution: number;
  groundFriction: number;
  maxSeconds: number;
};

export const DEFAULT_SET_PIECE_CONFIG: SetPieceSimulationConfig = {
  fixedDelta: 1 / 120,
  gravity: 9.81,
  drag: 0.055,
  magnus: 0.017,
  groundRestitution: 0.36,
  groundFriction: 0.78,
  maxSeconds: 7.5,
};
