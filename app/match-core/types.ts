export type MatchPhase = "pre-match" | "first-half" | "half-time" | "second-half" | "finished" | "abandoned";
export type MatchSide = "home" | "away";
export type MatchRestartType = "kickoff" | "throw-in" | "goal-kick" | "corner" | "free-kick";

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
  lastTouchPlayerId: string | null;
  previousTouchPlayerId: string | null;
  pickupCooldownTicks: number;
};

export type MatchPlayerState = {
  id: string;
  side: MatchSide;
  role: string;
  controlled: boolean;
  active: boolean;
  position: Vector2;
  homePosition?: Vector2;
  velocity: Vector2;
  facing?: Vector2;
  stamina: number;
  actionCooldownTicks?: number;
};

export type MatchScoreState = {
  home: number;
  away: number;
};

export type MatchRestartState = {
  type: MatchRestartType;
  side: MatchSide;
  position: Vector2;
  ticksRemaining: number;
  label: string;
};

export type MatchPlayerRuntimeStats = {
  goals: number;
  assists: number;
  shots: number;
  passes: number;
  completedPasses: number;
  tackles: number;
  fouls: number;
  touches: number;
};

export type MatchTeamRuntimeStats = {
  possessionTicks: number;
  shots: number;
  passes: number;
  completedPasses: number;
  tackles: number;
  fouls: number;
  corners: number;
  throwIns: number;
};

export type MatchRuntimeStats = {
  home: MatchTeamRuntimeStats;
  away: MatchTeamRuntimeStats;
  players: Record<string, MatchPlayerRuntimeStats>;
};

export type MatchCoreEvent =
  | { tick: number; type: "kickoff" | "half-time" | "second-half" | "full-time" | "pause" | "resume" | "abandon" }
  | { tick: number; type: "goal"; side: MatchSide; scorerId?: string; assistId?: string }
  | { tick: number; type: "ball-out"; edge: "left" | "right" | "top" | "bottom" }
  | { tick: number; type: "restart"; restart: MatchRestartType; side: MatchSide }
  | { tick: number; type: "pass" | "through-ball" | "shot" | "tackle"; playerId: string; side: MatchSide }
  | { tick: number; type: "foul"; playerId: string; side: MatchSide; againstPlayerId: string };

export type MatchCoreState = {
  version: 1;
  matchId: string;
  tick: number;
  pitch: PitchDimensions;
  clock: MatchClockState;
  score: MatchScoreState;
  ball: BallState;
  players: MatchPlayerState[];
  restart: MatchRestartState | null;
  stats: MatchRuntimeStats;
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
  matchClockRate: number;
  halfDurationSeconds: number;
  playerSpeedMetersPerSecond: number;
  sprintMultiplier: number;
  playerAcceleration: number;
  playerDeceleration: number;
  staminaDrainPerSecond: number;
  staminaRecoveryPerSecond: number;
  ballFrictionPerSecond: number;
  ballMaxSpeed: number;
  passSpeed: number;
  throughBallSpeed: number;
  shotSpeed: number;
  possessionRadius: number;
  tackleRadius: number;
  actionCooldownTicks: number;
  restartDelayTicks: number;
  maxFrameDeltaSeconds: number;
  maxCatchUpSteps: number;
};

export type MatchStateValidation = {
  valid: boolean;
  errors: string[];
};
