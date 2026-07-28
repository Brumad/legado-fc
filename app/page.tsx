"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Position = "Atacante" | "Ponta" | "Meia" | "Lateral" | "Zagueiro";
type Screen = "dashboard" | "match" | "result";
type Career = {
  name: string; position: Position; origin: string; level: number; xp: number;
  fans: number; matches: number; goals: number; assists: number; rating: number;
  energy: number; morale: number;
};
type Commentary = { minute: number; text: string; tone?: "goal" | "chance" | "normal" };
type Moment = {
  minute: number; title: string; prompt: string; kind: "pass" | "shot";
  targets: Array<{ id: string; label: string; hint: string; x: number; y: number; risk: number }>;
};
type MatchResult = { xp: number; goals: number; assists: number; rating: number };

const DEFAULT_CAREER: Career = {
  name: "Alex Silva", position: "Meia", origin: "Clube de bairro", level: 1,
  xp: 35, fans: 1280, matches: 3, goals: 1, assists: 2, rating: 7.1,
  energy: 82, morale: 76,
};

const COMMENTARY: Commentary[] = [
  { minute: 2, text: "O União Azul começa trocando passes com paciência." },
  { minute: 7, text: "Aurora sobe a marcação e fecha o corredor central." },
  { minute: 12, text: "Você recebe entre as linhas e acelera a jogada.", tone: "chance" },
  { minute: 18, text: "Boa recuperação de Matheus Lima no meio-campo." },
  { minute: 24, text: "A torcida aumenta o volume. O jogo está aberto." },
  { minute: 31, text: "DEFESA! Caio Ramos salva o União Azul." },
  { minute: 38, text: "Você gira sobre o marcador e encontra espaço.", tone: "chance" },
  { minute: 45, text: "Fim do primeiro tempo. Tudo igual no Estádio do Vale." },
  { minute: 51, text: "Aurora volta pressionando pelo lado esquerdo." },
  { minute: 58, text: "Contra-ataque! Você carrega com três opções à frente.", tone: "chance" },
  { minute: 66, text: "O técnico pede calma e aproximação entre os setores." },
  { minute: 73, text: "Falta perigosa para o Aurora. A barreira está formada." },
  { minute: 79, text: "A bola sobra na entrada da área. É a chance do jogo.", tone: "chance" },
  { minute: 86, text: "O União Azul controla a posse e administra a vantagem." },
  { minute: 90, text: "Fim de jogo no Estádio do Vale." },
];

const MOMENTS: Moment[] = [
  {
    minute: 12, title: "Quebre a primeira linha",
    prompt: "Escolha onde colocar o passe. Alvos mais agressivos valem mais XP.", kind: "pass",
    targets: [
      { id: "safe", label: "Passe seguro", hint: "+8 XP", x: 29, y: 61, risk: .06 },
      { id: "wing", label: "Abrir na ponta", hint: "+14 XP", x: 60, y: 20, risk: .19 },
      { id: "through", label: "Enfiada", hint: "+22 XP", x: 76, y: 51, risk: .34 },
    ],
  },
  {
    minute: 58, title: "Contra-ataque em superioridade",
    prompt: "A defesa está recuando. Decida antes que os espaços fechem.", kind: "pass",
    targets: [
      { id: "hold", label: "Prender a bola", hint: "+6 XP", x: 36, y: 73, risk: .05 },
      { id: "overlap", label: "Ultrapassagem", hint: "+18 XP", x: 66, y: 77, risk: .22 },
      { id: "killer", label: "Passe para gol", hint: "+28 XP", x: 78, y: 39, risk: .38 },
    ],
  },
  {
    minute: 79, title: "A bola do jogo",
    prompt: "Escolha o canto. Colocada é segura; potência vence de perto.", kind: "shot",
    targets: [
      { id: "placed", label: "Colocada", hint: "Canto direito", x: 89, y: 32, risk: .2 },
      { id: "power", label: "Potência", hint: "Alto e forte", x: 93, y: 50, risk: .32 },
      { id: "low", label: "Rasteira", hint: "Canto esquerdo", x: 89, y: 68, risk: .25 },
    ],
  },
];

