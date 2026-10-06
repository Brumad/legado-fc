"use client";

import { useMemo } from "react";
import {
  addDaysToDate,
  buildCareerNews,
  generateMatchPlan,
  generateStandings,
  getOverall,
  type CareerState,
  type Fixture,
} from "./game-engine.ts";

export type CareerHubTrainingKind =
  | "recovery"
  | "technique"
  | "intensity"
  | "tactics"
  | "setpieces"
  | "language"
  | "media";

export type CareerHubTarget = "season" | "world" | "player" | "life" | "market";

export type CareerHubProps = {
  career: CareerState;
  fixture: Fixture;
  onPlay: () => void;
  onTrain: (kind: CareerHubTrainingKind) => void;
  onNavigate: (view: CareerHubTarget) => void;
};

const trainingOptions: Array<{
  id: CareerHubTrainingKind;
  icon: string;
  title: string;
  effect: string;
  text: string;
}> = [
  { id: "recovery", icon: "◇", title: "Recuperação", effect: "+10 energia", text: "Fisioterapia e descanso." },
  { id: "technique", icon: "◎", title: "Fundamentos", effect: "+1 atributo", text: "Treino técnico da posição." },
  { id: "intensity", icon: "↯", title: "Intensidade", effect: "+3 forma", text: "Ritmo alto antes da rodada." },
  { id: "tactics", icon: "▦", title: "Tática", effect: "+ confiança", text: "Leitura do rival e posicionamento." },
  { id: "setpieces", icon: "◒", title: "Bola parada", effect: "+1 técnica", text: "Faltas, pênaltis e escanteios." },
  { id: "language", icon: "文", title: "Idioma", effect: "+8 idioma", text: "Adaptação fora do país." },
  { id: "media", icon: "◌", title: "Torcida", effect: "+350 fãs", text: "Imprensa, fãs e patrocinadores." },
];

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function compact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function shortDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`)).replace(".", "");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function conditionLabel(career: CareerState) {
  if (career.suspensionMatches > 0) return `Suspenso · ${career.suspensionMatches} jogo(s)`;
  if (career.injuryMatchesRemaining > 0) return `${career.injuryStatus} · ${career.injuryMatchesRemaining} jogo(s)`;
  if (career.energy < 55) return "Recuperação recomendada";
  if (career.energy < 75) return "Atenção à fadiga";
  return "Pronto para jogar";
}

function relationTone(value: number) {
  if (value >= 75) return "is-good";
  if (value >= 50) return "is-neutral";
  return "is-warning";
}

function HubMeter({ label, value }: { label: string; value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="hub-meter">
      <span><small>{label}</small><b>{Math.round(safe)}</b></span>
      <i><em style={{ width: `${safe}%` }} /></i>
    </div>
  );
}

function ClubMark({ short, color }: { short: string; color: string }) {
  return (
    <span className="hub-club-mark" style={{ "--club": color } as React.CSSProperties}>
      {short}
    </span>
  );
}

export function CareerHub({ career, fixture, onPlay, onTrain, onNavigate }: CareerHubProps) {
  const overall = getOverall(career);
  const standings = useMemo(() => generateStandings(career), [career]);
  const leaguePosition = standings.find((row) => row.isPlayerTeam)?.position ?? 1;
  const news = useMemo(() => buildCareerNews(career, fixture).slice(0, 3), [career, fixture]);
  const matchPlan = useMemo(() => generateMatchPlan(career, fixture), [career, fixture]);
  const preparationComplete = career.preparationActionsUsed >= career.preparationActionsAllowed;
  const unavailable =
    career.suspensionMatches > 0 ||
    career.injuryMatchesRemaining > 0;

  const calendar = useMemo(() => {
    const actionDays = Array.from({ length: career.preparationActionsAllowed }, (_, index) => ({
      id: `action-${index}`,
      label: `AÇÃO ${index + 1}`,
      date: addDaysToDate(career.currentDate, Math.min(Math.max(0, career.daysUntilMatch - 1), index * 2 + 1)),
      value: career.preparationLog[index] ?? "Livre",
      state: career.preparationLog[index] ? "filled" : "open",
    }));
    return [
      { id: "today", label: "HOJE", date: career.currentDate, value: "Central", state: "today" },
      ...actionDays,
      { id: "match", label: "PARTIDA", date: career.nextMatchDate, value: `vs ${fixture.opponent.short}`, state: "match" },
    ];
  }, [
    career.currentDate,
    career.daysUntilMatch,
    career.nextMatchDate,
    career.preparationActionsAllowed,
    career.preparationLog,
    fixture.opponent.short,
  ]);

  const decisionItems = [
    career.activeConsequences[0]
      ? {
          key: "consequence",
          tone: career.activeConsequences[0].tone,
          kicker: "CONSEQUÊNCIA ATIVA",
          title: career.activeConsequences[0].title,
          text: career.activeConsequences[0].description,
          action: "Ver em Vida",
          onClick: () => onNavigate("life"),
        }
      : null,
    career.pendingTransfer
      ? {
          key: "transfer",
          tone: "positive",
          kicker: "PROPOSTA NO MERCADO",
          title: career.pendingTransfer.teamName,
          text: `${money(career.pendingTransfer.salary)}/mês · ${career.pendingTransfer.role}`,
          action: "Abrir mercado",
          onClick: () => onNavigate("market"),
        }
      : null,
    career.pendingLifeEvent
      ? {
          key: "life",
          tone: "mixed",
          kicker: "DECISÃO PENDENTE",
          title: career.pendingLifeEvent,
          text: "Uma situação fora de campo precisa da sua atenção.",
          action: "Resolver",
          onClick: () => onNavigate("life"),
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    tone: string;
    kicker: string;
    title: string;
    text: string;
    action: string;
    onClick: () => void;
  }>;

  function scrollToTraining() {
    document.getElementById("career-training")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="career-content career-hub-v051">
      <section className="hub-player-header" aria-label="Resumo do jogador">
        <div className="hub-player-identity">
          <span className="hub-avatar" aria-hidden="true">{initials(career.name)}</span>
          <div>
            <span className="hub-kicker">TEMPORADA {career.season} · RODADA {career.seasonRound}</span>
            <h1>{career.name}</h1>
            <p>{career.age} anos · {career.position} · #{career.shirtNumber} · {career.clubName}</p>
          </div>
        </div>
        <div className="hub-overall"><small>OVR</small><strong>{overall}</strong></div>
        <div className="hub-money">
          <span><small>SALDO</small><strong>{money(career.bankBalance)}</strong></span>
          <span><small>SALÁRIO</small><strong>{money(career.salary)}/mês</strong></span>
        </div>
      </section>

      <section className="hub-status-strip" aria-label="Condição atual">
        <HubMeter label="ENERGIA" value={career.energy} />
        <HubMeter label="MORAL" value={career.morale} />
        <HubMeter label="FORMA" value={50 + career.formBoost * 5} />
        <div className={`hub-condition ${unavailable || career.energy < 60 ? "is-warning" : "is-good"}`}>
          <small>CONDIÇÃO</small>
          <strong>{conditionLabel(career)}</strong>
        </div>
      </section>

      <section className="hub-primary-grid">
        <article className="hub-next-match" style={{ "--opponent": fixture.opponent.color } as React.CSSProperties}>
          <div className="hub-next-match-copy">
            <span className="hub-kicker">PRÓXIMO JOGO · {career.daysUntilMatch} DIA(S)</span>
            <h2>{fixture.competition}</h2>
            <div className="hub-fixture-line">
              <div><ClubMark short={career.clubShort} color={career.clubColor} /><strong>{career.clubShort}</strong></div>
              <span><b>VS</b><small>{fixture.home ? "CASA" : "FORA"}</small></span>
              <div><ClubMark short={fixture.opponent.short} color={fixture.opponent.color} /><strong>{fixture.opponent.short}</strong></div>
            </div>
            <div className="hub-match-meta">
              <span><small>LOCAL</small><b>{fixture.home ? career.clubName : fixture.venue}</b></span>
              <span><small>CLIMA</small><b>{fixture.weather}</b></span>
              <span><small>RIVAL</small><b>{matchPlan.opponentTactic.formation}</b></span>
            </div>
          </div>
          <button className="hub-play-button" onClick={onPlay}>
            <span aria-hidden="true">▶</span>
            <div><small>{unavailable ? "ACOMPANHAR" : "PARTIDA"}</small><strong>{unavailable ? "Ver jogo" : "Jogar agora"}</strong></div>
            <b aria-hidden="true">→</b>
          </button>
        </article>

        <aside className="hub-season-card">
          <span className="hub-kicker">{career.leagueName}</span>
          <div className="hub-season-position"><strong>{leaguePosition}º</strong><span>na liga</span></div>
          <div className="hub-season-record">
            <span><b>{career.seasonWins}</b><small>V</small></span>
            <span><b>{career.seasonDraws}</b><small>E</small></span>
            <span><b>{career.seasonLosses}</b><small>D</small></span>
            <span><b>{career.seasonPoints}</b><small>PTS</small></span>
          </div>
          <button onClick={() => onNavigate("season")}>Abrir temporada →</button>
        </aside>
      </section>

      <nav className="hub-action-grid" aria-label="Ações principais da carreira">
        <button onClick={onPlay}><span>▶</span><strong>Partida</strong><small>Próximo jogo</small></button>
        <button onClick={scrollToTraining}><span>↯</span><strong>Treino</strong><small>Preparação</small></button>
        <button onClick={() => onNavigate("life")}><span>◇</span><strong>Vida</strong><small>Relações e decisões</small></button>
        <button onClick={() => onNavigate("world")}><span>◉</span><strong>Mundo</strong><small>Ligas e jogadores</small></button>
        <button onClick={() => onNavigate("market")}><span>↗</span><strong>Mercado</strong><small>Contrato e propostas</small></button>
        <button onClick={() => onNavigate("player")}><span>◎</span><strong>Perfil</strong><small>Atributos e legado</small></button>
      </nav>

      <section className="hub-content-grid">
        <article className="hub-panel hub-calendar-panel">
          <div className="hub-panel-heading">
            <div><span className="hub-kicker">SEMANA DE JOGO</span><h3>Calendário</h3></div>
            <b>{career.preparationActionsUsed}/{career.preparationActionsAllowed}</b>
          </div>
          <div className="hub-calendar" role="list" aria-label="Calendário de preparação">
            {calendar.map((item) => (
              <div className={`hub-calendar-day is-${item.state}`} role="listitem" key={item.id}>
                <span>{item.label}</span><strong>{shortDate(item.date)}</strong><small>{item.value}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="hub-panel hub-decisions-panel">
          <div className="hub-panel-heading">
            <div><span className="hub-kicker">AGORA</span><h3>Decisões e eventos</h3></div>
            <b>{decisionItems.length}</b>
          </div>
          <div className="hub-decision-list">
            {decisionItems.length ? decisionItems.map((item) => (
              <button className={`hub-decision is-${item.tone}`} onClick={item.onClick} key={item.key}>
                <span>{item.kicker}</span><strong>{item.title}</strong><small>{item.text}</small><b>{item.action} →</b>
              </button>
            )) : (
              <div className="hub-empty-state"><span>✓</span><strong>Sem pendências importantes</strong><small>Você pode focar em treino e no próximo jogo.</small></div>
            )}
          </div>
        </article>
      </section>

      <section className="hub-panel hub-training-panel" id="career-training">
        <div className="hub-panel-heading">
          <div><span className="hub-kicker">PREPARAÇÃO</span><h3>Treino rápido</h3></div>
          <span className={`hub-availability ${preparationComplete ? "is-done" : ""}`}>
            {preparationComplete ? "SEM AÇÕES" : `${career.preparationActionsAllowed - career.preparationActionsUsed} DISPONÍVEL(IS)`}
          </span>
        </div>
        <div className="hub-training-grid">
          {trainingOptions.map((option) => {
            const selected = career.preparationLog.includes(option.title);
            return (
              <button
                className={`hub-training-button ${selected ? "is-selected" : ""}`}
                disabled={preparationComplete}
                onClick={() => onTrain(option.id)}
                key={option.id}
              >
                <span>{option.icon}</span>
                <div><strong>{option.title}</strong><small>{option.text}</small></div>
                <b>{selected ? "✓" : option.effect}</b>
              </button>
            );
          })}
        </div>
      </section>

      <section className="hub-content-grid hub-secondary-grid">
        <article className="hub-panel">
          <div className="hub-panel-heading"><div><span className="hub-kicker">PESSOAS</span><h3>Relações</h3></div><button onClick={() => onNavigate("life")}>Detalhes →</button></div>
          <div className="hub-relations">
            <div className={relationTone(career.coachTrust)}><span>TREINADOR</span><strong>{career.coachTrust}</strong><small>Confiança</small></div>
            <div className={relationTone(career.squadRelations)}><span>ELENCO</span><strong>{career.squadRelations}</strong><small>Relação</small></div>
            <div className={relationTone(career.familyBond)}><span>FAMÍLIA</span><strong>{career.familyBond}</strong><small>Vínculo</small></div>
            <div className={career.sponsorship ? "is-good" : "is-neutral"}><span>PATROCÍNIO</span><strong>{career.sponsorship ? "ON" : "—"}</strong><small>{career.sponsorship || "Sem contrato"}</small></div>
          </div>
        </article>

        <article className="hub-panel">
          <div className="hub-panel-heading"><div><span className="hub-kicker">CARREIRA</span><h3>Contrato e finanças</h3></div><button onClick={() => onNavigate("market")}>Mercado →</button></div>
          <div className="hub-finance-grid">
            <div><small>VALOR DE MERCADO</small><strong>{money(career.marketValue)}</strong></div>
            <div><small>SALDO</small><strong>{money(career.bankBalance)}</strong></div>
            <div><small>CONTRATO</small><strong>{career.contractMatches} jogos</strong></div>
            <div><small>FÃS</small><strong>{compact(career.fans)}</strong></div>
          </div>
        </article>
      </section>

      <section className="hub-panel hub-news-panel">
        <div className="hub-panel-heading"><div><span className="hub-kicker">NOTÍCIAS</span><h3>O que está acontecendo</h3></div><button onClick={() => onNavigate("world")}>Abrir mundo →</button></div>
        <div className="hub-news-list">
          {news.map((item) => (
            <article key={item.id}>
              <span>{item.category.toUpperCase()}{item.isNew ? " · NOVO" : ""}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
