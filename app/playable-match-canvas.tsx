"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  DEFAULT_MATCH_CORE_CONFIG,
  gamepadInputFromAxes,
  keyboardInputFromKeys,
  normalizeMatchInput,
  touchInputFromVector,
} from "./match-core/index.ts";
import { createFollowCamera, drawMatchFrame } from "./match-core/renderer.ts";
import { FixedStepMatchRuntime } from "./match-core/simulation.ts";
import type { MatchCoreConfig, MatchCoreState, MatchInputFrame } from "./match-core/types.ts";

export type PlayableMatchCanvasHandle = {
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  startSecondHalf: () => void;
  abandon: () => void;
  getState: () => MatchCoreState | null;
};

export type PlayableMatchCanvasProps = {
  initialState: MatchCoreState;
  className?: string;
  autoStart?: boolean;
  config?: Partial<MatchCoreConfig>;
  onSnapshot?: (state: MatchCoreState) => void;
  onFinished?: (state: MatchCoreState) => void;
};

type TouchState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  sprint: boolean;
  pass: boolean;
  throughBall: boolean;
  shoot: boolean;
  tackle: boolean;
};

const emptyTouchState = (): TouchState => ({
  left: false,
  right: false,
  up: false,
  down: false,
  sprint: false,
  pass: false,
  throughBall: false,
  shoot: false,
  tackle: false,
});

function mergeInputs(
  keyboard: MatchInputFrame,
  touch: TouchState,
  gamepad: MatchInputFrame,
): MatchInputFrame {
  const touchInput = touchInputFromVector(
    Number(touch.right) - Number(touch.left),
    Number(touch.down) - Number(touch.up),
    {
      sprint: touch.sprint,
      pass: touch.pass,
      throughBall: touch.throughBall,
      shoot: touch.shoot,
      tackle: touch.tackle,
    },
  );
  return normalizeMatchInput({
    moveX: keyboard.moveX + touchInput.moveX + gamepad.moveX,
    moveY: keyboard.moveY + touchInput.moveY + gamepad.moveY,
    sprint: keyboard.sprint || touchInput.sprint || gamepad.sprint,
    pass: keyboard.pass || touchInput.pass || gamepad.pass,
    throughBall: keyboard.throughBall || touchInput.throughBall || gamepad.throughBall,
    shoot: keyboard.shoot || touchInput.shoot || gamepad.shoot,
    tackle: keyboard.tackle || touchInput.tackle || gamepad.tackle,
  });
}

function readGamepad(): MatchInputFrame {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return normalizeMatchInput();
  const pad = Array.from(navigator.getGamepads()).find(Boolean);
  if (!pad) return normalizeMatchInput();
  return gamepadInputFromAxes(
    pad.axes[0] ?? 0,
    pad.axes[1] ?? 0,
    {
      pass: Boolean(pad.buttons[0]?.pressed),
      shoot: Boolean(pad.buttons[1]?.pressed),
      tackle: Boolean(pad.buttons[2]?.pressed),
      throughBall: Boolean(pad.buttons[3]?.pressed),
      sprint: Boolean(pad.buttons[4]?.pressed || pad.buttons[5]?.pressed),
    },
  );
}