const storageKey = "legado-fc-career-v1";

function compactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function Dashboard({ career, onPlay, onReset }: { career: Career; onPlay: () => void; onReset: () => void }) {
  return (
    <main className="dashboard-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">PRÓXIMA PARTIDA · LIGA NACIONAL B</span>
          <h1>Sua história entra em campo.</h1>
          <p>União Azul recebe o Aurora FC. O técnico espera criatividade entre as linhas e pelo menos uma participação em gol.</p>
          <button className="primary-action" onClick={onPlay}>Jogar partida <span>→</span></button>
        </div>
        <div className="fixture-card" aria-label="Próxima partida">
          <div className="fixture-date">HOJE · 20:30</div>
          <div className="teams">
            <div className="team"><span className="crest crest-home">UA</span><strong>União Azul</strong></div>
            <div className="versus"><span>VS</span><small>Estádio do Vale</small></div>
            <div className="team"><span className="crest crest-away">AF</span><strong>Aurora FC</strong></div>
          </div>
          <div className="objective"><span>OBJETIVO</span><strong>Nota 7.0 ou superior</strong></div>
        </div>
      </section>

      <section className="player-strip">
        <div className="player-identity">
          <div className="avatar">{career.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</div>
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
          <div className="panel-heading"><div><span className="eyebrow">TEMPORADA 2026</span><h3>Seu momento</h3></div><span className="status-pill">Em alta</span></div>
          <div className="stat-grid">
            <div><strong>{career.matches}</strong><span>Jogos</span></div>
            <div><strong>{career.goals}</strong><span>Gols</span></div>
            <div><strong>{career.assists}</strong><span>Assistências</span></div>
            <div><strong>{career.rating.toFixed(1)}</strong><span>Nota média</span></div>
          </div>
          <div className="form-row"><span className="form-good">7.4</span><span className="form-good">7.1</span><span className="form-neutral">6.6</span><span className="form-next">?</span></div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><span className="eyebrow">PREPARAÇÃO</span><h3>Condição do atleta</h3></div></div>
          <div className="condition-row"><span>Energia</span><div className="progress"><span style={{ width: `${career.energy}%` }} /></div><strong>{career.energy}%</strong></div>
          <div className="condition-row"><span>Moral</span><div className="progress morale"><span style={{ width: `${career.morale}%` }} /></div><strong>{career.morale}%</strong></div>
          <div className="coach-note"><span>“</span><p>Você começa como titular. Seja corajoso com a bola, mas não abandone o meio.</p></div>
        </article>

        <article className="panel">
          <div className="panel-heading"><div><span className="eyebrow">JORNADA</span><h3>Próximos marcos</h3></div></div>
          <div className="milestone done"><span>✓</span><div><strong>Primeiro contrato</strong><small>Concluído</small></div></div>
          <div className="milestone active"><span>02</span><div><strong>Ganhar a titularidade</strong><small>3 de 5 partidas</small></div></div>
          <div className="milestone locked"><span>03</span><div><strong>Interesse nacional</strong><small>Reputação 2.500</small></div></div>
        </article>

        <article className="panel news-panel">
          <div className="panel-heading"><div><span className="eyebrow">MUNDO</span><h3>Notícias rápidas</h3></div></div>
          <div className="news-item"><span className="news-tag">MERCADO</span><p>Real Portuário observa jovens da Liga Nacional B.</p></div>
          <div className="news-item"><span className="news-tag secondary">CLUBE</span><p>União Azul anuncia casa cheia para o duelo desta noite.</p></div>
        </article>
      </section>

      <section className="world-strip">
        <span className="eyebrow">MUNDO EM SIMULAÇÃO</span>
        <div><strong>3</strong><span>países</span></div><div><strong>6</strong><span>divisões</span></div>
        <div><strong>96</strong><span>clubes</span></div><div><strong>2.486</strong><span>atletas</span></div>
        <span className="live-dot">Mundo ativo</span>
      </section>
    </main>
  );
}

function MatchScreen({ career, onFinish, onExit }: { career: Career; onFinish: (r: MatchResult) => void; onExit: () => void }) {
  const [minute, setMinute] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [activeMoment, setActiveMoment] = useState<Moment | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);
  const [feed, setFeed] = useState<Commentary[]>([{ minute: 0, text: "A bola rola no Estádio do Vale." }]);
  const [xp, setXp] = useState(0);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [rating, setRating] = useState(6.2);
  const [toast, setToast] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || activeMoment || minute >= 90) return;
    const timer = window.setInterval(() => setMinute((m) => Math.min(90, m + 1)), 260);
    return () => window.clearInterval(timer);
  }, [playing, activeMoment, minute]);

  useEffect(() => {
    const event = COMMENTARY.find((item) => item.minute === minute);
    if (event) setFeed((current) => [...current, event]);
    const moment = MOMENTS.find((item) => item.minute === minute);
    if (moment && !completed.includes(moment.minute)) { setPlaying(false); setActiveMoment(moment); }
    if (minute === 90) setPlaying(false);
  }, [minute, completed]);

  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" }); }, [feed]);

  const matchFinished = minute >= 90 && !activeMoment;

  function resolveMoment(target: Moment["targets"][number]) {
    if (!activeMoment) return;
    const success = .76 + career.level * .015 - target.risk >= .48;
    const isGoal = success && activeMoment.kind === "shot";
    const isAssist = success && activeMoment.kind === "pass" && target.risk > .3;
    const earned = success ? Math.round(8 + target.risk * 50) : 4;
    setXp((v) => v + earned);
    setRating((v) => Math.min(10, v + (success ? .45 + target.risk : -.15)));
    if (isGoal) { setGoals((v) => v + 1); setScore(([h, a]) => [h + 1, a]); }
    if (isAssist) { setAssists((v) => v + 1); setScore(([h, a]) => [h + 1, a]); }
    const text = isGoal ? `GOOOL! ${career.name} decide no canto!`
      : isAssist ? "Passe perfeito! Assistência para o gol do União Azul."
      : success ? "Boa decisão. O União Azul mantém a jogada viva."
      : "O Aurora lê a intenção e recupera a bola.";
    setFeed((f) => [...f, { minute: activeMoment.minute, text, tone: isGoal || isAssist ? "goal" : "normal" }]);
    setToast(`${success ? "Lance concluído" : "Quase!"} · +${earned} XP`);
    setCompleted((c) => [...c, activeMoment.minute]);
    setActiveMoment(null);
    window.setTimeout(() => { setToast(null); setPlaying(true); }, 800);
  }

  return (
    <main className="match-shell">
      <header className="match-header">
        <button className="icon-button" onClick={onExit} aria-label="Sair da partida">←</button>
        <div className="competition-label"><span>RODADA 4 · LIGA NACIONAL B</span><strong>Estádio do Vale</strong></div>
        <div className="scoreboard">
          <div><span className="mini-crest home">UA</span><strong>União Azul</strong></div>
          <span className="score">{score[0]} <small>–</small> {score[1]}</span>
          <div><strong>Aurora FC</strong><span className="mini-crest away">AF</span></div>
        </div>
        <div className="match-minute">{minute}&apos;</div>
      </header>

      <section className="match-layout">
        <aside className="commentary-panel">
          <div className="commentary-top"><span className="live-badge"><i /> AO VIVO</span><span>{activeMoment ? "Momento decisivo" : playing ? "Em andamento" : "Pausado"}</span></div>
          <div className="timeline" ref={feedRef}>
            {feed.map((item, i) => <div className={`timeline-item ${item.tone ?? ""}`} key={`${item.minute}-${i}`}><span>{item.minute}&apos;</span><p>{item.text}</p></div>)}
          </div>
          <div className="match-controls">
            <button className="play-button" disabled={Boolean(activeMoment) || matchFinished} onClick={() => setPlaying((v) => !v)}>{playing ? "Ⅱ" : "▶"} <span>{playing ? "Pausar" : "Continuar"}</span></button>
            <div className="minute-progress"><span style={{ width: `${minute / 90 * 100}%` }} /></div><span className="speed">1×</span>
          </div>
        </aside>

        <section className="pitch-stage">
          <div className="pitch-copy">
            <div>
              <span className="eyebrow">{activeMoment ? `MOMENTO JOGÁVEL · ${activeMoment.minute}'` : "VISÃO DA PARTIDA"}</span>
              <h1>{activeMoment ? activeMoment.title : matchFinished ? "Fim de jogo" : "Leia o jogo."}</h1>
              <p>{activeMoment ? activeMoment.prompt : matchFinished ? "A partida terminou. Veja como sua atuação mexeu com a carreira." : "Acompanhe a narração. Quando surgir uma chance, você assume o controle."}</p>
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
                <span>{activeMoment.kind === "shot" ? "◎" : "↗"}</span><strong>{target.label}</strong><small>{target.hint}</small>
              </button>
            ))}
            {!activeMoment && !matchFinished && <div className="waiting-message"><span className="pulse-ball">●</span>Simulação minuto a minuto</div>}
            {matchFinished && <div className="fulltime-card"><span>APITO FINAL</span><strong>{score[0]} – {score[1]}</strong><p>{score[0] > score[1] ? "Vitória do União Azul!" : "Um ponto para cada lado."}</p></div>}
          </div>
          <div className="match-stats-bar">
            <div><span>XP NA PARTIDA</span><strong>+{xp}</strong></div><div><span>PARTICIPAÇÕES</span><strong>{goals + assists}</strong></div>
            <div><span>ENERGIA</span><strong>{Math.max(48, career.energy - Math.round(minute * .35))}%</strong></div>
            {matchFinished ? <button className="primary-action compact" onClick={() => onFinish({ xp, goals, assists, rating })}>Ver resultado →</button> : <span className="match-tip">Clique em um alvo quando o campo acender.</span>}
          </div>
        </section>
      </section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function ResultScreen({ career, result, onContinue }: { career: Career; result: MatchResult; onContinue: () => void }) {
  return (
    <main className="result-shell"><div className="result-glow" />
      <section className="result-card">
        <span className="eyebrow">PARTIDA CONCLUÍDA</span>
        <div className="result-score">
          <div><span className="crest crest-home">UA</span><strong>União Azul</strong></div><p>1 <small>–</small> 0</p>
          <div><span className="crest crest-away">AF</span><strong>Aurora FC</strong></div>
        </div>
        <div className="result-player">
          <div className="avatar">{career.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}</div>
          <div><span>{career.position} · 90 minutos</span><h1>{career.name}</h1></div>
          <div className="rating-medal"><span>NOTA</span><strong>{result.rating.toFixed(1)}</strong></div>
        </div>
        <div className="result-metrics">
          <div><strong>{result.goals}</strong><span>Gols</span></div><div><strong>{result.assists}</strong><span>Assistências</span></div>
          <div><strong>+{result.xp}</strong><span>XP recebido</span></div><div><strong>+320</strong><span>Novos fãs</span></div>
        </div>
        <div className="coach-verdict"><span>AVALIAÇÃO DO TÉCNICO</span><p>“Você encontrou os espaços e assumiu responsabilidade. É assim que se ganha confiança.”</p></div>
        <button className="primary-action result-action" onClick={onContinue}>Continuar carreira <span>→</span></button>
      </section>
    </main>
  );
}

