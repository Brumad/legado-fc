"use client";

import { useEffect, useRef } from "react";
import { keyboardInputFromKeys } from "./match-core/input.ts";
import { drawMatchFrame } from "./match-core/renderer.ts";
import { FixedStepMatchRuntime } from "./match-core/simulation.ts";
import type { MatchCoreState } from "./match-core/types.ts";

export function PlayableMatchCanvas({
  initialState,
  className = "",
  autoStart = true,
}: {
  initialState: MatchCoreState;
  className?: string;
  autoStart?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<FixedStepMatchRuntime | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const runtime = new FixedStepMatchRuntime(initialState);
    runtimeRef.current = runtime;
    if (autoStart) runtime.start();

    const pressedKeys = new Set<string>();
    const onKeyDown = (event: KeyboardEvent) => {
      pressedKeys.add(event.code);
      runtime.setInput(keyboardInputFromKeys(pressedKeys));
      if (event.code === "Escape") {
        if (runtime.state.paused) runtime.resume();
        else runtime.pause();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.code);
      runtime.setInput(keyboardInputFromKeys(pressedKeys));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let animationFrame = 0;
    let previous = performance.now();

    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const deltaSeconds = Math.min(0.25, Math.max(0, (now - previous) / 1000));
      previous = now;
      runtime.advanceFrame(deltaSeconds);

      const context = canvas.getContext("2d");
      if (context) {
        drawMatchFrame(context, runtime.state, {
          width,
          height,
          padding: Math.max(8 * pixelRatio, Math.min(width, height) * 0.025),
        });
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
  }, [autoStart, initialState]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      tabIndex={0}
      aria-label="Campo jogável experimental do Legado FC 0.5"
      style={{ display: "block", width: "100%", aspectRatio: "105 / 68" }}
    />
  );
}