export const PlayableMatchCanvas = forwardRef<PlayableMatchCanvasHandle, PlayableMatchCanvasProps>(
  function PlayableMatchCanvas({
    initialState,
    className = "",
    autoStart = true,
    config,
    onSnapshot,
    onFinished,
  }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const runtimeRef = useRef<FixedStepMatchRuntime | null>(null);
    const keyboardKeysRef = useRef(new Set<string>());
    const touchRef = useRef<TouchState>(emptyTouchState());
    const finishedReportedRef = useRef(false);
    const onSnapshotRef = useRef(onSnapshot);
    const onFinishedRef = useRef(onFinished);

    onSnapshotRef.current = onSnapshot;
    onFinishedRef.current = onFinished;

    useImperativeHandle(ref, () => ({
      pause() { runtimeRef.current?.pause(); },
      resume() { runtimeRef.current?.resume(); },
      togglePause() {
        const runtime = runtimeRef.current;
        if (!runtime) return;
        if (runtime.state.paused) runtime.resume();
        else runtime.pause();
      },
      startSecondHalf() { runtimeRef.current?.startSecondHalf(); },
      abandon() { runtimeRef.current?.abandon(); },
      getState() { return runtimeRef.current?.state ?? null; },
    }), []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const runtime = new FixedStepMatchRuntime(initialState, {
        ...DEFAULT_MATCH_CORE_CONFIG,
        ...config,
      });
      runtimeRef.current = runtime;
      finishedReportedRef.current = false;
      if (autoStart) runtime.start();
      onSnapshotRef.current?.(runtime.state);

      const onKeyDown = (event: KeyboardEvent) => {
        keyboardKeysRef.current.add(event.code);
        if ([
          "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
          "KeyW", "KeyA", "KeyS", "KeyD",
          "KeyJ", "KeyK", "KeyL", "Space",
        ].includes(event.code)) event.preventDefault();
        if (event.code === "Escape" && !event.repeat) {
          if (runtime.state.paused) runtime.resume();
          else runtime.pause();
          onSnapshotRef.current?.(runtime.state);
        }
      };
      const onKeyUp = (event: KeyboardEvent) => {
        keyboardKeysRef.current.delete(event.code);
      };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      let animationFrame = 0;
      let previous = performance.now();
      let snapshotCounter = 0;

      const render = (now: number) => {
        const rect = canvas.getBoundingClientRect();
        const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
        const width = Math.max(1, Math.round(rect.width * pixelRatio));
        const height = Math.max(1, Math.round(rect.height * pixelRatio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const keyboard = keyboardInputFromKeys(keyboardKeysRef.current);
        const gamepad = readGamepad();
        runtime.setInput(mergeInputs(keyboard, touchRef.current, gamepad));

        const deltaSeconds = Math.min(0.25, Math.max(0, (now - previous) / 1000));
        previous = now;
        runtime.advanceFrame(deltaSeconds);

        const context = canvas.getContext("2d");
        if (context) {
          const padding = Math.max(7 * pixelRatio, Math.min(width, height) * 0.018);
          const viewport = {
            width,
            height,
            padding,
            camera: createFollowCamera(runtime.state, { width, height, padding }),
          };
          drawMatchFrame(context, runtime.state, viewport);
        }

        snapshotCounter += 1;
        if (snapshotCounter >= 6 || runtime.state.clock.phase === "half-time" || runtime.state.finished) {
          snapshotCounter = 0;
          onSnapshotRef.current?.(runtime.state);
        }
        if (runtime.state.finished && !finishedReportedRef.current) {
          finishedReportedRef.current = true;
          onFinishedRef.current?.(runtime.state);
        }

        animationFrame = window.requestAnimationFrame(render);
      };

      animationFrame = window.requestAnimationFrame(render);
      return () => {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        runtime.pause();
        runtimeRef.current = null;
      };
    }, [autoStart, config, initialState]);

    function setTouch(key: keyof TouchState, value: boolean) {
      touchRef.current = { ...touchRef.current, [key]: value };
    }

    function actionButton(key: keyof TouchState, label: string, className = "") {
      return (
        <button
          type="button"
          className={className}
          aria-label={label}
          onPointerDown={(event) => { event.preventDefault(); setTouch(key, true); }}
          onPointerUp={() => setTouch(key, false)}
          onPointerCancel={() => setTouch(key, false)}
          onPointerLeave={() => setTouch(key, false)}
        >
          {label}
        </button>
      );
    }

    return (
      <div className={`playable-match-canvas-shell ${className}`} data-playable-canvas>
        <canvas
          ref={canvasRef}
          className="playable-match-canvas"
          tabIndex={0}
          aria-label="Campo 2D jogável do Legado FC"
        />
        <div className="playable-touch-layer" aria-label="Controles de toque">
          <div className="playable-dpad">
            {actionButton("up", "↑", "is-up")}
            {actionButton("left", "←", "is-left")}
            {actionButton("right", "→", "is-right")}
            {actionButton("down", "↓", "is-down")}
            {actionButton("sprint", "SPRINT", "is-sprint")}
          </div>
          <div className="playable-actions">
            {actionButton("throughBall", "PROF", "is-through")}
            {actionButton("pass", "PASSE", "is-pass")}
            {actionButton("tackle", "BOTE", "is-tackle")}
            {actionButton("shoot", "CHUTE", "is-shoot")}
          </div>
        </div>
      </div>
    );
  },
);
