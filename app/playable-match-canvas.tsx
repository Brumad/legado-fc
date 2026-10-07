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
import type { MatchCoreConfig, MatchCoreState, MatchInputFrame, MatchSide } from "./match-core/types.ts";
import { applySetPiece3DResult, createSetPiece3DRequest } from "./set-piece-3d/integration.ts";
import type { SetPiece3DRequest, SetPiece3DResult } from "./set-piece-3d/types.ts";

export type PlayableMatchCanvasHandle = {
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  startSecondHalf: () => void;
  abandon: () => void;
  getState: () => MatchCoreState | null;
  applySetPieceResult: (request: SetPiece3DRequest, result: SetPiece3DResult) => void;
  debugStartSetPiece: (kind: "free-kick" | "corner") => void;
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
  replayEnabled?: boolean;
  renderTheme?: Partial<MatchRenderTheme>;
  onReplayChange?: (active: boolean) => void;
  onSetPieceRequest?: (request: SetPiece3DRequest) => void;
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
    replayEnabled = true,
    renderTheme,
    onReplayChange,
    onSetPieceRequest,
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
    const cameraModeRef = useRef(cameraMode);
    const visualQualityRef = useRef(visualQuality);
    const visualEffectsRef = useRef(visualEffects);
    const crowdRef = useRef(crowd);
    const renderThemeRef = useRef(renderTheme);
    const replayEnabledRef = useRef(replayEnabled);
    const onReplayChangeRef = useRef(onReplayChange);
    const onSetPieceRequestRef = useRef(onSetPieceRequest);
    const requestedSetPieceRef = useRef<string | null>(null);
    const replayActiveRef = useRef(false);
    const replayFramesRef = useRef<MatchCoreState[]>([]);
    const replayFrameRef = useRef(0);
    const lastGoalTickRef = useRef(-1);
    const historyRef = useRef<MatchCoreState[]>([]);
    const historyCadenceRef = useRef(0);

    onSnapshotRef.current = onSnapshot;
    onFinishedRef.current = onFinished;
    cameraModeRef.current = cameraMode;
    visualQualityRef.current = visualQuality;
    visualEffectsRef.current = visualEffects;
    crowdRef.current = crowd;
    renderThemeRef.current = renderTheme;
    replayEnabledRef.current = replayEnabled;
    onReplayChangeRef.current = onReplayChange;
    onSetPieceRequestRef.current = onSetPieceRequest;

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
      applySetPieceResult(request, result) {
        const runtime = runtimeRef.current;
        if (!runtime) return;
        runtime.state = applySetPiece3DResult(runtime.state, request, result, runtime.config);
        requestedSetPieceRef.current = null;
        onSnapshotRef.current?.(runtime.state);
        runtime.resume();
        onSnapshotRef.current?.(runtime.state);
      },
      debugStartSetPiece(kind) {
        const runtime = runtimeRef.current;
        if (!runtime) return;
        const controlled = runtime.state.players.find((player) => player.controlled && player.active && !player.redCard);
        if (!controlled) return;
        const side: MatchSide = controlled.side;
        const goalX = side === "home" ? runtime.state.pitch.length : 0;
        const position = kind === "corner"
          ? {
              x: side === "home" ? runtime.state.pitch.length - 0.45 : 0.45,
              y: 0.45,
            }
          : {
              x: side === "home" ? runtime.state.pitch.length - 23 : 23,
              y: runtime.state.pitch.width / 2 - 2.5,
            };
        runtime.state = {
          ...runtime.state,
          restart: {
            type: kind,
            side,
            position,
            ticksRemaining: runtime.config.restartDelayTicks,
            label: kind === "corner" ? "Escanteio" : "Falta",
          },
          ball: {
            ...runtime.state.ball,
            position,
            velocity: { x: 0, y: 0 },
            possessionPlayerId: null,
            lastTouchPlayerId: controlled.id,
            lastTouchSide: side,
            pickupCooldownTicks: runtime.config.restartDelayTicks,
          },
        };
        requestedSetPieceRef.current = null;
        onSnapshotRef.current?.(runtime.state);
      },
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

      function drawPresentationFrame(
        context: CanvasRenderingContext2D,
        state: MatchCoreState,
        width: number,
        height: number,
        pixelRatio: number,
        replay = false,
      ) {
        const padding = Math.max(7 * pixelRatio, Math.min(width, height) * 0.018);
        drawMatchFrame(
          context,
          state,
          {
            width,
            height,
            padding,
            camera: createMatchCamera(state, { width, height, padding }, cameraModeRef.current),
          },
          { ...DEFAULT_MATCH_RENDER_THEME, ...(renderThemeRef.current ?? {}) },
          {
            quality: visualQualityRef.current,
            effects: visualEffectsRef.current,
            crowd: crowdRef.current,
          },
        );
        if (replay) {
          context.save();
          context.fillStyle = "rgba(4,18,11,.86)";
          context.strokeStyle = DEFAULT_MATCH_RENDER_THEME.controlledPlayer;
          context.lineWidth = Math.max(1, pixelRatio);
          context.fillRect(width * 0.035, height * 0.055, width * 0.16, height * 0.062);
          context.strokeRect(width * 0.035, height * 0.055, width * 0.16, height * 0.062);
          context.fillStyle = DEFAULT_MATCH_RENDER_THEME.controlledPlayer;
          context.font = `900 ${Math.max(10, Math.min(24, width * 0.018))}px monospace`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText("REPLAY", width * 0.115, height * 0.086);
          context.restore();
        }
      }

      const render = (now: number) => {
        const rect = canvas.getBoundingClientRect();
        const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
        const width = Math.max(1, Math.round(rect.width * pixelRatio));
        const height = Math.max(1, Math.round(rect.height * pixelRatio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const context = canvas.getContext("2d");

        if (replayActiveRef.current && replayFramesRef.current.length && context) {
          previous = now;
          const frameIndex = Math.min(
            replayFramesRef.current.length - 1,
            Math.floor(replayFrameRef.current / 1.45),
          );
          drawPresentationFrame(
            context,
            replayFramesRef.current[frameIndex],
            width,
            height,
            pixelRatio,
            true,
          );
          replayFrameRef.current += 1;
          if (frameIndex >= replayFramesRef.current.length - 1) {
            replayActiveRef.current = false;
            replayFramesRef.current = [];
            replayFrameRef.current = 0;
            onReplayChangeRef.current?.(false);
          }
          animationFrame = window.requestAnimationFrame(render);
          return;
        }

        runtime.setInput(mergeInputs(
          keyboardInputFromKeys(keyboardKeysRef.current),
          touchRef.current,
          readGamepad(),
        ));

        const deltaSeconds = Math.min(0.25, Math.max(0, (now - previous) / 1000));
        previous = now;
        runtime.advanceFrame(deltaSeconds);

        const controlledPlayerId = runtime.state.players.find((player) => player.controlled && player.active && !player.redCard)?.id;
        if (controlledPlayerId && runtime.state.restart && onSetPieceRequestRef.current) {
          const eligibility = createSetPiece3DRequest(runtime.state, controlledPlayerId);
          if (
            eligibility.request
            && requestedSetPieceRef.current !== eligibility.request.id
          ) {
            requestedSetPieceRef.current = eligibility.request.id;
            runtime.pause();
            onSnapshotRef.current?.(runtime.state);
            onSetPieceRequestRef.current(eligibility.request);
            previous = now;
            animationFrame = window.requestAnimationFrame(render);
            return;
          }
        }

        historyCadenceRef.current += 1;
        if (historyCadenceRef.current >= 2) {
          historyCadenceRef.current = 0;
          historyRef.current = [...historyRef.current, runtime.state].slice(-100);
        }

        const latestGoal = [...runtime.state.events].reverse().find((event) => event.type === "goal");
        if (
          replayEnabledRef.current &&
          latestGoal &&
          latestGoal.tick > lastGoalTickRef.current &&
          historyRef.current.length >= 16
        ) {
          lastGoalTickRef.current = latestGoal.tick;
          replayFramesRef.current = historyRef.current.slice(-78);
          replayFrameRef.current = 0;
          replayActiveRef.current = true;
          onReplayChangeRef.current?.(true);
        }

        if (context) drawPresentationFrame(context, runtime.state, width, height, pixelRatio);

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
        replayActiveRef.current = false;
        replayFramesRef.current = [];
        historyRef.current = [];
        onReplayChangeRef.current?.(false);
        runtimeRef.current = null;
      };
    }, [autoStart, config, initialState]);

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
        data-camera-mode={cameraMode}
        data-visual-quality={visualQuality}
        data-visual-effects={visualEffects ? "on" : "off"}
        data-replay-enabled={replayEnabled ? "yes" : "no"}
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
