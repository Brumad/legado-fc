"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CareerState } from "../game-engine.ts";
import {
  DEFAULT_SET_PIECE_INPUT,
  buildSetPieceTrajectory,
  resolveSetPiece3D,
  setPieceInputFromDrag,
  setPieceInputFromGamepad,
} from "./physics.ts";
import type {
  SetPiece3DRequest,
  SetPiece3DResult,
  SetPieceInput,
  SetPieceRendererMode,
} from "./types.ts";
import type { ThreeSetPieceScene } from "./scene.mjs";

type PointerStart = { x: number; y: number };

function labelForKind(kind: SetPiece3DRequest["kind"]) {
  if (kind === "corner") return "ESCANTEIO 3D";
  if (kind === "free-kick-cross") return "FALTA LEVANTADA 3D";
  return "FALTA DIRETA 3D";
}

function outcomeLabel(outcome: SetPiece3DResult["outcome"]) {
  if (outcome === "goal") return "GOL!";
  if (outcome === "saved") return "DEFESA";
  if (outcome === "cleared") return "CORTE";
  if (outcome === "rebound") return "REBOTE";
  return "PARA FORA";
}

export function SetPiece3DOverlay({
  request,
  career,
  attackingColor,
  defendingColor,
  quality = "high",
  forceFallback = false,
  onResolve,
}: {
  request: SetPiece3DRequest;
  career: CareerState;
  attackingColor: string;
  defendingColor: string;
  quality?: "low" | "medium" | "high";
  forceFallback?: boolean;
  onResolve: (result: SetPiece3DResult) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ThreeSetPieceScene | null>(null);
  const pointerRef = useRef<PointerStart | null>(null);
  const gamepadPressedRef = useRef(false);
  const [rendererMode, setRendererMode] = useState<SetPieceRendererMode>("fallback-2d");
  const [input, setInput] = useState<SetPieceInput>(DEFAULT_SET_PIECE_INPUT);
  const [charging, setCharging] = useState(false);
  const [result, setResult] = useState<SetPiece3DResult | null>(null);
  const [locked, setLocked] = useState(false);

  const trajectory = useMemo(() => buildSetPieceTrajectory(request, input), [request, input]);

  useEffect(() => {
    let cancelled = false;
    let scene: ThreeSetPieceScene | null = null;
    async function load() {
      if (forceFallback || !containerRef.current) return;
      const module = await import("./scene.mjs");
      if (cancelled || !containerRef.current || !module.isSetPieceWebGLAvailable()) return;
      scene = new module.ThreeSetPieceScene(containerRef.current, request, {
        quality,
        attackingColor,
        defendingColor,
        skinTone: career.skinTone,
        hairColor: career.hairColor ?? "#171917",
      });
      sceneRef.current = scene;
      scene.setPreview(trajectory);
      setRendererMode("webgl");
    }
    void load();
    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [attackingColor, career.hairColor, career.skinTone, defendingColor, forceFallback, quality, request]);

  useEffect(() => {
    sceneRef.current?.setPreview(trajectory);
  }, [trajectory]);

  const finishKick = useCallback((nextInput: SetPieceInput) => {
    if (locked) return;
    setLocked(true);
    setInput(nextInput);
    const resolved = resolveSetPiece3D(request, nextInput, rendererMode);
    setResult(resolved);
    if (sceneRef.current && rendererMode === "webgl") {
      sceneRef.current.play(resolved.trajectory, resolved, () => onResolve(resolved));
    } else {
      window.setTimeout(() => onResolve(resolved), 680);
    }
  }, [locked, onResolve, rendererMode, request]);

  function updateFromPointer(clientX: number, clientY: number) {
    const start = pointerRef.current;
    const node = containerRef.current;
    if (!start || !node) return;
    const rect = node.getBoundingClientRect();
    const next = setPieceInputFromDrag(
      clientX - start.x,
      clientY - start.y,
      rect.width,
      rect.height,
      input.curve * 0.25,
    );
    setInput(next);
  }

  useEffect(() => {
    let frame = 0;
    const poll = () => {
      if (!locked && typeof navigator !== "undefined" && navigator.getGamepads) {
        const pad = Array.from(navigator.getGamepads()).find(Boolean);
        if (pad) {
          const aimX = pad.axes[0] ?? 0;
          const aimY = pad.axes[1] ?? -0.1;
          const curve = pad.axes[2] ?? 0;
          const powerAxis = Math.max(pad.axes[3] ?? -0.2, (pad.buttons[7]?.value ?? 0) * 2 - 1);
          const next = setPieceInputFromGamepad(aimX, aimY, curve, powerAxis);
          if (Math.abs(aimX) > 0.08 || Math.abs(aimY) > 0.08 || Math.abs(curve) > 0.08) setInput(next);
          const pressed = Boolean(pad.buttons[0]?.pressed);
          if (pressed && !gamepadPressedRef.current) finishKick(next);
          gamepadPressedRef.current = pressed;
        }
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [finishKick, locked]);

  const powerPct = Math.round(input.power * 100);
  const curvePct = Math.round(input.curve * 100);
  const liftPct = Math.round(input.lift * 100);

  return (
    <section
      className={`set-piece-3d-overlay ${rendererMode === "fallback-2d" ? "is-fallback" : ""}`}
      data-set-piece-3d
      data-set-piece-kind={request.kind}
      data-renderer-mode={rendererMode}
      data-set-piece-outcome={result?.outcome ?? ""}
    >
      <div className="set-piece-3d-topbar">
        <div>
          <span>{labelForKind(request.kind)}</span>
          <strong>{Math.round(request.distanceToGoal)} m</strong>
        </div>
        <div className="set-piece-3d-readout">
          <span><small>FORÇA</small><b>{powerPct}%</b></span>
          <span><small>ALTURA</small><b>{liftPct}%</b></span>
          <span><small>CURVA</small><b>{curvePct > 0 ? "+" : ""}{curvePct}</b></span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="set-piece-3d-stage"
        onPointerDown={(event) => {
          if (locked) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture?.(event.pointerId);
          pointerRef.current = { x: event.clientX, y: event.clientY };
          setCharging(true);
        }}
        onPointerMove={(event) => {
          if (!pointerRef.current || locked) return;
          event.preventDefault();
          updateFromPointer(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (!pointerRef.current || locked) return;
          event.preventDefault();
          updateFromPointer(event.clientX, event.clientY);
          const start = pointerRef.current;
          const rect = event.currentTarget.getBoundingClientRect();
          const next = setPieceInputFromDrag(
            event.clientX - start.x,
            event.clientY - start.y,
            rect.width,
            rect.height,
            input.curve * 0.25,
          );
          pointerRef.current = null;
          setCharging(false);
          finishKick(next);
        }}
        onPointerCancel={() => {
          pointerRef.current = null;
          setCharging(false);
        }}
      >
        {rendererMode === "fallback-2d" && (
          <div className="set-piece-fallback-pitch">
            <div className="set-piece-fallback-goal"><i /><i /><i /></div>
            {request.wallCount > 0 && <div className="set-piece-fallback-wall">{Array.from({ length: request.wallCount }, (_, index) => <i key={index} />)}</div>}
            <div
              className="set-piece-fallback-target"
              style={{ transform: `translate(${input.aimX * 80}px,${-input.lift * 72}px)` }}
            />
            <div className="set-piece-fallback-ball">⚽</div>
          </div>
        )}

        {!locked && (
          <div className={`set-piece-gesture-hint ${charging ? "is-charging" : ""}`}>
            <strong>{charging ? "SOLTE PARA COBRAR" : "ARRASTE PARA COBRAR"}</strong>
            <span>direção + altura + força + efeito</span>
          </div>
        )}

        {result && (
          <div className={`set-piece-result-flash is-${result.outcome}`}>
            <strong>{outcomeLabel(result.outcome)}</strong>
            <span>{rendererMode === "webgl" ? "3D WEBGL" : "FALLBACK 2D"}</span>
          </div>
        )}
      </div>

      <footer className="set-piece-3d-footer">
        <span>{rendererMode === "webgl" ? "WEBGL 3D" : "MODO 2D COMPATÍVEL"}</span>
        <p>Mouse/touch: arraste e solte · Gamepad: analógico + A</p>
        <div className="set-piece-curve-buttons">
          <button disabled={locked} onClick={() => setInput((current) => ({ ...current, curve: Math.max(-1, current.curve - 0.22) }))}>↶ EFEITO</button>
          <button disabled={locked} onClick={() => setInput((current) => ({ ...current, curve: Math.min(1, current.curve + 0.22) }))}>EFEITO ↷</button>
        </div>
      </footer>
    </section>
  );
}
