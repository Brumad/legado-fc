"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  SetPieceRuntime,
  createSetPieceThreeScene,
  gestureFromPointerPath,
  simulateSetPiece,
  supportsSetPieceWebGL,
  type SetPieceContext,
  type SetPieceGesture,
  type SetPieceResult,
  type SetPieceSceneController,
  type SetPieceSceneVisuals,
} from "./index.ts";

type Phase = "aiming" | "flight" | "resolved" | "fallback";

function defaultGesture(context: SetPieceContext): SetPieceGesture {
  if (context.kind === "corner") return { aimX: 0, aimY: 0.72, power: 0.82, curve: 0.25 };
  if (context.kind === "free-kick-cross") return { aimX: 0, aimY: 0.7, power: 0.8, curve: 0.18 };
  return { aimX: 0, aimY: 0.7, power: 0.82, curve: 0.08 };
}

function kindLabel(context: SetPieceContext) {
  if (context.kind === "corner") return "ESCANTEIO 3D";
  if (context.kind === "free-kick-cross") return "FALTA LEVANTADA 3D";
  return "FALTA DIRETA 3D";
}

function outcomeLabel(result: SetPieceResult) {
  const labels: Record<SetPieceResult["outcome"], string> = {
    goal: "GOOOL!",
    saved: "DEFESA DO GOLEIRO",
    blocked: "BATEU NA BARREIRA",
    wide: "PARA FORA",
    cleared: "CORTE DA DEFESA",
    rebound: "BOLA VIVA",
    "cross-complete": "CRUZAMENTO NA ÁREA",
  };
  return labels[result.outcome];
}

