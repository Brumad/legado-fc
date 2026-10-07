"use client";

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { MatchCameraMode, MatchVisualQuality } from "./match-core/renderer.ts";
import type { CareerState, Fixture } from "./game-engine.ts";
import {
  createPlayableMatchResult,
  createPlayableMatchState,
  type PlayableMatchResult,
} from "./gameplay-integration.ts";
import {
  PlayableMatchCanvas,
  type PlayableMatchCanvasHandle,
} from "./playable-match-canvas.tsx";
import { DEFAULT_MATCH_CORE_CONFIG } from "./match-core/config.ts";
import type { MatchCoreState } from "./match-core/types.ts";
import {
  applySetPieceResultToMatch,
  createSetPieceContextFromMatch,
} from "./set-piece-3d/integration.ts";
import type {
  SetPieceContext,
  SetPieceResult,
} from "./set-piece-3d/types.ts";
import type { SetPieceSceneVisuals } from "./set-piece-3d/scene.ts";

const SetPiece3DScreen = lazy(() =>
  import("./set-piece-3d/set-piece-3d-screen.tsx").then((module) => ({ default: module.SetPiece3DScreen }))
);

export function PlayableMatchScreen({
  career,
  fixture,
  onFinish,
  onQuickMode,
  onExit,
  developerMode = false,
  matchDuration = "standard",
  mobileControlSize = "medium",
  mobileControlOpacity = 0.75,
  mobileControlsSide = "standard",
}: {
  career: CareerState;
  fixture: Fixture;
  onFinish: (result: PlayableMatchResult) => void;
  onQuickMode: () => void;
  onExit: () => void;
  developerMode?: boolean;
  matchDuration?: "short" | "standard" | "long";
  mobileControlSize?: "small" | "medium" | "large";
  mobileControlOpacity?: 0.55 | 0.75 | 1;
  mobileControlsSide?: "standard" | "inverted";
}) {
  const playable = useMemo(() => createPlayableMatchState(career, fixture), [career, fixture]);
  const runtimeConfig = useMemo(() => {
    if (developerMode) return { matchClockRate: 900, restartDelayTicks: 2, maxCatchUpSteps: 120 };
    const durationRate = { short: 30, standard: 15, long: 9 }[matchDuration];
    return { matchClockRate: durationRate };
  }, [developerMode, matchDuration]);
  const canvasRef = useRef<PlayableMatchCanvasHandle>(null);
  const [snapshot, setSnapshot] = useState<MatchCoreState>(playable.state);
  const [cameraMode, setCameraMode] = useState<MatchCameraMode>("follow");
  const [visualQuality, setVisualQuality] = useState<MatchVisualQuality>("high");
  const [visualEffects, setVisualEffects] = useState(true);
  const [replayEnabled, setReplayEnabled] = useState(true);
  const [replayActive, setReplayActive] = useState(false);
  const [finalState, setFinalState] = useState<MatchCoreState | null>(null);
  const [setPieceSession, setSetPieceSession] = useState<{ context: SetPieceContext; base: MatchCoreState } | null>(null);
  const [lastSetPieceOutcome, setLastSetPieceOutcome] = useState<string>("");
  const skippedSetPieceRef = useRef<string | null>(null);
  const unavailable = career.suspensionMatches > 0 || career.injuryMatchesRemaining > 0;
  const controlled = snapshot.players.find((player) => player.controlled);
  const playerSide = playable.context.playerSide;
  const playerScore = snapshot.score[playerSide];
  const opponentSide = playerSide === "home" ? "away" : "home";
  const opponentScore = snapshot.score[opponentSide];
  const possessionTotal = snapshot.stats.home.possessionTicks + snapshot.stats.away.possessionTicks;
  const playerPossession = possessionTotal
    ? Math.round(snapshot.stats[playerSide].possessionTicks / possessionTotal * 100)
    : 50;
  const durationLabel = { short: "3 MIN", standard: "6 MIN", long: "10 MIN" }[matchDuration];
  const addedBase = snapshot.clock.phase === "first-half" || snapshot.clock.phase === "half-time" ? 45 : 90;
  const addedMinutes = Math.max(0, snapshot.clock.minute - addedBase);
  const clockMinuteLabel = addedMinutes > 0 ? `${addedBase}+${addedMinutes}` : String(snapshot.clock.minute).padStart(2, "0");
  const homeKit = playerSide === "home" ? career.clubColor : fixture.opponent.color;
  const awayKit = playerSide === "away" ? career.clubColor : fixture.opponent.color;
  const renderTheme = useMemo(() => ({
    homePlayer: homeKit,
    awayPlayer: awayKit,
    homeTrim: homeKit === "#ffffff" ? "#152018" : "#f1f5ef",
    awayTrim: awayKit === "#ffffff" ? "#152018" : "#f1f5ef",
  }), [awayKit, homeKit]);
  const setPieceVisuals = useMemo<SetPieceSceneVisuals>(() => ({
    homeKit,
    awayKit,
    skinTone: career.skinTone,
    hairColor: career.hairColor ?? "#171917",
    hairStyle: career.hairStyle ?? "Curto",
    facialHair: career.facialHair ?? "Sem barba",
    faceShape: career.faceShape ?? "Oval",
    shirtNumber: career.shirtNumber,
  }), [
    awayKit,
    career.faceShape,
    career.facialHair,
    career.hairColor,
    career.hairStyle,
    career.shirtNumber,
    career.skinTone,
    homeKit,
  ]);

  useEffect(() => {
    if (unavailable || snapshot.finished || finalState || setPieceSession || replayActive) return;
    const liveState = canvasRef.current?.getState() ?? snapshot;
    if (!liveState.restart) {
      skippedSetPieceRef.current = null;
      return;
    }
    const context = createSetPieceContextFromMatch(
      liveState,
      playable.context.controlledPlayerId,
      career.foot,
    );
    if (!context || skippedSetPieceRef.current === context.id) return;
    canvasRef.current?.pause();
    setSetPieceSession({ context, base: liveState });
  }, [
    career.foot,
    finalState,
    playable.context.controlledPlayerId,
    replayActive,
    setPieceSession,
    snapshot.finished,
    snapshot.restart?.position.x,
    snapshot.restart?.position.y,
    snapshot.restart?.side,
    snapshot.restart?.type,
    snapshot.restart?.ticksRemaining,
    unavailable,
  ]);

  function completeSetPiece(result: SetPieceResult) {
    const session = setPieceSession;
    if (!session) return;
    const next = applySetPieceResultToMatch(
      session.base,
      result,
      { ...DEFAULT_MATCH_CORE_CONFIG, ...runtimeConfig },
    );
    skippedSetPieceRef.current = null;
    canvasRef.current?.replaceState(next);
    setSnapshot(next);
    setLastSetPieceOutcome(result.outcome);
    setSetPieceSession(null);
  }

  function fallbackTo2DSetPiece() {
    const session = setPieceSession;
    if (!session) return;
    skippedSetPieceRef.current = session.context.id;
    canvasRef.current?.replaceState(session.base);
    setSnapshot(session.base);
    setLastSetPieceOutcome("fallback-2d");
    setSetPieceSession(null);
  }

  function openDeveloperSetPiece(variant: "direct" | "cross" | "corner") {
    if (!developerMode || setPieceSession || snapshot.finished) return;
    const state = canvasRef.current?.getState() ?? snapshot;
    const side = playable.context.playerSide;
    const type = variant === "corner" ? "corner" : "free-kick";
    const position = variant === "corner"
      ? {
          x: side === "home" ? state.pitch.length : 0,
          y: side === "home" ? 0 : state.pitch.width,
        }
      : variant === "cross"
        ? {
            x: side === "home" ? state.pitch.length - 38 : 38,
            y: side === "home" ? 8 : state.pitch.width - 8,
          }
        : {
            x: side === "home" ? state.pitch.length - 24 : 24,
            y: state.pitch.width / 2,
          };
    const next: MatchCoreState = {
      ...state,
      paused: false,
      clock: {
        ...state.clock,
        running: state.clock.phase === "first-half" || state.clock.phase === "second-half",
      },
      restart: {
        type,
        side,
        position,
        ticksRemaining: 50,
        label: type === "corner" ? "Escanteio" : "Falta",
      },
      ball: {
        ...state.ball,
        position: { ...position },
        velocity: { x: 0, y: 0 },
        possessionPlayerId: null,
        pickupCooldownTicks: 50,
      },
    };
    skippedSetPieceRef.current = null;
    canvasRef.current?.replaceState(next);
    setSnapshot(next);
    setLastSetPieceOutcome("");
  }

  function finishPlayableMatch() {
    const state = finalState ?? canvasRef.current?.getState();
    if (!state?.finished) return;
    onFinish(createPlayableMatchResult(state, playable.context));
  }

  return (
    <main
      className="playable-match-screen"
      data-playable-match-screen
      data-match-minute={snapshot.clock.minute}
      data-player-stamina={Math.round(controlled?.stamina ?? 100)}
      data-player-x={controlled?.position.x.toFixed(2) ?? ""}
      data-player-y={controlled?.position.y.toFixed(2) ?? ""}
      data-camera-mode={cameraMode}
      data-visual-quality={visualQuality}
      data-replay-active={replayActive ? "yes" : "no"}
      data-set-piece-3d-active={setPieceSession ? "yes" : "no"}
      data-last-set-piece-outcome={lastSetPieceOutcome}
    >
      {setPieceSession && (
        <Suspense fallback={<div className="set-piece-3d-loading">PREPARANDO CENA 3D…</div>}>
          <SetPiece3DScreen
            key={setPieceSession.context.id}
            context={setPieceSession.context}
            visuals={setPieceVisuals}
            onComplete={completeSetPiece}
            onFallback={fallbackTo2DSetPiece}
          />
        </Suspense>
      )}

      <header className="playable-match-header">
        <button className="playable-exit" onClick={onExit} aria-label="Sair da partida">←</button>
        <div className="playable-competition">
          <span>0.5.5 · BOLAS PARADAS 3D</span>
          <strong>{fixture.competition}</strong>
          <small>{fixture.home ? "CASA" : "FORA"} · {fixture.weather} · {durationLabel}</small>
        </div>
        <div className="playable-scoreboard" aria-label="Placar">
          <div><span style={{ "--club": career.clubColor } as React.CSSProperties}>{career.clubShort}</span><b>{career.clubShort}</b></div>
          <strong>{playerScore}<i>–</i>{opponentScore}</strong>
          <div><b>{fixture.opponent.short}</b><span style={{ "--club": fixture.opponent.color } as React.CSSProperties}>{fixture.opponent.short}</span></div>
        </div>
        <div className="playable-clock">
          <small>{snapshot.clock.phase === "half-time" ? "INTERVALO" : snapshot.restart?.label ?? (snapshot.paused ? "PAUSADO" : "EM JOGO")}</small>
          <strong>{clockMinuteLabel}:{String(snapshot.clock.second).padStart(2, "0")}</strong>
        </div>
        <button className="playable-quick-mode" onClick={onQuickMode}>MODO RÁPIDO</button>
      </header>

      {unavailable ? (
        <section className="playable-unavailable">
          <span>INDISPONÍVEL PARA JOGAR</span>
          <h1>{career.suspensionMatches > 0 ? "Você está suspenso." : career.injuryStatus || "Você está lesionado."}</h1>
          <p>A rodada ainda pode ser concluída pelo modo rápido legado.</p>
          <div><button onClick={onQuickMode}>SIMULAR PARTIDA</button><button onClick={onExit}>VOLTAR</button></div>
        </section>
      ) : (
        <section className="playable-match-layout">
          <div className="playable-field-column">
            <div className="playable-match-meta-strip">
              <span><b>IA</b> {playable.context.difficulty}</span>
              <span><b>RIVAL</b> {playable.context.opponentFormation} · {playable.context.opponentTacticName}</span>
              <span><b>DURAÇÃO</b> {durationLabel}</span>
              {snapshot.clock.addedTimeSeconds > 0 && <span className="is-stoppage"><b>ACRÉSCIMO</b> +{Math.ceil(snapshot.clock.addedTimeSeconds / 60)} min</span>}
            </div>
            <PlayableMatchCanvas
              ref={canvasRef}
              initialState={playable.state}
              config={runtimeConfig}
              controlSize={mobileControlSize}
              controlOpacity={mobileControlOpacity}
              controlsSide={mobileControlsSide}
              cameraMode={cameraMode}
              visualQuality={visualQuality}
              visualEffects={visualEffects}
              crowd={visualQuality !== "low"}
              replayEnabled={replayEnabled}
              onReplayChange={setReplayActive}
              renderTheme={renderTheme}
              onSnapshot={setSnapshot}
              onFinished={(state) => { setSnapshot(state); setFinalState(state); }}
            />

            <div className="playable-mobile-view-controls" aria-label="Apresentação da partida">
              <button onClick={() => setCameraMode((current) => current === "follow" ? "broadcast" : current === "broadcast" ? "wide" : "follow")}>
                CAM {cameraMode === "follow" ? "SEGUIR" : cameraMode === "broadcast" ? "TV" : "ABERTA"}
              </button>
              <button onClick={() => setVisualEffects((current) => !current)}>FX {visualEffects ? "ON" : "OFF"}</button>
            </div>

            <div className="playable-arcade-hud">
              <div className="playable-arcade-player">
                <span>{career.shirtNumber}</span>
                <div><small>{career.position.toUpperCase()}</small><strong>{career.name}</strong></div>
              </div>
              <div className="playable-arcade-stamina">
                <small>STAMINA {Math.round(controlled?.stamina ?? 100)}%</small>
                <i><em style={{ width: `${controlled?.stamina ?? 100}%` }} /></i>
              </div>
              <div className="playable-arcade-mini-stats">
                <span><small>POSSE</small><b>{playerPossession}%</b></span>
                <span><small>CH</small><b>{snapshot.stats[playerSide].shots}</b></span>
              </div>
            </div>

            {replayActive && <div className="playable-replay-dom-badge">REPLAY</div>}

            {snapshot.paused && snapshot.clock.phase !== "half-time" && !snapshot.finished && (
              <div className="playable-overlay">
                <span>PARTIDA PAUSADA</span>
                <h2>O jogo está parado.</h2>
                <button onClick={() => canvasRef.current?.resume()}>CONTINUAR</button>
              </div>
            )}

            {snapshot.clock.phase === "half-time" && !snapshot.finished && (
              <div className="playable-overlay">
                <span>INTERVALO</span>
                <h2>{playerScore} – {opponentScore}</h2>
                <p>Recupere a leitura do jogo e volte para o segundo tempo.</p>
                <button onClick={() => canvasRef.current?.startSecondHalf()}>INICIAR 2º TEMPO</button>
              </div>
            )}

            {snapshot.finished && (
              <div className="playable-overlay is-finished">
                <span>FIM DE JOGO</span>
                <h2>{playerScore} – {opponentScore}</h2>
                <p>A partida 2D terminou sem sair do Match Core.</p>
                <button onClick={finishPlayableMatch}>VER RESULTADO</button>
              </div>
            )}
          </div>

          <aside className="playable-match-panel">
            <section className="playable-player-card">
              <span>SEU JOGADOR</span>
              <h2>{career.name}</h2>
              <p>{career.position} · IA {playable.context.difficulty}</p>
              <div>
                <span><small>STAMINA</small><strong>{Math.round(controlled?.stamina ?? 100)}%</strong></span>
                <i><em style={{ width: `${controlled?.stamina ?? 100}%` }} /></i>
              </div>
            </section>

            <section className="playable-live-stats">
              <div><small>POSSE</small><strong>{playerPossession}%</strong></div>
              <div><small>CHUTES</small><strong>{snapshot.stats[playerSide].shots}</strong></div>
              <div><small>PASSES</small><strong>{snapshot.stats[playerSide].passes}</strong></div>
              <div><small>DESARMES</small><strong>{snapshot.stats[playerSide].tackles}</strong></div>
            </section>

            <section className="playable-control-help">
              <span>CONTROLES</span>
              <div><kbd>WASD</kbd><p>Movimentar</p></div>
              <div><kbd>SHIFT</kbd><p>Sprint</p></div>
              <div><kbd>J</kbd><p>Passe</p></div>
              <div><kbd>K</kbd><p>Profundidade</p></div>
              <div><kbd>L</kbd><p>Chute</p></div>
              <div><kbd>ESPAÇO</kbd><p>Desarme</p></div>
              <small>Gamepad: A passe · B chute · X bote · Y profundidade · LB/RB sprint</small>
              <em>{playable.context.opponentFormation} · {playable.context.opponentTacticName}</em>
            </section>

            <section className="playable-visual-settings">
              <span>APRESENTAÇÃO 0.5.5</span>
              <div>
                {(["follow","broadcast","wide"] as MatchCameraMode[]).map((mode) => (
                  <button key={mode} className={cameraMode === mode ? "is-active" : ""} onClick={() => setCameraMode(mode)}>
                    {mode === "follow" ? "SEGUIR" : mode === "broadcast" ? "TV" : "ABERTA"}
                  </button>
                ))}
              </div>
              <div>
                {(["low","medium","high"] as MatchVisualQuality[]).map((quality) => (
                  <button key={quality} className={visualQuality === quality ? "is-active" : ""} onClick={() => setVisualQuality(quality)}>
                    {quality === "low" ? "BAIXA" : quality === "medium" ? "MÉDIA" : "ALTA"}
                  </button>
                ))}
              </div>
              <button className={visualEffects ? "is-active is-effects" : "is-effects"} onClick={() => setVisualEffects((current) => !current)}>
                EFEITOS {visualEffects ? "ON" : "OFF"}
              </button>
              <button className={replayEnabled ? "is-active is-effects" : "is-effects"} onClick={() => setReplayEnabled((current) => !current)}>
                REPLAY {replayEnabled ? "ON" : "OFF"}
              </button>
            </section>

            {developerMode && (
              <section className="playable-set-piece-dev">
                <span>DEV 0.5.5 · BOLAS PARADAS</span>
                <div>
                  <button onClick={() => openDeveloperSetPiece("direct")}>TESTAR FALTA 3D</button>
                  <button onClick={() => openDeveloperSetPiece("cross")}>TESTAR CRUZAMENTO 3D</button>
                  <button onClick={() => openDeveloperSetPiece("corner")}>TESTAR ESCANTEIO 3D</button>
                </div>
              </section>
            )}

            <section className="playable-match-buttons">
              <button onClick={() => canvasRef.current?.togglePause()} disabled={snapshot.finished || snapshot.clock.phase === "half-time"}>
                {snapshot.paused ? "CONTINUAR" : "PAUSAR"}
              </button>
              <button onClick={onQuickMode}>MODO RÁPIDO</button>
            </section>
          </aside>
        </section>
      )}
    </main>
  );
}
