export type MatchPhase = "pre-match" | "first-half" | "half-time" | "second-half" | "finished" | "abandoned";
export type MatchSide = "home" | "away";

export type Vector2 = {
  x: number;
  y: number;
};

export type PitchDimensions = {
  length: number;
  width: number;
};

export type MatchClockState = {
  phase: MatchPhase;
  running: boolean;
  matchSeconds: number;
  periodSeconds: number;
  minute: number;
  second: number;
};

export type BallState = {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  possessionPlayerId: string | null;
  lastTouchSide: MatchSide | null;
};

export type MatchPlayerState = {
  id: string;
  side: MatchSide;
  role: string;
  controlled: boolean;
  active: boolean;
  position: Vector2;
  velocity: Vector2;
  stamina: number;
};

export type MatchScoreState = {
  home: number;
  away: number;
};

export type MatchCoreEvent =
  | { tick: number; type: "kickoff" | "half-time" | "second-half" | "full-time" | "pause" | "resume" }
  | { tick: number; type: "goal"; side: MatchSide }
  | { tick: number; type: "ball-out"; side: "left" | "right" | "top" | "bottom" };

export type MatchCoreState = {
  version: 1;
  matchId: string;
  tick: number;
  pitch: PitchDimensions;
  clock: MatchClockState;
  score: MatchScoreState;
  ball: BallState;
  players: MatchPlayerState[];
  paused: boolean;
  finished: boolean;
  events: MatchCoreEvent[];
};

export type MatchInputFrame = {
  moveX: number;
  moveY: number;
  sprint: boolean;
  pass: boolean;
  throughBall: boolean;
  shoot: boolean;
  tackle: boolean;
};

export type MatchCoreConfig = {
  fixedDeltaSeconds: number;
  halfDurationSeconds: number;
  playerSpeedMetersPerSecond: number;
  sprintMultiplier: number;
  staminaDrainPerSecond: number;
  staminaRecoveryPerSecond: number;
  ballFrictionPerSecond: number;
  maxFrameDeltaSeconds: number;
  maxCatchUpSteps: number;
};

export type MatchStateValidation = {
  valid: boolean;
  errors: string[];
};
