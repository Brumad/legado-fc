"use client";

import { useMemo, useRef, useState } from "react";
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
import type { MatchCoreState } from "./match-core/types.ts";

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
  const [finalState, setFinalState] = useState<MatchCoreState | null>(null);
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
    >
      <header className="playable-match-header">
        <button className="playable-exit" onClick={onExit} aria-label="Sair da partida">←</button>
        <div className="playable-competition">
          <span>0.5.4 · VISUAL RETRÔ</span>
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
              renderTheme={renderTheme}
              onSnapshot={setSnapshot}
              onFinished={(state) => { setSnapshot(state); setFinalState(state); }}
            />

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
              <span>APRESENTAÇÃO 0.5.4</span>
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
            </section>

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
