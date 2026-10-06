import type { MatchCoreConfig, MatchInputFrame, PitchDimensions } from "./types.ts";

export const MATCH_CORE_SCHEMA_VERSION = 1 as const;

export const DEFAULT_PITCH: PitchDimensions = {
  length: 105,
  width: 68,
};

export const DEFAULT_MATCH_INPUT: MatchInputFrame = {
  moveX: 0,
  moveY: 0,
  sprint: false,
  pass: false,
  throughBall: false,
  shoot: false,
  tackle: false,
};

export const DEFAULT_MATCH_CORE_CONFIG: MatchCoreConfig = {
  fixedDeltaSeconds: 1 / 60,
  matchClockRate: 15,
  halfDurationSeconds: 45 * 60,
  playerSpeedMetersPerSecond: 5.8,
  sprintMultiplier: 1.42,
  playerAcceleration: 22,
  playerDeceleration: 28,
  staminaDrainPerSecond: 4.5,
  staminaRecoveryPerSecond: 2.2,
  ballFrictionPerSecond: 0.82,
  ballMaxSpeed: 34,
  passSpeed: 16,
  throughBallSpeed: 21,
  shotSpeed: 29,
  possessionRadius: 1.15,
  tackleRadius: 1.45,
  actionCooldownTicks: 20,
  restartDelayTicks: 30,
  maxFrameDeltaSeconds: 0.25,
  maxCatchUpSteps: 18,
};
