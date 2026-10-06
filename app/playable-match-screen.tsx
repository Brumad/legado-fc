"use client";

import { useMemo, useRef, useState } from "react";
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
}: {
  career: CareerState;
  fixture: Fixture;
  onFinish: (result: PlayableMatchResult) => void;
  onQuickMode: () => void;
  onExit: () => void;
  developerMode?: boolean;
}) {
  const playable = useMemo(() => createPlayableMatchState(career, fixture), [career, fixture]);
  const runtimeConfig = useMemo(
    () => developerMode ? { matchClockRate: 900, restartDelayTicks: 2, maxCatchUpSteps: 120 } : undefined,
    [developerMode],
  );
  const canvasRef = useRef<PlayableMatchCanvasHandle>(null);
  const [snapshot, setSnapshot] = useState<MatchCoreState>(playable.state);
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
          <span>0.5.2 · PARTIDA 2D</span>
          <strong>{fixture.competition}</strong>
          <small>{fixture.home ? "CASA" : "FORA"} · {fixture.weather}</small>
        </div>
        <div className="playable-scoreboard" aria-label="Placar">
          <div><span style={{ "--club": career.clubColor } as React.CSSProperties}>{career.clubShort}</span><b>{career.clubShort}</b></div>
          <strong>{playerScore}<i>–</i>{opponentScore}</strong>
          <div><b>{fixture.opponent.short}</b><span style={{ "--club": fixture.opponent.color } as React.CSSProperties}>{fixture.opponent.short}</span></div>
        </div>
        <div className="playable-clock">
          <small>{snapshot.clock.phase === "half-time" ? "INTERVALO" : snapshot.restart?.label ?? (snapshot.paused ? "PAUSADO" : "EM JOGO")}</small>
          <strong>{String(Math.min(90, snapshot.clock.minute)).padStart(2, "0")}:{String(snapshot.clock.second).padStart(2, "0")}</strong>
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
            <PlayableMatchCanvas
              ref={canvasRef}
              initialState={playable.state}
              config={runtimeConfig}
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
              <p>{career.position} · OVR em carreira</p>
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