function CareerCreator({ onCreate, onClose }: { onCreate: (c: Career) => void; onClose?: () => void }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("Meia");
  const [origin, setOrigin] = useState("Clube de bairro");
  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate({ ...DEFAULT_CAREER, name: name.trim() || DEFAULT_CAREER.name, position, origin });
  }
  return (
    <div className="creator-backdrop"><section className="creator-modal" role="dialog" aria-modal="true" aria-labelledby="creator-title">
      {onClose && <button className="modal-close" onClick={onClose} aria-label="Fechar">×</button>}
      <span className="brand-mark large">L</span><span className="eyebrow">SUA PRIMEIRA CARREIRA</span>
      <h1 id="creator-title">Todo legado começa com um nome.</h1><p>Crie seu atleta e entre direto na quarta rodada da Liga Nacional B.</p>
      <form onSubmit={submit}>
        <label>Nome do jogador<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Silva" autoFocus /></label>
        <div className="form-columns">
          <label>Posição<select value={position} onChange={(e) => setPosition(e.target.value as Position)}><option>Atacante</option><option>Ponta</option><option>Meia</option><option>Lateral</option><option>Zagueiro</option></select></label>
          <label>Origem<select value={origin} onChange={(e) => setOrigin(e.target.value)}><option>Clube de bairro</option><option>Academia regional</option><option>Futebol escolar</option><option>Sem clube</option></select></label>
        </div>
        <div className="origin-note"><span>TRAÇO INICIAL</span><strong>Corajoso</strong><p>Você ganha mais experiência ao escolher jogadas de maior risco.</p></div>
        <button className="primary-action form-action" type="submit">Começar minha história <span>→</span></button>
      </form>
    </section></div>
  );
}

