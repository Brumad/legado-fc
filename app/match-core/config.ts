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
  halfDurationSeconds: 45 * 60,
  playerSpeedMetersPerSecond: 5.8,
  sprintMultiplier: 1.42,
  staminaDrainPerSecond: 4.5,
  staminaRecoveryPerSecond: 2.2,
  ballFrictionPerSecond: 1.8,
  maxFrameDeltaSeconds: 0.25,
  maxCatchUpSteps: 18,
};
