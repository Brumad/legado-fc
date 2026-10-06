export type MatchPhase = "pre-match" | "first-half" | "half-time" | "second-half" | "finished" | "abandoned";
export type MatchSide = "home" | "away";
export type MatchRestartType = "kickoff" | "throw-in" | "goal-kick" | "corner" | "free-kick";
export type MatchDifficulty = "Promessa" | "Profissional" | "Lenda";

export type Vector2 = { x: number; y: number };
export type PitchDimensions = { length: number; width: number };

export type MatchClockState = {
  phase: MatchPhase;
  running: boolean;
  matchSeconds: number;
  periodSeconds: number;
  minute: number;
  second: number;
  addedTimeSeconds: number;
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

export type MatchPlayerRatings = {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  goalkeeping: number;
};

export type MatchTacticalProfile = {
  id: string;
  name: string;
  formation: string;
  pressing: number;
  tempo: number;
  defensiveLine: number;
  width: number;
  aggression: number;
  risk: number;
};

export type MatchTeamSetup = {
  difficulty: MatchDifficulty;
  tactic: MatchTacticalProfile;
  rivalryLevel: number;
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
  ratings?: MatchPlayerRatings;
  actionCooldownTicks?: number;
  yellowCards?: number;
  redCard?: boolean;
  injured?: boolean;
  injurySeverity?: "" | "Leve" | "Moderada";
  substituted?: boolean;
};

export type MatchScoreState = { home: number; away: number };

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
  offsides: number;
  yellowCards: number;
  redCards: number;
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
  offsides: number;
  yellowCards: number;
  redCards: number;
  substitutions: number;
  injuries: number;
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
  | { tick: number; type: "foul"; playerId: string; side: MatchSide; againstPlayerId: string }
  | { tick: number; type: "offside"; playerId: string; side: MatchSide }
  | { tick: number; type: "yellow-card" | "red-card"; playerId: string; side: MatchSide }
  | { tick: number; type: "injury"; playerId: string; side: MatchSide; severity: "Leve" | "Moderada" }
  | { tick: number; type: "substitution"; playerId: string; side: MatchSide }
  | { tick: number; type: "advantage"; side: MatchSide };

export type MatchCoreState = {
  version: 1;
  matchId: string;
  tick: number;
  pitch: PitchDimensions;
  clock: MatchClockState;
  score: MatchScoreState;
  ball: BallState;
  players: MatchPlayerState[];
  teamSetup: Record<MatchSide, MatchTeamSetup>;
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

export type MatchStateValidation = { valid: boolean; errors: string[] };