export function SetPiece3DScreen({
  context,
  visuals,
  onComplete,
  onFallback,
}: {
  context: SetPieceContext;
  visuals: SetPieceSceneVisuals;
  onComplete: (result: SetPieceResult) => void;
  onFallback: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SetPieceSceneController | null>(null);
  const runtimeRef = useRef<SetPieceRuntime | null>(null);
  const animationRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const pathRef = useRef<Array<{ x: number; y: number }>>([]);
  const previousGamepadPressedRef = useRef(false);
  const resolvedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const [phase, setPhase] = useState<Phase>("aiming");
  const [support, setSupport] = useState<"checking" | "webgl" | "fallback">("checking");
  const [drawPath, setDrawPath] = useState<Array<{ x: number; y: number }>>([]);
  const [gesture, setGesture] = useState<SetPieceGesture>(defaultGesture(context));
  const [result, setResult] = useState<SetPieceResult | null>(null);

  const launch = useCallback((nextGesture: SetPieceGesture) => {
    if (phase !== "aiming") return;
    const runtime = new SetPieceRuntime(context, nextGesture);
    runtimeRef.current = runtime;
    setGesture(nextGesture);
    setDrawPath([]);
    pathRef.current = [];
    setPhase("flight");
    sceneRef.current?.update(runtime.state);
  }, [context, phase]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!supportsSetPieceWebGL()) {
      const fallbackTimer = window.setTimeout(() => {
        setSupport("fallback");
        setPhase("fallback");
      }, 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    try {
      const scene = createSetPieceThreeScene(mount, context, visuals);
      sceneRef.current = scene;
      const preview = new SetPieceRuntime(context, defaultGesture(context));
      scene.update(preview.state);
      setSupport("webgl");
    } catch {
      const fallbackTimer = window.setTimeout(() => {
        setSupport("fallback");
        setPhase("fallback");
      }, 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    let last = performance.now();
    let accumulator = 0;
    const render = (now: number) => {
      const runtime = runtimeRef.current;
      const delta = Math.min(0.12, Math.max(0, (now - last) / 1000));
      last = now;

      if (runtime && !runtime.state.result) {
        accumulator += delta;
        let steps = 0;
        while (accumulator >= runtime.config.fixedDelta && steps < 18 && !runtime.state.result) {
          runtime.step();
          accumulator -= runtime.config.fixedDelta;
          steps += 1;
        }
        sceneRef.current?.update(runtime.state);
      }

      if (runtime?.state.result && runtime.state.phase === "resolved" && !resolvedRef.current) {
        resolvedRef.current = true;
        const resolved = runtime.state.result;
        setResult(resolved);
        setPhase("resolved");
        sceneRef.current?.update(runtime.state);
        if (timeoutRef.current === null) {
          timeoutRef.current = window.setTimeout(() => onCompleteRef.current(resolved), 900);
        }
      }

      animationRef.current = window.requestAnimationFrame(render);
    };
    animationRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      runtimeRef.current = null;
    };
  }, [context, visuals]);

  useEffect(() => {
    if (phase !== "aiming" || support !== "webgl" || typeof navigator === "undefined") return;
    let frame = 0;
    const poll = () => {
      const pad = navigator.getGamepads?.()?.find?.((item) => Boolean(item))
        ?? Array.from(navigator.getGamepads?.() ?? []).find(Boolean);
      if (pad) {
        const leftX = pad.axes[0] ?? 0;
        const leftY = pad.axes[1] ?? 0;
        const rightX = pad.axes[2] ?? 0;
        const trigger = Math.max(pad.buttons[6]?.value ?? 0, pad.buttons[7]?.value ?? 0);
        const next = {
          aimX: Math.abs(leftX) > 0.08 ? leftX : 0,
          aimY: Math.max(0.08, Math.min(1, (1 - leftY) / 2)),
          power: Math.max(0.25, trigger || 0.68),
          curve: Math.abs(rightX) > 0.08 ? rightX : 0,
        };
        setGesture(next);
        const pressed = Boolean(pad.buttons[0]?.pressed);
        if (pressed && !previousGamepadPressedRef.current) launch(next);
        previousGamepadPressedRef.current = pressed;
      }
      frame = window.requestAnimationFrame(poll);
    };
    frame = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(frame);
  }, [launch, phase, support]);

  function localPoint(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (phase !== "aiming" || support !== "webgl") return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = localPoint(event);
    pathRef.current = [point];
    setDrawPath([point]);
  }

  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId || phase !== "aiming") return;
    event.preventDefault();
    const point = localPoint(event);
    pathRef.current = [...pathRef.current, point].slice(-48);
    setDrawPath(pathRef.current);
  }

  function pointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId || phase !== "aiming") return;
    event.preventDefault();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    const point = localPoint(event);
    const points = [...pathRef.current, point];
    pointerIdRef.current = null;
    const rect = event.currentTarget.getBoundingClientRect();
    const next = gestureFromPointerPath(points, rect.width, rect.height);
    launch(next);
  }

  function runCompatibilityMode() {
    const fallback = simulateSetPiece(context, defaultGesture(context));
    if (!fallback.result) return;
    setResult(fallback.result);
    setPhase("resolved");
    window.setTimeout(() => onComplete(fallback.result!), 350);
  }

  const pathData = drawPath.length
    ? drawPath.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")
    : "";

  return (
    <section
      className="set-piece-3d-screen"
      data-set-piece-3d
      data-set-piece-kind={context.kind}
      data-webgl={support}
      data-phase={phase}
    >
      <div
        ref={mountRef}
        className="set-piece-3d-mount"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={() => { pointerIdRef.current = null; pathRef.current = []; setDrawPath([]); }}
      />

      {pathData && phase === "aiming" && (
        <svg className="set-piece-gesture-path" aria-hidden="true">
          <path d={pathData} />
        </svg>
      )}

      <header className="set-piece-3d-header">
        <div>
          <span>LEGADO FC · 0.5.5</span>
          <strong>{kindLabel(context)}</strong>
          <small>{Math.round(context.distanceToGoal)} m · {context.technique.foot}</small>
        </div>
        <button onClick={onFallback}>USAR 2D</button>
      </header>

      {support === "webgl" && phase === "aiming" && (
        <div className="set-piece-aim-guide">
          <span>ARRASTE PARA COBRAR</span>
          <strong>Direção + força + altura + curva</strong>
          <small>Mouse/touch: desenhe o chute · Gamepad: analógico esquerdo mira, direito curva, gatilho dá força, A cobra</small>
        </div>
      )}

      {support === "webgl" && (
        <div className="set-piece-telemetry">
          <span><small>FORÇA</small><b>{Math.round(gesture.power * 100)}</b></span>
          <span><small>ALTURA</small><b>{Math.round(gesture.aimY * 100)}</b></span>
          <span><small>CURVA</small><b>{Math.round(gesture.curve * 100)}</b></span>
        </div>
      )}

      {phase === "flight" && <div className="set-piece-flight-label">BOLA EM JOGO</div>}

      {phase === "resolved" && result && (
        <div className="set-piece-result">
          <span>{result.kind === "corner" ? "BOLA PARADA" : "COBRANÇA"}</span>
          <h2>{outcomeLabel(result)}</h2>
          <small>Retornando para a partida 2D…</small>
        </div>
      )}

      {(support === "fallback" || phase === "fallback") && (
        <div className="set-piece-fallback">
          <span>WEBGL INDISPONÍVEL</span>
          <h2>A partida pode continuar normalmente.</h2>
          <p>Use a mesma física de bola parada sem a apresentação 3D ou retorne à cobrança 2D tradicional.</p>
          <div>
            <button onClick={runCompatibilityMode}>COBRAR EM MODO COMPATIBILIDADE</button>
            <button onClick={onFallback}>VOLTAR AO 2D</button>
          </div>
        </div>
      )}
    </section>
  );
}