export default function Home() {
  const [career, setCareer] = useState<Career | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [lastResult, setLastResult] = useState<MatchResult>({ xp: 0, goals: 0, assists: 0, rating: 6.2 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) { try { setCareer(JSON.parse(saved)); } catch { setCareer(DEFAULT_CAREER); } }
    setLoaded(true);
  }, []);
  useEffect(() => { if (career) window.localStorage.setItem(storageKey, JSON.stringify(career)); }, [career]);

  function continueCareer() {
    if (!career) return;
    const nextXp = career.xp + lastResult.xp;
    setCareer({
      ...career, level: career.level + (nextXp >= 100 ? 1 : 0), xp: nextXp >= 100 ? nextXp - 100 : nextXp,
      matches: career.matches + 1, goals: career.goals + lastResult.goals, assists: career.assists + lastResult.assists,
      rating: Number(((career.rating * career.matches + lastResult.rating) / (career.matches + 1)).toFixed(1)),
      fans: career.fans + 320, energy: Math.max(52, career.energy - 26), morale: Math.min(100, career.morale + 8),
    });
    setScreen("dashboard");
  }

  if (!loaded) return <div className="loading-screen">Preparando seu vestiário…</div>;
  if (!career) return <CareerCreator onCreate={(c) => { setCareer(c); setScreen("dashboard"); }} />;

  return (
    <div className="app-root">
      {screen === "dashboard" && <>
        <header className="site-header">
          <div className="brand"><span className="brand-mark">L</span><div><strong>LEGADO FC</strong><small>Visão geral</small></div></div>
          <nav aria-label="Navegação principal"><button className="nav-active">Carreira</button><button disabled>Clube</button><button disabled>Mundo</button><button disabled>Vida</button></nav>
          <div className="header-profile"><span><small>FÃS</small>{compactNumber(career.fans)}</span><div className="mini-avatar">{career.name[0]}</div></div>
        </header>
        <Dashboard career={career} onPlay={() => setScreen("match")} onReset={() => setShowCreator(true)} />
        {showCreator && <CareerCreator onCreate={(c) => { setCareer(c); setShowCreator(false); }} onClose={() => setShowCreator(false)} />}
      </>}
      {screen === "match" && <MatchScreen career={career} onExit={() => setScreen("dashboard")} onFinish={(r) => { setLastResult(r); setScreen("result"); }} />}
      {screen === "result" && <ResultScreen career={career} result={lastResult} onContinue={continueCareer} />}
    </div>
  );
}
