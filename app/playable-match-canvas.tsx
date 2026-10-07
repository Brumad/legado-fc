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
import { DEFAULT_MATCH_RENDER_THEME, createMatchCamera, drawMatchFrame, type MatchCameraMode, type MatchRenderTheme, type MatchVisualQuality } from "./match-core/renderer.ts";
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
  controlSize?: "small" | "medium" | "large";
  controlOpacity?: 0.55 | 0.75 | 1;
  controlsSide?: "standard" | "inverted";
  cameraMode?: MatchCameraMode;
  visualQuality?: MatchVisualQuality;
  visualEffects?: boolean;
  crowd?: boolean;
  renderTheme?: Partial<MatchRenderTheme>;
  onSnapshot?: (state: MatchCoreState) => void;
  onFinished?: (state: MatchCoreState) => void;
};

type TouchState = {
  moveX: number;
  moveY: number;
  sprint: boolean;
  pass: boolean;
  throughBall: boolean;
  shoot: boolean;
  tackle: boolean;
};

const emptyTouchState = (): TouchState => ({
  moveX: 0,
  moveY: 0,
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
  const touchInput = touchInputFromVector(touch.moveX, touch.moveY, {
    sprint: touch.sprint,
    pass: touch.pass,
    throughBall: touch.throughBall,
    shoot: touch.shoot,
    tackle: touch.tackle,
  });
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
    controlSize = "medium",
    controlOpacity = 0.75,
    controlsSide = "standard",
    cameraMode = "follow",
    visualQuality = "high",
    visualEffects = true,
    crowd = true,
    renderTheme,
    onSnapshot,
    onFinished,
  }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const joystickRef = useRef<HTMLDivElement>(null);
    const joystickKnobRef = useRef<HTMLSpanElement>(null);
    const runtimeRef = useRef<FixedStepMatchRuntime | null>(null);
    const keyboardKeysRef = useRef(new Set<string>());
    const touchRef = useRef<TouchState>(emptyTouchState());
    const joystickPointerRef = useRef<number | null>(null);
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
      const onKeyUp = (event: KeyboardEvent) => keyboardKeysRef.current.delete(event.code);
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

        runtime.setInput(mergeInputs(
          keyboardInputFromKeys(keyboardKeysRef.current),
          touchRef.current,
          readGamepad(),
        ));

        const deltaSeconds = Math.min(0.25, Math.max(0, (now - previous) / 1000));
        previous = now;
        runtime.advanceFrame(deltaSeconds);

        const context = canvas.getContext("2d");
        if (context) {
          const padding = Math.max(7 * pixelRatio, Math.min(width, height) * 0.018);
          drawMatchFrame(
            context,
            runtime.state,
            {
              width,
              height,
              padding,
              camera: createMatchCamera(runtime.state, { width, height, padding }, cameraMode),
            },
            { ...DEFAULT_MATCH_RENDER_THEME, ...(renderTheme ?? {}) },
            { quality: visualQuality, effects: visualEffects, crowd },
          );
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
    }, [autoStart, cameraMode, config, crowd, initialState, renderTheme, visualEffects, visualQuality]);

    function setTouchAction(key: Exclude<keyof TouchState, "moveX" | "moveY">, value: boolean) {
      touchRef.current = { ...touchRef.current, [key]: value };
    }

    function updateJoystick(clientX: number, clientY: number) {
      const base = joystickRef.current;
      const knob = joystickKnobRef.current;
      if (!base || !knob) return;
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = Math.max(1, rect.width * 0.34);
      const rawX = (clientX - centerX) / radius;
      const rawY = (clientY - centerY) / radius;
      const magnitude = Math.hypot(rawX, rawY);
      const capped = magnitude > 1 ? 1 / magnitude : 1;
      let x = rawX * capped;
      let y = rawY * capped;
      const deadZone = 0.12;
      const strength = Math.hypot(x, y);
      if (strength <= deadZone) {
        x = 0;
        y = 0;
      } else {
        const normalizedStrength = Math.min(1, (strength - deadZone) / (1 - deadZone));
        const scale = normalizedStrength / strength;
        x *= scale;
        y *= scale;
      }
      touchRef.current = { ...touchRef.current, moveX: x, moveY: y };
      knob.style.transform = `translate(${x * radius}px, ${y * radius}px)`;
    }

    function resetJoystick() {
      joystickPointerRef.current = null;
      touchRef.current = { ...touchRef.current, moveX: 0, moveY: 0 };
      if (joystickKnobRef.current) joystickKnobRef.current.style.transform = "translate(0px, 0px)";
    }

    function actionButton(key: Exclude<keyof TouchState, "moveX" | "moveY">, label: string, actionClass = "") {
      return (
        <button
          type="button"
          className={actionClass}
          aria-label={label}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture?.(event.pointerId);
            setTouchAction(key, true);
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture?.(event.pointerId);
            setTouchAction(key, false);
          }}
          onLostPointerCapture={() => setTouchAction(key, false)}
          onPointerCancel={() => setTouchAction(key, false)}
        >
          {label}
        </button>
      );
    }

    return (
      <div
        className={`playable-match-canvas-shell ${className}`}
        data-playable-canvas
        data-control-size={controlSize}
        data-control-side={controlsSide}
        style={{ "--mobile-control-opacity": controlOpacity } as React.CSSProperties}
      >
        <canvas ref={canvasRef} className="playable-match-canvas" tabIndex={0} aria-label="Campo 2D jogável do Legado FC" />
        <div className={`playable-touch-layer ${controlsSide === "inverted" ? "is-inverted" : ""}`} aria-label="Controles de toque">
          <div
            ref={joystickRef}
            className="playable-joystick"
            aria-label="Joystick virtual"
            onPointerDown={(event) => {
              event.preventDefault();
              joystickPointerRef.current = event.pointerId;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              updateJoystick(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (joystickPointerRef.current === event.pointerId) updateJoystick(event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture?.(event.pointerId);
              resetJoystick();
            }}
            onPointerCancel={resetJoystick}
            onLostPointerCapture={resetJoystick}
          >
            <span className="playable-joystick-ring" />
            <span ref={joystickKnobRef} className="playable-joystick-knob" />
          </div>
          <div className="playable-sprint-control">{actionButton("sprint", "SPRINT", "is-sprint")}</div>
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
