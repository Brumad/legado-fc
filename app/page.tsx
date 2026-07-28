"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CareerState,
  Fixture,
  MatchMoment,
  MatchPlan,
  MatchTarget,
  Position,
  createFixture,
  generateMatchPlan,
  migrateCareer,
} from "./game-engine";

type Screen = "dashboard" | "match" | "result";
type FeedItem = { minute: number; text: string; tone?: "goal" | "chance" | "normal" };
type MatchResult = {
  xp: number; goals: number; assists: number; rating: number;
  unionGoals: number; opponentGoals: number; opponentName: string; signature: string;
};

const storageKey = "legado-fc-career-v2";
const emptyResult: MatchResult = {
  xp: 0, goals: 0, assists: 0, rating: 6.2,
  unionGoals: 0, opponentGoals: 0, opponentName: "", signature: "",
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function resultClass(result: string) {
  if (result.startsWith("V")) return "form-good";
  if (result.startsWith("E")) return "form-neutral";
  return "form-bad";
}

function Dashboard({
  career, fixture, onPlay, onReset,
}: {
  career: CareerState; fixture: Fixture; onPlay: () => void; onReset: () => void;
}) {
  const opponentStar = fixture.opponent.stars[fixture.seed % fixture.opponent.stars.length];
  return (
    <main className="dashboard-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">PRÓXIMA PARTIDA · {fixture.competition.toUpperCase()}</span>
          <h1>Nenhum jogo se repete.</h1>
          <p>
            Rodada {fixture.round} contra o {fixture.opponent.name}. {fixture.pressure} sob {fixture.weather}.
            O motor já preparou um confronto exclusivo para sua carreira.
          </p>
          <button className="primary-action" onClick={onPlay}>Jogar partida <span>→</span></button>
        </div>
        <div className="fixture-card" aria-label="Próxima partida">
          <div className="fixture-date">{fixture.home ? "CASA" : "FORA"} · {fixture.weather.toUpperCase()}</div>
          <div className="teams">
            <div className="team"><span className="crest crest-home">UA</span><strong>União Azul</strong></div>
            <div className="versus"><span>VS</span><small>{fixture.venue}</small></div>
            <div className="team"><span className="crest" style={{ background: fixture.opponent.color }}>{fixture.opponent.short}</span><strong>{fixture.opponent.name}</strong></div>
          </div>
          <div className="objective"><span>AMEAÇA PRINCIPAL</span><strong>{opponentStar}</strong></div>
        </div>
      </section>

      <section className="player-strip">
        <div className="player-identity">
          <div className="avatar">{career.name.split(" ").slice(0, 2).map((word) => word[0]).join("")}</div>
          <div><span className="eyebrow">NÍVEL {career.level} · {career.position}</span><h2>{career.name}</h2><p>União Azul · Camisa 18</p></div>
        </div>
        <div className="xp-block">
          <div className="xp-label"><span>Próximo nível</span><strong>{career.xp}/100 XP</strong></div>
          <div className="progress" aria-label={`${career.xp}% para o próximo nível`}><span style={{ width: `${career.xp}%` }} /></div>
        </div>
        <button className="ghost-button" onClick={onReset}>Nova carreira</button>
      </section>

      <section className="content-grid">
        <article className="panel season-panel">
          <div className="panel-heading"><div><span className="eyebrow">TEMPORADA 2026</span><h3>Seu momento</h3></div><span className="status-pill">{career.morale > 74 ? "Em alta" : "Sob pressão"}</span></div>
          <div className="stat-grid">
            <div><strong>{career.matches}</strong><span>Jogos</span></div>
            <div><strong>{career.goals}</strong><span>Gols</span></div>
            <div><strong>{career.assists}</strong><span>Assistências</span></div>
            <div><strong>{career.rating.toFixed(1)}</strong><span>Nota média</span></div>
          </div>
          <div className="form-row" aria-label="Resultados recentes">
            {(career.recentResults.length ? career.recentResults : ["V 2–1", "E 0–0", "D 1–2"]).slice(0, 4).map((result, index) => (
              <span className={resultClass(result)} key={`${result}-${index}`}>{result.split(" ")[0]}</span>
            ))}
            <span className="form-next">?</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><span className="eyebrow">PREPARAÇÃO</span><h3>Condição do atleta</h3></div></div>
          <div className="condition-row"><span>Energia</span><div className="progress"><span style={{ width: `${career.energy}%` }} /></div><strong>{career.energy}%</strong></div>
          <div className="condition-row"><span>Moral</span><div className="progress morale"><span style={{ width: `${career.morale}%` }} /></div><strong>{career.morale}%</strong></div>
          <div className="coach-note"><span>“</span><p>O adversário muda. Sua leitura também precisa mudar. Observe o contexto antes de arriscar.</p></div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><span className="eyebrow">CONFRONTO</span><h3>Contexto único</h3></div></div>
          <div className="milestone done"><span>01</span><div><strong>{fixture.pressure}</strong><small>pressão da rodada</small></div></div>
          <div className="milestone active"><span>02</span><div><strong>{fixture.weather}</strong><small>condição do campo</small></div></div>
          <div className="milestone locked"><span>03</span><div><strong>Força {fixture.opponent.strength}</strong><small>nível do adversário</small></div></div>
        </article>

        <article className="panel news-panel">
          <div className="panel-heading"><div><span className="eyebrow">MUNDO FICTÍCIO</span><h3>Notícias rápidas</h3></div></div>
          <div className="news-item"><span className="news-tag">MERCADO</span><p>{opponentStar}, do {fixture.opponent.name}, entra no radar de clubes estrangeiros.</p></div>
          <div className="news-item"><span className="news-tag secondary">LIGA</span><p>Corthias e Palmiros disputam a liderança; Barsemlona observa talentos brasileiros.</p></div>
        </article>
      </section>

      <section className="world-strip">
        <span className="eyebrow">MOTOR PROCEDURAL ATIVO</span>
        <div><strong>3</strong><span>países iniciais</span></div><div><strong>15</strong><span>clubes fictícios</span></div>
        <div><strong>1.000+</strong><span>jogos únicos</span></div><div><strong>4</strong><span>tipos de lance</span></div>
        <span className="live-dot">Seed #{fixture.seed.toString(36).toUpperCase()}</span>
      </section>
    </main>
  );
}

function outcomeText(
  moment: MatchMoment, success: boolean, goal: boolean, assist: boolean,
  career: CareerState, opponent: string,
) {
  if (goal) return `GOOOL! ${career.name} escolhe a execução certa e vence o goleiro!`;
  if (assist) return "Passe perfeito! A defesa quebra e o União Azul marca.";
  if (success && moment.kind === "defense") return `Desarme limpo! O ataque do ${opponent} termina aqui.`;
  if (success && moment.kind === "dribble") return "Você elimina o marcador e faz o estádio levantar.";
  if (success) return "Boa leitura. A jogada continua sob controle.";
  if (moment.kind === "defense") return `O ${opponent} escapa da marcação e finaliza com perigo.`;
  if (moment.kind === "shot") return "A finalização sai por pouco. O goleiro estava vendido.";
  return "O adversário percebe a intenção e recupera a bola.";
}

function MatchScreen({
  career, fixture, onFinish, onExit,
}: {
  career: CareerState; fixture: Fixture; onFinish: (result: MatchResult) => void; onExit: () => void;
}) {
  const [plan] = useState<MatchPlan>(() => generateMatchPlan(career, fixture));
  const [minute, setMinute] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [activeMoment, setActiveMoment] = useState<MatchMoment | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [processedEvents, setProcessedEvents] = useState<string[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([
    { minute: 0, text: `A bola rola sob ${fixture.weather}. ${fixture.pressure}.` },
  ]);
  const [xp, setXp] = useState(0);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [rating, setRating] = useState(6.2);
  const [toast, setToast] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || activeMoment || minute >= 90) return;
    const timer = window.setInterval(() => setMinute((current) => Math.min(90, current + 1)), 180);
    return () => window.clearInterval(timer);
  }, [playing, activeMoment, minute]);

  useEffect(() => {
    const events = plan.events.filter((event) => event.minute === minute && !processedEvents.includes(`${event.minute}-${event.kind}`));
    if (events.length) {
      setFeed((current) => [...current, ...events.map((event) => ({
        minute: event.minute, text: event.text,
        tone: event.kind.includes("goal") ? "goal" as const : event.kind === "chance" ? "chance" as const : "normal" as const,
      }))]);
      events.forEach((event) => {
        if (event.kind === "home-goal") setScore(([union, opponent]) => [union + 1, opponent]);
        if (event.kind === "away-goal") setScore(([union, opponent]) => [union, opponent + 1]);
      });
      setProcessedEvents((current) => [...current, ...events.map((event) => `${event.minute}-${event.kind}`)]);
    }
    const moment = plan.moments.find((item) => item.minute === minute && !completed.includes(item.id));
    if (moment) {
      setPlaying(false);
      setActiveMoment(moment);
      setFeed((current) => [...current, { minute, text: `${moment.title}. Agora a decisão é sua.`, tone: "chance" }]);
    }
    if (minute === 90) setPlaying(false);
  }, [minute, completed, plan, processedEvents]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [feed]);

  const matchFinished = minute >= 90 && !activeMoment;

  function resolveMoment(target: MatchTarget) {
    if (!activeMoment) return;
    const fatigue = minute * .0015;
    const skill = .7 + career.level * .018 + career.morale / 1200 - fatigue;
    const success = target.roll < skill - target.risk;
    const secondaryRoll = (target.roll * 997.37) % 1;
    const goal = success && (
      (activeMoment.kind === "shot" && secondaryRoll < .35 + target.risk * .65) ||
      (activeMoment.kind === "dribble" && target.risk > .24 && secondaryRoll < .24)
    );
    const assist = success && activeMoment.kind === "pass" && target.risk > .16 && secondaryRoll < .42 + target.risk;
    const defensiveError = !success && activeMoment.kind === "defense" && secondaryRoll > .55;
    const earned = success ? target.reward : 3;

    setXp((value) => value + earned);
    setRating((value) => Math.max(4, Math.min(10, value + (success ? .32 + target.risk : -.18))));
    if (goal) { setGoals((value) => value + 1); setScore(([union, opponent]) => [union + 1, opponent]); }
    if (assist) { setAssists((value) => value + 1); setScore(([union, opponent]) => [union + 1, opponent]); }
    if (defensiveError) setScore(([union, opponent]) => [union, opponent + 1]);

    const text = outcomeText(activeMoment, success, goal, assist, career, fixture.opponent.name);
    setFeed((current) => [...current, { minute, text, tone: goal || assist ? "goal" : "normal" }]);
    setToast(`${success ? "Decisão executada" : "Lance perdido"} · +${earned} XP`);
    setCompleted((current) => [...current, activeMoment.id]);
    setActiveMoment(null);
    window.setTimeout(() => { setToast(null); setPlaying(true); }, 750);
  }

  return (
    <main className="match-shell">
      <header className="match-header">
        <button className="icon-button" onClick={onExit} aria-label="Sair da partida">←</button>
        <div className="competition-label"><span>RODADA {fixture.round} · {fixture.competition.toUpperCase()}</span><strong>{fixture.venue} · {fixture.weather}</strong></div>
        <div className="scoreboard">
          <div><span className="mini-crest home">UA</span><strong>União Azul</strong></div>
          <span className="score">{score[0]} <small>–</small> {score[1]}</span>
          <div><strong>{fixture.opponent.name}</strong><span className="mini-crest" style={{ background: fixture.opponent.color }}>{fixture.opponent.short}</span></div>
        </div>
        <div className="match-minute">{minute}&apos;</div>
      </header>

      <section className="match-layout">
        <aside className="commentary-panel">
          <div className="commentary-top"><span className="live-badge"><i /> AO VIVO</span><span>{activeMoment ? "Momento decisivo" : playing ? "Em andamento" : "Pausado"}</span></div>
          <div className="timeline" ref={feedRef}>
            {feed.map((item, index) => (
              <div className={`timeline-item ${item.tone ?? ""}`} key={`${item.minute}-${index}`}>
                <span>{item.minute}&apos;</span><p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="match-controls">
            <button className="play-button" disabled={Boolean(activeMoment) || matchFinished} onClick={() => setPlaying((value) => !value)}>
              {playing ? "Ⅱ" : "▶"} <span>{playing ? "Pausar" : "Continuar"}</span>
            </button>
            <div className="minute-progress"><span style={{ width: `${minute / 90 * 100}%` }} /></div><span className="speed">{plan.intensity > 1 ? "INT" : "1×"}</span>
          </div>
        </aside>

        <section className="pitch-stage">
          <div className="pitch-copy">
            <div>
              <span className="eyebrow">{activeMoment ? `${activeMoment.kind.toUpperCase()} · PRESSÃO ${activeMoment.pressure.toUpperCase()}` : plan.signature}</span>
              <h1>{activeMoment ? activeMoment.title : matchFinished ? "Fim de jogo" : "O jogo está vivo."}</h1>
              <p>{activeMoment ? activeMoment.prompt : matchFinished ? "Esta partida jamais será gerada da mesma forma." : `${plan.events.length} eventos e ${plan.moments.length} decisões foram gerados exclusivamente para este confronto.`}</p>
            </div>
            <div className="player-rating"><span>SUA NOTA</span><strong>{rating.toFixed(1)}</strong></div>
          </div>
          <div className={`pitch ${activeMoment ? "is-active" : ""}`} aria-label="Campo de jogo interativo">
            <div className="halfway" /><div className="center-circle" /><div className="box box-left" /><div className="box box-right" /><div className="goal goal-left" /><div className="goal goal-right" />
            <div className="player-dot user-player" style={{ left: "48%", top: "51%" }}><span>18</span></div>
            <div className="player-dot teammate" style={{ left: "62%", top: "27%" }} /><div className="player-dot teammate" style={{ left: "69%", top: "68%" }} />
            <div className="player-dot opponent" style={{ left: "61%", top: "48%" }} /><div className="player-dot opponent" style={{ left: "76%", top: "61%" }} />
            {activeMoment?.targets.map((target) => (
              <button key={target.id} className="pitch-target" style={{ left: `${target.x}%`, top: `${target.y}%` }} onClick={() => resolveMoment(target)} aria-label={`${target.label}: ${target.hint}`}>
                <span>{activeMoment.kind === "shot" ? "◎" : activeMoment.kind === "defense" ? "×" : "↗"}</span>
                <strong>{target.label}</strong><small>{target.hint} · +{target.reward} XP</small>
              </button>
            ))}
            {!activeMoment && !matchFinished && <div className="waiting-message"><span className="pulse-ball">●</span>{plan.signature}</div>}
            {matchFinished && <div className="fulltime-card"><span>APITO FINAL</span><strong>{score[0]} – {score[1]}</strong><p>{score[0] > score[1] ? "Vitória do União Azul!" : score[0] === score[1] ? "Um ponto para cada lado." : `Vitória do ${fixture.opponent.name}.`}</p></div>}
          </div>
          <div className="match-stats-bar">
            <div><span>XP NA PARTIDA</span><strong>+{xp}</strong></div><div><span>PARTICIPAÇÕES</span><strong>{goals + assists}</strong></div>
            <div><span>DECISÕES</span><strong>{completed.length}/{plan.moments.length}</strong></div>
            {matchFinished ? (
              <button className="primary-action compact" onClick={() => onFinish({
                xp, goals, assists, rating, unionGoals: score[0], opponentGoals: score[1],
                opponentName: fixture.opponent.name, signature: plan.signature,
              })}>Ver resultado →</button>
            ) : <span className="match-tip">Cada alvo usa risco, atributo, forma e fadiga.</span>}
          </div>
        </section>
      </section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function ResultScreen({ career, result, fixture, onContinue }: {
  career: CareerState; result: MatchResult; fixture: Fixture; onContinue: () => void;
}) {
  return (
    <main className="result-shell"><div className="result-glow" />
      <section className="result-card">
        <span className="eyebrow">{result.signature}</span>
        <div className="result-score">
          <div><span className="crest crest-home">UA</span><strong>União Azul</strong></div>
          <p>{result.unionGoals} <small>–</small> {result.opponentGoals}</p>
          <div><span className="crest" style={{ background: fixture.opponent.color }}>{fixture.opponent.short}</span><strong>{result.opponentName}</strong></div>
        </div>
        <div className="result-player">
          <div className="avatar">{career.name.split(" ").slice(0, 2).map((word) => word[0]).join("")}</div>
          <div><span>{career.position} · 90 minutos</span><h1>{career.name}</h1></div>
          <div className="rating-medal"><span>NOTA</span><strong>{result.rating.toFixed(1)}</strong></div>
        </div>
        <div className="result-metrics">
          <div><strong>{result.goals}</strong><span>Gols</span></div><div><strong>{result.assists}</strong><span>Assistências</span></div>
          <div><strong>+{result.xp}</strong><span>XP recebido</span></div><div><strong>+{Math.max(80, Math.round(result.rating * 43))}</strong><span>Novos fãs</span></div>
        </div>
        <div className="coach-verdict"><span>REGISTRO DA CARREIRA</span><p>Esta partida foi salva com placar, adversário e assinatura próprios. A próxima usará uma nova seed e outro roteiro.</p></div>
        <button className="primary-action result-action" onClick={onContinue}>Gerar próximo confronto <span>→</span></button>
      </section>
    </main>
  );
}

function CareerCreator({ onCreate, onClose }: { onCreate: (career: CareerState) => void; onClose?: () => void }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("Meia");
  const [origin, setOrigin] = useState("Clube de bairro");
  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate(migrateCareer({ name: name.trim() || "Alex Silva", position, origin, matches: 0, recentResults: [] }));
  }
  return (
    <div className="creator-backdrop"><section className="creator-modal" role="dialog" aria-modal="true" aria-labelledby="creator-title">
      {onClose && <button className="modal-close" onClick={onClose} aria-label="Fechar">×</button>}
      <span className="brand-mark large">L</span><span className="eyebrow">SUA PRIMEIRA CARREIRA</span>
      <h1 id="creator-title">Todo legado começa com um nome.</h1><p>Cada carreira recebe uma seed exclusiva que evolui a cada partida.</p>
      <form onSubmit={submit}>
        <label>Nome do jogador<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Silva" autoFocus /></label>
        <div className="form-columns">
          <label>Posição<select value={position} onChange={(event) => setPosition(event.target.value as Position)}><option>Atacante</option><option>Ponta</option><option>Meia</option><option>Lateral</option><option>Zagueiro</option></select></label>
          <label>Origem<select value={origin} onChange={(event) => setOrigin(event.target.value)}><option>Clube de bairro</option><option>Academia regional</option><option>Futebol escolar</option><option>Sem clube</option></select></label>
        </div>
        <div className="origin-note"><span>MOTOR DINÂMICO</span><strong>Ativado</strong><p>Posição, adversário, fadiga e decisões mudam os lances disponíveis.</p></div>
        <button className="primary-action form-action" type="submit">Começar minha história <span>→</span></button>
      </form>
    </section></div>
  );
}

export default function Home() {
  const [career, setCareer] = useState<CareerState | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [lastResult, setLastResult] = useState<MatchResult>(emptyResult);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem("legado-fc-career-v1");
    if (saved) {
      try { setCareer(migrateCareer(JSON.parse(saved))); } catch { setCareer(null); }
    }
    setLoaded(true);
  }, []);
  useEffect(() => { if (career) window.localStorage.setItem(storageKey, JSON.stringify(career)); }, [career]);

  const fixture = useMemo(() => career ? createFixture(career) : null, [career]);

  function continueCareer() {
    if (!career) return;
    const nextXp = career.xp + lastResult.xp;
    const resultLetter = lastResult.unionGoals > lastResult.opponentGoals ? "V" : lastResult.unionGoals === lastResult.opponentGoals ? "E" : "D";
    const newFans = Math.max(80, Math.round(lastResult.rating * 43));
    setCareer({
      ...career,
      level: career.level + (nextXp >= 100 ? 1 : 0),
      xp: nextXp >= 100 ? nextXp - 100 : nextXp,
      matches: career.matches + 1,
      goals: career.goals + lastResult.goals,
      assists: career.assists + lastResult.assists,
      rating: Number(((career.rating * career.matches + lastResult.rating) / (career.matches + 1)).toFixed(1)),
      fans: career.fans + newFans,
      energy: Math.max(52, career.energy - 22 + Math.floor(Math.random() * 7)),
      morale: Math.max(35, Math.min(100, career.morale + (resultLetter === "V" ? 8 : resultLetter === "E" ? 1 : -5))),
      recentResults: [`${resultLetter} ${lastResult.unionGoals}–${lastResult.opponentGoals}`, ...career.recentResults].slice(0, 6),
    });
    setScreen("dashboard");
  }

  if (!loaded) return <div className="loading-screen">Gerando seu mundo…</div>;
  if (!career) return <CareerCreator onCreate={(next) => { setCareer(next); setScreen("dashboard"); }} />;
  if (!fixture) return null;

  return (
    <div className="app-root">
      {screen === "dashboard" && <>
        <header className="site-header">
          <div className="brand"><span className="brand-mark">L</span><div><strong>LEGADO FC</strong><small>Motor procedural v2</small></div></div>
          <nav aria-label="Navegação principal"><button className="nav-active">Carreira</button><button disabled>Clube</button><button disabled>Mundo</button><button disabled>Vida</button></nav>
          <div className="header-profile"><span><small>FÃS</small>{compactNumber(career.fans)}</span><div className="mini-avatar">{career.name[0]}</div></div>
        </header>
        <Dashboard career={career} fixture={fixture} onPlay={() => setScreen("match")} onReset={() => setShowCreator(true)} />
        {showCreator && <CareerCreator onCreate={(next) => { setCareer(next); setShowCreator(false); }} onClose={() => setShowCreator(false)} />}
      </>}
      {screen === "match" && <MatchScreen career={career} fixture={fixture} onExit={() => setScreen("dashboard")} onFinish={(result) => { setLastResult(result); setScreen("result"); }} />}
      {screen === "result" && <ResultScreen career={career} result={lastResult} fixture={fixture} onContinue={continueCareer} />}
    </div>
  );
}
