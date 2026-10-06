import { DEFAULT_MATCH_INPUT } from "./config.ts";
import type { MatchInputFrame } from "./types.ts";

function clampAxis(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

function normalizeAxes(x: number, y: number) {
  const safeX = clampAxis(x);
  const safeY = clampAxis(y);
  const length = Math.hypot(safeX, safeY);
  if (length <= 1) return { x: safeX, y: safeY };
  return { x: safeX / length, y: safeY / length };
}

export function normalizeMatchInput(input: Partial<MatchInputFrame> = {}): MatchInputFrame {
  const axes = normalizeAxes(input.moveX ?? 0, input.moveY ?? 0);
  return {
    ...DEFAULT_MATCH_INPUT,
    ...input,
    moveX: axes.x,
    moveY: axes.y,
    sprint: Boolean(input.sprint),
    pass: Boolean(input.pass),
    throughBall: Boolean(input.throughBall),
    shoot: Boolean(input.shoot),
    tackle: Boolean(input.tackle),
  };
}

export function keyboardInputFromKeys(keys: ReadonlySet<string>): MatchInputFrame {
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const up = keys.has("ArrowUp") || keys.has("KeyW");
  const down = keys.has("ArrowDown") || keys.has("KeyS");
  return normalizeMatchInput({
    moveX: Number(right) - Number(left),
    moveY: Number(down) - Number(up),
    sprint: keys.has("ShiftLeft") || keys.has("ShiftRight"),
    pass: keys.has("KeyJ"),
    throughBall: keys.has("KeyK"),
    shoot: keys.has("KeyL"),
    tackle: keys.has("Space"),
  });
}

export function touchInputFromVector(
  moveX: number,
  moveY: number,
  actions: Partial<Pick<MatchInputFrame, "sprint" | "pass" | "throughBall" | "shoot" | "tackle">> = {},
) {
  return normalizeMatchInput({ moveX, moveY, ...actions });
}

export function gamepadInputFromAxes(
  moveX: number,
  moveY: number,
  buttons: Partial<Pick<MatchInputFrame, "sprint" | "pass" | "throughBall" | "shoot" | "tackle">> = {},
) {
  const deadzone = 0.16;
  const x = Math.abs(moveX) < deadzone ? 0 : moveX;
  const y = Math.abs(moveY) < deadzone ? 0 : moveY;
  return normalizeMatchInput({ moveX: x, moveY: y, ...buttons });
}
