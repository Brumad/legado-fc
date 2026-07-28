"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Archetype,
  CareerState,
  CountryId,
  COUNTRIES,
  Difficulty,
  DivisionLevel,
  Fixture,
  Foot,
  MatchMoment,
  MatchPlan,
  MatchTarget,
  ORIGINS,
  OriginType,
  Position,
  Team,
  TEAMS,
  WORLD_TEAMS,
  addDaysToDate,
  buildCareerNews,
  createFixture,
  generateMatchPlan,
  generateStandings,
  getClubLeaders,
  getCountry,
  getDaysToNextMatch,
  getLeagueDefinition,
  getOverall,
  getPreparationActionCount,
  getSalary,
  getStartingClub,
  hashText,
  migrateCareer,
  simulateFullRound,
} from "./game-engine";

type AppView = "lobby" | "dashboard" | "season" | "player" | "life" | "market" | "settings" | "match" | "result";
type FeedItem = { minute: number; text: string; tone?: "goal" | "chance" | "normal" };
type MatchResult = {
  xp: number;
  goals: number;
  assists: number;
  rating: number;
  unionGoals: number;
  opponentGoals: number;
  opponentName: string;
  signature: string;
};
type GameSettings = {
  matchSpeed: "1x" | "2x" | "3x";
  reducedMotion: boolean;
  compactHud: boolean;
  highContrast: boolean;
  commentary: boolean;
  developerMode: boolean;
};
type TrainingKind = "recovery" | "technique" | "intensity" | "tactics" | "setpieces" | "language" | "media";

const slotsKey = "legado-fc-career-slots-v1";
const settingsKey = "legado-fc-settings-v1";
const legacyKeys = ["legado-fc-career-v2", "legado-fc-career-v1"];
const defaultSettings: GameSettings = {
  matchSpeed: "2x",
  reducedMotion: false,
  compactHud: false,
  highContrast: false,
  commentary: true,
  developerMode: false,
};
const emptyResult: MatchResult = {
  xp: 0,
  goals: 0,
  assists: 0,
  rating: 6.2,
  unionGoals: 0,
  opponentGoals: 0,
  opponentName: "",
  signature: "",
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
    notation: value >= 1_000_000 ? "compact" : "standard",
  }).format(value);
}

function resultClass(result: string) {
  if (result.startsWith("V")) return "is-win";
  if (result.startsWith("E")) return "is-draw";
  return "is-loss";
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function TeamCrest({ short, color, small = false }: { short: string; color: string; small?: boolean }) {
  return <span className={`team-crest ${small ? "is-small" : ""}`} style={{ "--crest-color": color } as React.CSSProperties}>{short}</span>;
}

function PlayerAvatar({ career, large = false }: { career: CareerState; large?: boolean }) {
  const hairClasses: Record<string, string> = {
    Curto: "hair-short",
    Raspado: "hair-shaved",
    Cacheado: "hair-curly",
    Tranças: "hair-braids",
  };
  return (
    <div className={`player-avatar ${large ? "is-large" : ""}`} style={{ "--skin": career.skinTone, "--kit": career.clubColor } as React.CSSProperties} aria-label={`Avatar de ${career.name}`}>
      <span className={`avatar-hair ${hairClasses[career.hairStyle] ?? "hair-short"}`} />
      <span className="avatar-head" />
      <span className="avatar-body"><b>{career.shirtNumber}</b></span>
    </div>
  );
}

function Brand({ dark = false }: { dark?: boolean }) {
  return <div className={`game-brand ${dark ? "is-dark" : ""}`}><span className="brand-symbol">L</span><div><strong>LEGADO FC</strong><small>VIDA E LEGADO 0.3.3</small></div></div>;
}

function Lobby({
  slots,
  onSelect,
  onCreate,
  onDelete,
  onSettings,
}: {
  slots: Array<CareerState | null>;
  onSelect: (index: number) => void;
  onCreate: (index: number) => void;
  onDelete: (index: number) => void;
  onSettings: () => void;
}) {
  const totalMatches = slots.reduce((total, slot) => total + (slot?.matches ?? 0), 0);
  return (
    <main className="lobby-shell">
      <div className="lobby-noise" />
      <header className="lobby-header">
        <Brand dark />
        <div className="lobby-actions">
          <span className="cloud-status"><i /> SALVO NESTE DISPOSITIVO</span>
          <button className="round-button" onClick={onSettings} aria-label="Abrir configurações">⚙</button>
        </div>
      </header>

      <section className="lobby-hero">
        <div className="lobby-copy">
          <span className="overline">CENTRAL DE CARREIRAS</span>
          <h1>Escolha o legado<br />que entra em campo.</h1>
          <p>Três histórias independentes. Cada uma com sua temporada, personalidade, mercado e universo procedural.</p>
        </div>
        <div className="lobby-world-card">
          <span className="radar-ring ring-one" /><span className="radar-ring ring-two" />
          <div className="world-ball">◉</div>
          <div className="world-stat"><small>MUNDO ATIVO</small><strong>{TEAMS.length} clubes</strong><span>{COUNTRIES.length} países · {totalMatches} partidas</span></div>
        </div>
      </section>

      <section className="slot-grid" aria-label="Slots de carreira">
        {slots.map((career, index) => career ? (
          <article className="career-slot has-career" key={career.id}>
            <div className="slot-top">
              <span>SLOT 0{index + 1}</span>
              <button className="slot-menu" onClick={() => onDelete(index)} aria-label={`Excluir carreira de ${career.name}`}>×</button>
            </div>
            <div className="slot-player">
              <PlayerAvatar career={career} large />
              <div className="slot-number">{String(career.shirtNumber).padStart(2, "0")}</div>
            </div>
            <div className="slot-info">
              <div className="slot-club"><TeamCrest short={career.clubShort} color={career.clubColor} small /><span>{career.clubName}</span></div>
              <h2>{career.name}</h2>
              <p>{career.countryName} · {career.leagueName} · {career.position}</p>
            </div>
            <div className="slot-progress">
              <div><span>Temporada</span><strong>{career.season}</strong></div>
              <div><span>Rodada</span><strong>{career.seasonRound}/{getLeagueDefinition(career.countryId, career.division).format.rounds}</strong></div>
              <div><span>Overall</span><strong>{getOverall(career)}</strong></div>
            </div>
            <button className="slot-play" onClick={() => onSelect(index)}>CONTINUAR CARREIRA <span>→</span></button>
          </article>
        ) : (
          <article className="career-slot empty-slot" key={`empty-${index}`}>
            <div className="slot-top"><span>SLOT 0{index + 1}</span><small>VAZIO</small></div>
            <div className="empty-pitch"><span className="pitch-cross">+</span><i /><i /></div>
            <h2>Um novo começo</h2>
            <p>Escolha país, divisão, origem e o clube onde sua história começa.</p>
            <button className="slot-create" onClick={() => onCreate(index)}><span>＋</span> CRIAR NOVA CARREIRA</button>
          </article>
        ))}
      </section>

      <footer className="lobby-footer">
        <span>LEGADO ENGINE <b>3.3</b></span>
        <p>Rodadas completas, elencos titulares e uma vida inteira fora do campo.</p>
        <span>12 PAÍSES · {TEAMS.length} CLUBES · {WORLD_TEAMS.reduce((total, team) => total + team.squad.length, 0)} TITULARES</span>
      </footer>
    </main>
  );
}

function OptionPill({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" className={`option-pill ${active ? "is-active" : ""}`} onClick={onClick}>{children}</button>;
}

function CareerCreator({
  onCreate,
  onClose,
  slot,
}: {
  onCreate: (career: CareerState) => void;
  onClose: () => void;
  slot: number;
}) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("Meia");
  const [origin, setOrigin] = useState<OriginType>("Clube de bairro");
  const [nationality, setNationality] = useState("Brasil");
  const [countryId, setCountryId] = useState<CountryId>("BR");
  const [division, setDivision] = useState<DivisionLevel>(2);
  const [foot, setFoot] = useState<Foot>("Direito");
  const [archetype, setArchetype] = useState<Archetype>("Maestro");
  const [difficulty, setDifficulty] = useState<Difficulty>("Profissional");
  const [age, setAge] = useState(18);
  const [shirtNumber, setShirtNumber] = useState(18);
  const [skinTone, setSkinTone] = useState("#b97850");
  const [hairStyle, setHairStyle] = useState("Curto");

  const selectedCountry = useMemo(() => COUNTRIES.find((country) => country.id === countryId) ?? COUNTRIES[0], [countryId]);
  const selectedLeague = useMemo(() => getLeagueDefinition(countryId, division), [countryId, division]);
  const selectedClub = useMemo(() => getStartingClub(countryId, division, origin), [countryId, division, origin]);
  const preview = useMemo(() => migrateCareer({
    name: name.trim() || "Novo Talento",
    position,
    origin,
    nationality,
    countryId,
    countryName: selectedCountry.name,
    division,
    leagueId: selectedLeague.id,
    leagueName: selectedLeague.name,
    clubId: selectedClub.id,
    clubName: selectedClub.name,
    clubShort: selectedClub.short,
    clubColor: selectedClub.color,
    clubStrength: selectedClub.strength,
    salary: getSalary(countryId, division),
    foot,
    archetype,
    difficulty,
    age,
    shirtNumber,
    skinTone,
    hairStyle,
  }), [name, position, origin, nationality, countryId, selectedCountry.name, division, selectedLeague.id, selectedLeague.name, selectedClub, foot, archetype, difficulty, age, shirtNumber, skinTone, hairStyle]);

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate(migrateCareer({
      ...preview,
      id: `slot-${slot + 1}-${hashText(`${name}:${Date.now()}`).toString(36)}`,
      name: name.trim() || "Alex Silva",
      matches: 0,
      recentResults: [],
    }));
  }

  return (
    <div className="creator-backdrop">
      <section className="creator-window" role="dialog" aria-modal="true" aria-labelledby="creator-title">
        <aside className="creator-preview">
          <button className="creator-close light" onClick={onClose} aria-label="Fechar criação">←</button>
          <Brand dark />
          <span className="overline">NOVO ATLETA · SLOT 0{slot + 1}</span>
          <div className="preview-stage">
            <div className="preview-spotlight" />
            <PlayerAvatar career={preview} large />
            <span className="preview-shirt">{shirtNumber}</span>
          </div>
          <div className="preview-name">
            <small>{position.toUpperCase()} · {foot.toUpperCase()}</small>
            <h2>{name.trim() || "NOVO TALENTO"}</h2>
            <span>{selectedCountry.flag} {selectedLeague.name} · OVR {getOverall(preview)}</span>
          </div>
          <div className="preview-club"><TeamCrest short={selectedClub.short} color={selectedClub.color} /><div><small>CLUBE INICIAL · FORÇA {selectedClub.strength}</small><strong>{selectedClub.name}</strong></div></div>
        </aside>

        <div className="creator-form-pane">
          <button className="creator-close" onClick={onClose} aria-label="Fechar criação">×</button>
          <span className="step-label">PERSONALIZAÇÃO COMPLETA</span>
          <h1 id="creator-title">Quem será você<br />dentro de campo?</h1>
          <form onSubmit={submit}>
            <div className="creator-section">
              <div className="creator-section-title"><span>01</span><div><strong>Identidade</strong><small>As bases da sua história</small></div></div>
              <label className="field-label">Nome do jogador<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Silva" maxLength={24} autoFocus /></label>
              <div className="field-grid three">
                <label className="field-label">Idade<input type="number" min="16" max="23" value={age} onChange={(event) => setAge(Number(event.target.value))} /></label>
                <label className="field-label">Nacionalidade<select value={nationality} onChange={(event) => setNationality(event.target.value)}>{COUNTRIES.map((country) => <option key={country.id}>{country.name}</option>)}<option>Colômbia</option><option>Uruguai</option></select></label>
                <label className="field-label">Número<input type="number" min="1" max="99" value={shirtNumber} onChange={(event) => setShirtNumber(Number(event.target.value))} /></label>
              </div>
            </div>

            <div className="creator-section">
              <div className="creator-section-title"><span>02</span><div><strong>Onde tudo começa</strong><small>País, divisão e história de origem</small></div></div>
              <div className="country-choice-grid">
                {COUNTRIES.map((country) => (
                  <button type="button" className={`country-choice ${countryId === country.id ? "is-active" : ""}`} onClick={() => setCountryId(country.id)} key={country.id}>
                    <span>{country.flag}</span><div><strong>{country.name}</strong><small>{country.style}</small></div>
                  </button>
                ))}
              </div>
              <div className="division-choice">
                <button type="button" className={division === 2 ? "is-active" : ""} onClick={() => setDivision(2)}><span>CAMINHO DA ASCENSÃO</span><strong>{selectedCountry.leagues[1].name}</strong><small>Suba construindo seu nome desde baixo</small></button>
                <button type="button" className={division === 1 ? "is-active" : ""} onClick={() => setDivision(1)}><span>DESAFIO DA ELITE</span><strong>{selectedCountry.leagues[0].name}</strong><small>Mais salário, pressão e risco de queda</small></button>
              </div>
              <div className="origin-choice-grid">
                {ORIGINS.map((item) => (
                  <button type="button" className={origin === item.id ? "is-active" : ""} onClick={() => setOrigin(item.id)} key={item.id}>
                    <strong>{item.id}</strong><small>{item.description}</small>
                  </button>
                ))}
              </div>
              <div className="starting-contract"><TeamCrest short={selectedClub.short} color={selectedClub.color} small /><div><small>CONTRATO INICIAL</small><strong>{selectedClub.name}</strong><span>{money(getSalary(countryId, division))}/mês · {selectedLeague.name}</span></div></div>
            </div>

            <div className="creator-section">
              <div className="creator-section-title"><span>03</span><div><strong>Perfil de jogo</strong><small>Define atributos e tipos de lance</small></div></div>
              <label className="field-label">Posição<select value={position} onChange={(event) => setPosition(event.target.value as Position)}><option>Atacante</option><option>Ponta</option><option>Meia</option><option>Lateral</option><option>Zagueiro</option></select></label>
              <div className="choice-row" aria-label="Pé dominante">
                <span>PÉ DOMINANTE</span>
                <div><OptionPill active={foot === "Direito"} onClick={() => setFoot("Direito")}>Direito</OptionPill><OptionPill active={foot === "Esquerdo"} onClick={() => setFoot("Esquerdo")}>Esquerdo</OptionPill></div>
              </div>
              <div className="archetype-grid">
                {(["Maestro", "Finalizador", "Velocista", "Operário", "Muralha"] as Archetype[]).map((item) => (
                  <button type="button" className={`archetype-card ${archetype === item ? "is-active" : ""}`} onClick={() => setArchetype(item)} key={item}>
                    <span>{item === "Maestro" ? "◎" : item === "Finalizador" ? "◉" : item === "Velocista" ? "↯" : item === "Operário" ? "◆" : "⬢"}</span>
                    <strong>{item}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="creator-section appearance-section">
              <div className="creator-section-title"><span>04</span><div><strong>Aparência e desafio</strong><small>Visual do avatar e ritmo da carreira</small></div></div>
              <div className="appearance-row">
                <label>PELE<div className="swatches">{["#f2c5a0", "#d89a70", "#b97850", "#75442f", "#4a2a22"].map((tone) => <button type="button" aria-label={`Tom de pele ${tone}`} className={skinTone === tone ? "is-active" : ""} style={{ background: tone }} onClick={() => setSkinTone(tone)} key={tone} />)}</div></label>
                <label>CABELO<select value={hairStyle} onChange={(event) => setHairStyle(event.target.value)}><option>Curto</option><option>Raspado</option><option>Cacheado</option><option>Tranças</option></select></label>
              </div>
              <div className="difficulty-row">
                {(["Promessa", "Profissional", "Lenda"] as Difficulty[]).map((item) => <OptionPill active={difficulty === item} onClick={() => setDifficulty(item)} key={item}>{item}</OptionPill>)}
              </div>
            </div>

            <button className="create-career-button" type="submit"><span>INICIAR CARREIRA</span><b>Entrar na {selectedLeague.name} →</b></button>
          </form>
        </div>
      </section>
    </div>
  );
}

const navItems: Array<{ view: AppView; icon: string; label: string }> = [
  { view: "dashboard", icon: "⌂", label: "Central" },
  { view: "season", icon: "▦", label: "Temporada" },
  { view: "player", icon: "◎", label: "Atleta" },
  { view: "life", icon: "◇", label: "Vida" },
  { view: "market", icon: "↗", label: "Mercado" },
  { view: "settings", icon: "⚙", label: "Ajustes" },
];

function AppSidebar({ career, view, onNavigate, onLobby }: { career: CareerState; view: AppView; onNavigate: (view: AppView) => void; onLobby: () => void }) {
  const rounds = getLeagueDefinition(career.countryId, career.division).format.rounds;
  return (
    <aside className="app-sidebar">
      <Brand dark />
      <nav aria-label="Navegação da carreira">
        {navItems.map((item) => <button className={view === item.view ? "is-active" : ""} onClick={() => onNavigate(item.view)} key={item.view}><span>{item.icon}</span><b>{item.label}</b></button>)}
      </nav>
      <div className="sidebar-season"><small>{career.countryName.toUpperCase()} · DIVISÃO {career.division}</small><strong>{career.season}</strong><span>Rodada {career.seasonRound} de {rounds}</span><div><i style={{ width: `${career.seasonRound / rounds * 100}%` }} /></div></div>
      <button className="exit-career" onClick={onLobby}>← <span>Trocar carreira</span></button>
    </aside>
  );
}

function AppTopbar({ career, onLobby }: { career: CareerState; onLobby: () => void }) {
  return (
    <header className="app-topbar">
      <button className="mobile-brand" onClick={onLobby}><span>L</span></button>
      <div className="topbar-context"><small>{career.leagueName.toUpperCase()} · {career.countryName.toUpperCase()}</small><strong>Central de carreira</strong></div>
      <div className="topbar-stats">
        <div><small>VALOR</small><strong>{money(career.marketValue)}</strong></div>
        <div><small>FÃS</small><strong>{compactNumber(career.fans)}</strong></div>
        <div className="topbar-profile"><span>{initials(career.name)}</span><div><strong>{career.name}</strong><small>{career.clubName}</small></div></div>
      </div>
    </header>
  );
}

function CareerLayout({
  career,
  view,
  onNavigate,
  onLobby,
  children,
}: {
  career: CareerState;
  view: AppView;
  onNavigate: (view: AppView) => void;
  onLobby: () => void;
  children: ReactNode;
}) {
  return (
    <div className="career-app">
      <AppSidebar career={career} view={view} onNavigate={onNavigate} onLobby={onLobby} />
      <div className="career-main">
        <AppTopbar career={career} onLobby={onLobby} />
        {children}
      </div>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navItems.map((item) => <button className={view === item.view ? "is-active" : ""} onClick={() => onNavigate(item.view)} key={item.view}><span>{item.icon}</span><b>{item.label}</b></button>)}
      </nav>
    </div>
  );
}

const trainingOptions: Array<{ id: TrainingKind; icon: string; title: string; text: string; effect: string }> = [
  { id: "recovery", icon: "◇", title: "Recuperação", text: "Fisioterapia e sono controlado.", effect: "+10 energia" },
  { id: "technique", icon: "◎", title: "Fundamentos", text: "Treino específico da sua posição.", effect: "+1 atributo" },
  { id: "intensity", icon: "↯", title: "Alta intensidade", text: "Ritmo forte antes da rodada.", effect: "+3 forma" },
  { id: "tactics", icon: "▦", title: "Treino tático", text: "Leitura do rival e posicionamento.", effect: "+confiança" },
  { id: "setpieces", icon: "◒", title: "Bola parada", text: "Faltas, pênaltis e escanteios.", effect: "+1 técnica" },
  { id: "language", icon: "文", title: "Aula de idioma", text: "Comunicação e adaptação ao país.", effect: "+8 idioma" },
  { id: "media", icon: "◌", title: "Ação com fãs", text: "Imprensa, torcida e patrocinadores.", effect: "+350 fãs" },
];

function gameDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${isoDate}T12:00:00Z`)).replace(".", "");
}

function MiniTable({ career, limit = 5 }: { career: CareerState; limit?: number }) {
  const rows = useMemo(() => generateStandings(career).slice(0, limit), [career, limit]);
  return (
    <div className="mini-table">
      <div className="table-head"><span>#</span><span>CLUBE</span><span>J</span><span>SG</span><span>PTS</span></div>
      {rows.map((row) => (
        <div className={`table-row ${row.isPlayerTeam ? "is-player" : ""}`} key={row.team.id}>
          <span>{String(row.position).padStart(2, "0")}</span>
          <span><TeamCrest short={row.team.short} color={row.team.color} small /><b>{row.team.name}</b></span>
          <span>{row.played}</span><span>{row.goalDifference > 0 ? "+" : ""}{row.goalDifference}</span><strong>{row.points}</strong>
        </div>
      ))}
    </div>
  );
}

function Dashboard({
  career,
  fixture,
  onPlay,
  onTrain,
  onNavigate,
}: {
  career: CareerState;
  fixture: Fixture;
  onPlay: () => void;
  onTrain: (kind: TrainingKind) => void;
  onNavigate: (view: AppView) => void;
}) {
  const standings = useMemo(() => generateStandings(career), [career]);
  const position = standings.find((row) => row.isPlayerTeam)?.position ?? 1;
  const news = useMemo(() => buildCareerNews(career, fixture), [career, fixture]);
  const opponentStar = fixture.opponent.stars[fixture.seed % fixture.opponent.stars.length];
  const preparationSlots = useMemo(() => Array.from({ length: career.preparationActionsAllowed }, (_, index) => ({
    date: addDaysToDate(career.currentDate, Math.min(career.daysUntilMatch - 1, index * 2 + 1)),
    action: career.preparationLog[index],
  })), [career.currentDate, career.daysUntilMatch, career.preparationActionsAllowed, career.preparationLog]);
  const preparationComplete = career.preparationActionsUsed >= career.preparationActionsAllowed;

  return (
    <main className="career-content dashboard-view">
      <section className="welcome-row">
        <div><span className="overline">SEMANA {career.seasonRound} · {career.daysUntilMatch} DIAS ATÉ O JOGO</span><h1>Boa noite, {career.name.split(" ")[0]}.</h1><p>{fixture.pressure}. Você tem {career.preparationActionsAllowed} {career.preparationActionsAllowed === 1 ? "ação" : "ações"} disponíveis antes de enfrentar o {fixture.opponent.name}.</p></div>
        <div className="condition-chip"><span className={career.energy > 70 ? "good" : "warn"} /><div><small>STATUS DO ATLETA</small><strong>{career.energy > 78 ? "Pronto para jogar" : career.energy > 60 ? "Atenção à fadiga" : "Recuperação indicada"}</strong></div></div>
      </section>

      <section className="matchday-hero">
        <div className="matchday-atmosphere" style={{ "--away": fixture.opponent.color } as React.CSSProperties} />
        <div className="matchday-copy">
          <span className="match-label">{fixture.competition.toUpperCase()} · RODADA {fixture.round}</span>
          <h2>O próximo capítulo<br />começa agora.</h2>
          <div className="match-context">
            <span><small>LOCAL</small>{fixture.home ? "Em casa" : fixture.venue}</span>
            <span><small>CLIMA</small>{fixture.weather}</span>
            <span><small>PRESSÃO</small>{fixture.pressure}</span>
          </div>
          <button className="play-match-button" onClick={onPlay}><span>▶</span><div><small>INICIAR</small><strong>JOGAR PARTIDA</strong></div><b>→</b></button>
        </div>
        <div className="matchday-fixture">
          <div><TeamCrest short={career.clubShort} color={career.clubColor} /><strong>{career.clubName}</strong><small>{fixture.home ? "MANDANTE" : "VISITANTE"}</small></div>
          <span className="fixture-vs"><b>VS</b><small>{fixture.venue}</small></span>
          <div><TeamCrest short={fixture.opponent.short} color={fixture.opponent.color} /><strong>{fixture.opponent.name}</strong><small>FORÇA {fixture.opponent.strength}</small></div>
          <div className="star-watch"><span>JOGADOR A OBSERVAR</span><strong>{opponentStar}</strong></div>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="hud-card weekly-card">
          <div className="card-heading"><div><span className="overline">CALENDÁRIO DE PREPARAÇÃO</span><h3>Uma ação a cada dois dias</h3></div><span className={`status-tag ${preparationComplete ? "done" : ""}`}>{career.preparationActionsUsed}/{career.preparationActionsAllowed} realizadas</span></div>
          <div className="preparation-calendar">
            <div className="calendar-day is-today"><span>HOJE</span><strong>{gameDate(career.currentDate)}</strong><small>Início</small></div>
            {preparationSlots.map((slot, index) => <div className={`calendar-day ${slot.action ? "is-filled" : ""}`} key={`${slot.date}-${index}`}><span>AÇÃO {index + 1}</span><strong>{gameDate(slot.date)}</strong><small>{slot.action ?? "Livre"}</small></div>)}
            <div className="calendar-day is-match"><span>PARTIDA</span><strong>{gameDate(career.nextMatchDate)}</strong><small>vs {fixture.opponent.short}</small></div>
          </div>
          <div className="training-grid">
            {trainingOptions.map((option) => (
              <button className={`training-option ${career.preparationLog.includes(option.title) ? "is-selected" : ""}`} disabled={preparationComplete} onClick={() => onTrain(option.id)} key={option.id}>
                <span>{option.icon}</span><div><strong>{option.title}</strong><small>{option.text}</small></div><b>{career.preparationLog.includes(option.title) ? "✓" : option.effect}</b>
              </button>
            ))}
          </div>
        </article>

        <article className="hud-card player-hud-card">
          <div className="player-hud-top">
            <PlayerAvatar career={career} />
            <div><span className="overline">SEU ATLETA</span><h3>{career.name}</h3><p>{career.position} · Camisa {career.shirtNumber}</p></div>
            <div className="overall-badge"><small>OVR</small><strong>{getOverall(career)}</strong></div>
          </div>
          <div className="player-vitals">
            <div><span>ENERGIA <b>{career.energy}%</b></span><i><em style={{ width: `${career.energy}%` }} /></i></div>
            <div><span>MORAL <b>{career.morale}%</b></span><i><em style={{ width: `${career.morale}%` }} /></i></div>
          </div>
          <div className="season-numbers">
            <div><strong>{career.goals}</strong><span>GOLS</span></div><div><strong>{career.assists}</strong><span>ASSIST.</span></div><div><strong>{career.rating.toFixed(1)}</strong><span>NOTA</span></div><div><strong>{career.reputation}</strong><span>REP.</span></div>
          </div>
          <button className="text-link" onClick={() => onNavigate("player")}>ABRIR PERFIL COMPLETO →</button>
        </article>

        <article className="hud-card table-card">
          <div className="card-heading"><div><span className="overline">{career.leagueName.toUpperCase()}</span><h3>Classificação</h3></div><div className="position-badge"><small>POSIÇÃO</small><strong>{position}º</strong></div></div>
          <MiniTable career={career} />
          <button className="text-link" onClick={() => onNavigate("season")}>VER TABELA COMPLETA →</button>
        </article>

        <article className="hud-card news-card">
          <div className="card-heading"><div><span className="overline">MUNDO EM MOVIMENTO</span><h3>Central de notícias</h3></div><span className="live-pulse"><i /> AO VIVO</span></div>
          <div className="news-feed">
            {news.map((item) => <div className="news-row" key={item.id}><span className={`news-icon ${item.category}`}>{item.category === "mercado" ? "↗" : item.category === "liga" ? "▦" : "L"}</span><div><small>{item.category.toUpperCase()} {item.isNew && "· NOVO"}</small><strong>{item.title}</strong><p>{item.text}</p></div></div>)}
          </div>
        </article>
      </section>

      <section className="season-ribbon">
        <div><span className="overline">FORMA RECENTE</span><div className="form-dots">{(career.recentResults.length ? career.recentResults : ["E", "V", "D", "V", "E"]).slice(0, 5).map((result, index) => <span className={resultClass(result)} key={`${result}-${index}`}>{result[0]}</span>)}</div></div>
        <div><span>CONTRATO</span><strong>{career.contractMatches} jogos restantes</strong></div>
        <div><span>SALÁRIO MENSAL</span><strong>{money(career.salary)}</strong></div>
        <div><span>PAÍS · DIVISÃO</span><strong>{career.countryName} · D{career.division}</strong></div>
      </section>
    </main>
  );
}

function SeasonView({ career }: { career: CareerState }) {
  const rows = useMemo(() => generateStandings(career), [career]);
  const clubLeaders = useMemo(() => getClubLeaders(career), [career]);
  const league = getLeagueDefinition(career.countryId, career.division);
  const format = league.format;
  const titleRace = career.division === 1;
  const promotionPlaces = format.directPromotion + format.playoffPromotion;
  const dangerPlaces = format.directRelegation + format.relegationPlayoff;
  const dangerStartsAt = dangerPlaces ? format.teamCount - dangerPlaces + 1 : Number.POSITIVE_INFINITY;
  const scorers = career.leagueLeaders.slice().sort((a, b) => b.goals - a.goals || b.overall - a.overall);
  const assisters = career.leagueLeaders.slice().sort((a, b) => b.assists - a.assists || b.overall - a.overall);
  const careerPlayerId = `career-player-${career.id}`;
  const goalRank = Math.max(1, scorers.findIndex((player) => player.id === careerPlayerId) + 1);
  const assistRank = Math.max(1, assisters.findIndex((player) => player.id === careerPlayerId) + 1);
  return (
    <main className="career-content inner-view">
      <section className="view-heading"><div><span className="overline">{career.countryName.toUpperCase()} · TEMPORADA {career.season}</span><h1>{titleRace ? "A corrida pelo título." : "A corrida pelo acesso."}</h1><p>{career.leagueName}: {format.note}. Cada rodada simula {format.matchesPerRound} partidas e atualiza todos os atletas.</p></div><div className="season-progress-ring"><strong>{career.seasonRound}</strong><span>DE {format.rounds}<br />RODADAS</span></div></section>
      <section className="season-layout">
        <article className="hud-card full-table-card">
          <div className="card-heading"><div><span className="overline">CLASSIFICAÇÃO OFICIAL</span><h3>{career.leagueName}</h3></div><div className="legend">{!titleRace && promotionPlaces > 0 && <span><i className="promotion" /> Acesso/Playoff</span>}{dangerPlaces > 0 && <span><i className="danger" /> Queda/Repescagem</span>}</div></div>
          <div className="standings-table">
            <div className="standings-head"><span>POS</span><span>CLUBE</span><span>J</span><span>V</span><span>E</span><span>D</span><span>GP</span><span>GC</span><span>SG</span><span>FORMA</span><span>PTS</span></div>
            {rows.map((row) => <div className={`standings-row ${!titleRace && row.position <= promotionPlaces ? "promotion-row" : ""} ${row.position >= dangerStartsAt ? "danger-row" : ""} ${row.isPlayerTeam ? "player-row" : ""}`} key={row.team.id}>
              <span>{String(row.position).padStart(2, "0")}</span>
              <span><TeamCrest short={row.team.short} color={row.team.color} small /><b>{row.team.name}</b>{row.isPlayerTeam && <em>VOCÊ</em>}</span>
              <span>{row.played}</span><span>{row.wins}</span><span>{row.draws}</span><span>{row.losses}</span><span>{row.goalsFor}</span><span>{row.goalsAgainst}</span><span>{row.goalDifference > 0 ? "+" : ""}{row.goalDifference}</span>
              <span className="row-form">{(row.form.length ? row.form : ["–", "–", "–"]).map((form, index) => <i className={resultClass(form)} key={`${form}-${index}`}>{form}</i>)}</span>
              <strong>{row.points}</strong>
            </div>)}
          </div>
        </article>
        <aside className="season-side">
          <article className="hud-card cup-card"><span className="cup-glyph">◇</span><span className="overline">COPA {career.countryName.toUpperCase()}</span><h3>{career.cupStage}</h3><p>Clubes das duas divisões se enfrentam durante a temporada.</p><div className="cup-bracket"><span className="is-done">1ª fase</span><i /><span>{career.cupStage}</span><i /><span>Final</span></div></article>
          <article className="hud-card movement-card"><span className="overline">FORMATO DA LIGA</span><h3>{format.structure.replaceAll("-", " ")}</h3><p>{format.note}. {dangerPlaces ? `${format.directRelegation} queda(s) direta(s) e ${format.relegationPlayoff} repescagem(ns).` : "Esta competição não aplica rebaixamento."}</p><div className="movement-stats"><span><b>{career.promotions}</b> acessos</span><span><b>{career.relegations}</b> quedas</span></div></article>
          <article className="hud-card leaders-card"><div className="card-heading"><div><span className="overline">SEU DESEMPENHO</span><h3>Números na liga</h3></div></div><div className="leader-stat"><span>Gols</span><strong>{career.goals}</strong><small>{goalRank}º na artilharia</small></div><div className="leader-stat"><span>Assistências</span><strong>{career.assists}</strong><small>{assistRank}º no ranking</small></div><div className="leader-stat"><span>Nota média</span><strong>{career.rating.toFixed(1)}</strong><small>{career.rating >= 7.5 ? "Elite da competição" : "Em evolução"}</small></div></article>
        </aside>
      </section>
      {career.lastRoundResults.length > 0 && <section className="hud-card round-results-card"><div className="card-heading"><div><span className="overline">RODADA COMPLETA</span><h3>{career.lastRoundResults.length} partidas simuladas</h3></div><span className="status-tag done">RODADA {Math.max(1, career.seasonRound - 1)}</span></div><div className="round-score-grid">{career.lastRoundResults.map((result) => <div key={`${result.homeId}-${result.awayId}`}><span>{result.homeName}</span><strong>{result.homeGoals}–{result.awayGoals}</strong><span>{result.awayName}</span></div>)}</div></section>}
      <section className="hud-card club-leaders-card">
        <div className="card-heading"><div><span className="overline">PAINEL DE DESTAQUES</span><h3>Líderes de cada clube</h3></div><span className="status-tag">{league.teams.length * 11} titulares</span></div>
        <div className="club-leaders-head"><span>CLUBE</span><span>ARTILHEIRO</span><span>GARÇOM</span></div>
        <div className="club-leaders-list">{clubLeaders.map(({ team, scorer, assister }) => <div className="club-leader-row" key={team.id}><span><TeamCrest short={team.short} color={team.color} small /><b>{team.name}</b></span><span><b>{scorer?.name ?? "—"}</b><em>{scorer?.goals ?? 0} gols</em></span><span><b>{assister?.name ?? "—"}</b><em>{assister?.assists ?? 0} assist.</em></span></div>)}</div>
      </section>
    </main>
  );
}

const attributeLabels: Array<[keyof CareerState["attributes"], string]> = [
  ["pace", "Velocidade"],
  ["shooting", "Finalização"],
  ["passing", "Passe"],
  ["dribbling", "Drible"],
  ["defending", "Marcação"],
  ["physical", "Físico"],
];

function PlayerView({ career }: { career: CareerState }) {
  return (
    <main className="career-content inner-view">
      <section className="player-profile-hero">
        <div className="profile-back-number">{career.shirtNumber}</div>
        <PlayerAvatar career={career} large />
        <div className="profile-copy"><span className="overline">{career.clubName.toUpperCase()} · {career.nationality.toUpperCase()}</span><h1>{career.name}</h1><p>{career.position} · {career.foot} · {career.archetype} · {career.age} anos</p><div className="profile-tags"><span>CAMISA {career.shirtNumber}</span><span>NÍVEL {career.level}</span><span>{career.origin.toUpperCase()}</span></div></div>
        <div className="profile-overall"><span>OVERALL</span><strong>{getOverall(career)}</strong><small>Potencial {Math.min(94, getOverall(career) + 16)}</small></div>
      </section>
      <section className="player-profile-grid">
        <article className="hud-card attributes-card">
          <div className="card-heading"><div><span className="overline">DESENVOLVIMENTO</span><h3>Atributos técnicos</h3></div><span className="xp-chip">{career.xp}/100 XP</span></div>
          <div className="attribute-list">{attributeLabels.map(([key, label]) => <div className="attribute-row" key={key}><span>{label}</span><i><em style={{ width: `${career.attributes[key]}%` }} /></i><strong>{career.attributes[key]}</strong></div>)}</div>
          <div className="xp-progress"><div><span>PRÓXIMO NÍVEL</span><strong>{100 - career.xp} XP restantes</strong></div><i><em style={{ width: `${career.xp}%` }} /></i></div>
        </article>
        <article className="hud-card career-bio-card"><div className="card-heading"><div><span className="overline">IDENTIDADE</span><h3>Perfil de carreira</h3></div></div><dl><div><dt>Pé dominante</dt><dd>{career.foot}</dd></div><div><dt>Arquétipo</dt><dd>{career.archetype}</dd></div><div><dt>Dificuldade</dt><dd>{career.difficulty}</dd></div><div><dt>Origem</dt><dd>{career.origin}</dd></div><div><dt>Reputação</dt><dd>{career.reputation}/100</dd></div><div><dt>Troféus</dt><dd>{career.trophies.length || "—"}</dd></div></dl></article>
        <article className="hud-card records-card"><div className="card-heading"><div><span className="overline">HISTÓRICO</span><h3>Recordes pessoais</h3></div></div><div className="record-grid"><div><span>PARTIDAS</span><strong>{career.matches}</strong></div><div><span>GOLS</span><strong>{career.goals}</strong></div><div><span>ASSISTÊNCIAS</span><strong>{career.assists}</strong></div><div><span>FÃS</span><strong>{compactNumber(career.fans)}</strong></div></div></article>
      </section>
    </main>
  );
}

const lifeEventContent: Record<string, { title: string; text: string; choices: Array<{ id: string; label: string; hint: string }> }> = {
  "primeira-entrevista": {
    title: "A primeira grande entrevista",
    text: "A imprensa pergunta se você já é o melhor jogador do elenco. Sua resposta será lembrada pelo treinador e pelos rivais.",
    choices: [
      { id: "event-humble", label: "Dividir os méritos", hint: "+elenco · +disciplina" },
      { id: "event-bold", label: "Assumir o protagonismo", hint: "+seguidores · cria rivalidade" },
    ],
  },
  "convite-festa": {
    title: "Festa antes do treino",
    text: "Companheiros convidam você para uma festa que deve terminar tarde. O próximo treino será observado pela comissão.",
    choices: [
      { id: "event-party", label: "Ir para a festa", hint: "+moral · risco disciplinar" },
      { id: "event-skip-party", label: "Ficar em casa", hint: "+confiança · -relação com elenco" },
    ],
  },
  "rival-provocou": {
    title: "Rivalidade nas redes",
    text: "Um adversário responde à sua entrevista e desafia você publicamente para o próximo confronto.",
    choices: [
      { id: "event-reply-rival", label: "Responder", hint: "+alcance · +pressão" },
      { id: "event-ignore-rival", label: "Ignorar", hint: "+disciplina · encerra conflito" },
    ],
  },
  "familia-distante": {
    title: "A família sente sua ausência",
    text: "A rotina internacional diminuiu o contato com quem acompanhou seu começo. Uma visita exige tempo e dinheiro.",
    choices: [
      { id: "event-visit-family", label: "Viajar para visitar", hint: "-R$ 8 mil · +família" },
      { id: "event-focus-career", label: "Focar na carreira", hint: "+forma · -família" },
    ],
  },
  "decisao-medica": {
    title: "Dor muscular persistente",
    text: "O departamento médico oferece repouso completo ou tratamento acelerado para você continuar jogando.",
    choices: [
      { id: "event-rest", label: "Respeitar o repouso", hint: "+saúde · -energia competitiva" },
      { id: "event-injection", label: "Tratamento acelerado", hint: "joga agora · risco futuro" },
    ],
  },
  "proposta-publicitaria": {
    title: "Campanha publicitária",
    text: "Uma marca fictícia quer associar seu nome a uma campanha nacional. O contrato paga bem, mas exige exposição.",
    choices: [
      { id: "event-sign-sponsor", label: "Assinar contrato", hint: "+dinheiro · +seguidores" },
      { id: "event-refuse-sponsor", label: "Preservar a imagem", hint: "+reputação social" },
    ],
  },
};

function LifeView({ career, onAction }: { career: CareerState; onAction: (action: string) => void }) {
  const event = lifeEventContent[career.pendingLifeEvent];
  const netWorth = career.bankBalance + career.investments + career.retirementFund - career.debt;
  return (
    <main className="career-content inner-view">
      <section className="view-heading"><div><span className="overline">VIDA E LEGADO · 0.3.3</span><h1>O jogador termina. O legado fica.</h1><p>Administre dinheiro, saúde, relações e a imagem que acompanhará sua carreira depois do último jogo.</p></div><div className="market-value-block"><small>PATRIMÔNIO LÍQUIDO</small><strong>{money(netWorth)}</strong><span>Aposentadoria: {money(career.retirementFund)}</span></div></section>

      {event && <section className="life-story-event"><span className="overline">EVENTO ENCADEADO</span><h2>{event.title}</h2><p>{event.text}</p><div>{event.choices.map((choice) => <button onClick={() => onAction(choice.id)} key={choice.id}><strong>{choice.label}</strong><small>{choice.hint}</small></button>)}</div></section>}

      <section className="life-dashboard-grid">
        <article className="hud-card life-module finance-module"><div className="card-heading"><div><span className="overline">PLANEJAMENTO FINANCEIRO</span><h3>Dinheiro e futuro</h3></div><span className="status-tag">{money(career.monthlyExpenses)}/mês</span></div><div className="life-metric-grid"><div><span>SALDO</span><strong>{money(career.bankBalance)}</strong></div><div><span>INVESTIDO</span><strong>{money(career.investments)}</strong></div><div><span>DÍVIDA</span><strong>{money(career.debt)}</strong></div><div><span>APOSENTADORIA</span><strong>{money(career.retirementFund)}</strong></div></div><div className="life-action-list"><button disabled={career.bankBalance < 50_000} onClick={() => onAction("invest")}><span>Investir R$ 50 mil</span><small>Cria patrimônio de longo prazo</small></button><button disabled={career.bankBalance < 25_000} onClick={() => onAction("retirement")}><span>Guardar R$ 25 mil</span><small>Fundo para depois dos gramados</small></button><button disabled={!career.debt || career.bankBalance < 20_000} onClick={() => onAction("pay-debt")}><span>Amortizar dívida</span><small>Até R$ 20 mil</small></button></div></article>

        <article className="hud-card life-module lifestyle-module"><div className="card-heading"><div><span className="overline">ESTILO DE VIDA</span><h3>Casa, carro e rotina</h3></div></div><dl><div><dt>Moradia</dt><dd>{career.housing}</dd></div><div><dt>Carro</dt><dd>{career.car}</dd></div><div><dt>Alimentação</dt><dd>{career.foodPlan}</dd></div><div><dt>Treino particular</dt><dd>{career.privateTraining}</dd></div></dl><div className="life-action-list"><button disabled={career.bankBalance < 120_000 || career.car !== "Transporte do clube"} onClick={() => onAction("buy-car")}><span>Comprar carro</span><small>R$ 120 mil · +despesas</small></button><button disabled={career.foodPlan === "Nutricionista particular"} onClick={() => onAction("food-plan")}><span>Contratar nutricionista</span><small>Menos risco de lesão</small></button><button disabled={career.bankBalance < 35_000 || career.privateTraining !== "Nenhum"} onClick={() => onAction("private-training")}><span>Treinador particular</span><small>R$ 35 mil · evolução técnica</small></button><button onClick={() => onAction("leisure")}><span>Dia de lazer</span><small>R$ 2 mil · moral e família</small></button></div></article>

        <article className="hud-card life-module public-life-module"><div className="card-heading"><div><span className="overline">IMAGEM PÚBLICA</span><h3>Patrocínios e redes</h3></div><span className="status-tag done">{compactNumber(career.socialFollowers)} seguidores</span></div><div className="social-score"><strong>{career.socialReputation}</strong><span>REPUTAÇÃO SOCIAL</span><i><em style={{ width: `${career.socialReputation}%` }} /></i></div><p>Contrato atual: <b>{career.sponsorship}</b></p><div className="life-action-list"><button onClick={() => onAction("social-post")}><span>Publicar nas redes</span><small>Seguidores com risco de polêmica</small></button><button onClick={() => onAction("interview")}><span>Dar entrevista</span><small>Constrói sua narrativa pública</small></button><button disabled={career.reputation < 25 || career.sponsorship !== "Sem patrocinador"} onClick={() => onAction("sponsor")}><span>Buscar patrocinador</span><small>Exige reputação 25</small></button><button disabled={career.socialProject !== "Nenhum" || career.bankBalance < 40_000} onClick={() => onAction("social-project")}><span>Ajudar o clube de origem</span><small>Projeto social de R$ 40 mil</small></button></div></article>

        <article className="hud-card life-module relations-module"><div className="card-heading"><div><span className="overline">RELAÇÕES</span><h3>Família, amor e elenco</h3></div></div><div className="relation-cards"><div><span>AMOR</span><strong>{career.relationshipStatus}</strong><small>{career.partnerName || "Sem relacionamento"}</small></div><div><span>FILHOS</span><strong>{career.children}</strong><small>Vínculo familiar {career.familyBond}%</small></div><div><span>ELENCO</span><strong>{career.squadRelations}%</strong><small>Disciplina {career.discipline}%</small></div></div><div className="life-action-list"><button disabled={career.relationshipStatus !== "Solteiro"} onClick={() => onAction("meet-partner")}><span>Conhecer alguém</span><small>Inicia uma nova história</small></button><button disabled={career.relationshipStatus !== "Namorando"} onClick={() => onAction("marry")}><span>Pedir em casamento</span><small>Compromisso e estabilidade</small></button><button disabled={career.relationshipStatus !== "Casado"} onClick={() => onAction("child")}><span>Planejar um filho</span><small>Novas despesas e novo legado</small></button><button onClick={() => onAction("family-time")}><span>Tempo com a família</span><small>Recupera vínculos</small></button><button onClick={() => onAction("squad-dinner")}><span>Jantar com o elenco</span><small>Melhora relações internas</small></button></div></article>

        <article className="hud-card life-module health-module"><div className="card-heading"><div><span className="overline">SAÚDE E DISCIPLINA</span><h3>{career.injuryStatus}</h3></div><span className={`status-tag ${career.injuryRisk < 25 ? "done" : ""}`}>RISCO {career.injuryRisk}%</span></div><div className="life-bars"><div><span>Energia<b>{career.energy}%</b></span><i><em style={{ width: `${career.energy}%` }} /></i></div><div><span>Disciplina<b>{career.discipline}%</b></span><i><em style={{ width: `${career.discipline}%` }} /></i></div></div><div className="life-action-list"><button disabled={career.injuryStatus === "Apto"} onClick={() => onAction("treatment")}><span>Tratamento particular</span><small>R$ 18 mil · acelera recuperação</small></button><button onClick={() => onAction("rest-day")}><span>Descanso completo</span><small>Energia e prevenção</small></button></div></article>

        <article className="hud-card life-module legacy-module"><div className="card-heading"><div><span className="overline">LEGADO</span><h3>Depois dos gramados</h3></div></div><div className="legacy-columns"><div><span>PRÊMIOS</span>{career.individualAwards.length ? career.individualAwards.map((award) => <b key={award}>{award}</b>) : <small>Nenhum prêmio ainda</small>}</div><div><span>RECORDES</span>{career.historicalRecords.length ? career.historicalRecords.map((record) => <b key={record}>{record}</b>) : <small>Seu primeiro recorde ainda será escrito</small>}</div></div><p>Caminho futuro: <b>{career.futurePath}</b></p><div className="housing-actions"><button className={career.futurePath === "Treinador" ? "is-active" : ""} onClick={() => onAction("future-coach")}>Planejar carreira de treinador</button><button className={career.futurePath === "Empresário" ? "is-active" : ""} onClick={() => onAction("future-agent")}>Planejar carreira de empresário</button></div></article>
      </section>
      {career.lifeEventHistory.length > 0 && <section className="hud-card life-history"><div className="card-heading"><div><span className="overline">LINHA DO TEMPO</span><h3>Decisões que moldaram sua história</h3></div></div>{career.lifeEventHistory.slice(0, 8).map((item, index) => <p key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{item}</p>)}</section>}
    </main>
  );
}

function MarketView({
  career,
  onTransfer,
  onHousing,
}: {
  career: CareerState;
  onTransfer: (team: Team) => void;
  onHousing: (housing: "Clube" | "Apartamento" | "Casa") => void;
}) {
  const offset = (career.careerSeed + career.matches) % WORLD_TEAMS.length;
  const offers = [0, 1, 2].map((index) => WORLD_TEAMS[(offset + index * 17) % WORLD_TEAMS.length]);
  const country = getCountry(career.countryId);
  const housingOptions = [
    { id: "Clube" as const, label: "Hotel do clube", deposit: 0 },
    { id: "Apartamento" as const, label: "Apartamento", deposit: country.costOfLiving * 2 },
    { id: "Casa" as const, label: "Casa própria", deposit: country.costOfLiving * 5 },
  ];
  return (
    <main className="career-content inner-view">
      <section className="view-heading"><div><span className="overline">CENTRAL DE MERCADO</span><h1>Seu nome começa a circular.</h1><p>Desempenho, reputação e decisões fora de campo determinam quem acompanha sua carreira.</p></div><div className="market-value-block"><small>VALOR ESTIMADO</small><strong>{money(career.marketValue)}</strong><span>Reputação {career.reputation}/100</span></div></section>
      <section className="market-grid">
        <article className="hud-card contract-card"><span className="overline">CONTRATO ATUAL</span><div className="contract-club"><TeamCrest short={career.clubShort} color={career.clubColor} /><div><h3>{career.clubName}</h3><p>{career.leagueName} · Divisão {career.division}</p></div></div><div className="contract-details"><div><span>DURAÇÃO</span><strong>{career.contractMatches} jogos</strong></div><div><span>SALÁRIO</span><strong>{money(career.salary)}/mês</strong></div><div><span>PAPEL</span><strong>{career.rating >= 7.4 ? "Titular" : "Rotação"}</strong></div></div><div className="contract-progress"><span>Confiança do treinador <b>{career.coachTrust}%</b></span><i><em style={{ width: `${career.coachTrust}%` }} /></i></div></article>
        <article className="hud-card scouts-card">
          <div className="card-heading"><div><span className="overline">OBSERVADORES</span><h3>Clubes interessados</h3></div><span className="status-tag">{offers.length} relatórios</span></div>
          <div className="offer-list">
            {offers.map((team, index) => {
              const required = 18 + index * 14;
              const unlocked = career.reputation >= required;
              return (
                <div className={`offer-row ${unlocked ? "is-unlocked" : ""}`} key={team.id}>
                  <TeamCrest short={team.short} color={team.color} />
                  <div><strong>{unlocked ? team.name : "Clube estrangeiro"}</strong><span>{team.country} · {getLeagueDefinition(team.countryId, team.division).name}</span></div>
                  <div><small>INTERESSE</small><b>{unlocked ? `${Math.min(94, career.reputation + 36 - index * 8)}%` : `REP. ${required}`}</b></div>
                  <button disabled={!unlocked || team.id === career.clubId} onClick={() => onTransfer(team)}>{team.id === career.clubId ? "ATUAL" : unlocked ? "ACEITAR" : "BLOQUEADO"}</button>
                </div>
              );
            })}
          </div>
        </article>
        <article className="hud-card life-card">
          <div className="card-heading"><div><span className="overline">VIDA FORA DO CAMPO</span><h3>Adaptação em {career.countryName}</h3></div><span className="status-tag done">{career.language}</span></div>
          <div className="life-grid">
            <div className="life-stat"><span>SALDO</span><strong>{money(career.bankBalance)}</strong></div>
            <div className="life-stat"><span>CUSTO MENSAL</span><strong>{money(career.monthlyExpenses)}</strong></div>
            <div className="life-stat"><span>MORADIA</span><strong>{career.housing}</strong></div>
            <div className="life-stat"><span>IDIOMA</span><strong>{career.languageLevel}%</strong></div>
            <div className="life-stat"><span>ADAPTAÇÃO</span><strong>{career.adaptation}%</strong></div>
          </div>
          <div className="life-bars">
            <div><span>Fluência em {career.language}<b>{career.languageLevel}%</b></span><i><em style={{ width: `${career.languageLevel}%` }} /></i></div>
            <div><span>Vida no país<b>{career.adaptation}%</b></span><i><em style={{ width: `${career.adaptation}%` }} /></i></div>
          </div>
          <div className="housing-actions">
            {housingOptions.map((option) => <button className={career.housing === option.label ? "is-active" : ""} disabled={career.bankBalance < option.deposit} onClick={() => onHousing(option.id)} key={option.id}>{option.label} · {option.deposit ? money(option.deposit) : "grátis"}</button>)}
          </div>
        </article>
        <article className="hud-card agent-card"><span className="agent-avatar">RA</span><div><span className="overline">SEU EMPRESÁRIO</span><h3>Rafael Azevedo</h3><p>“Mantenha a média acima de 7,2 e alcance reputação 30. A primeira proposta concreta virá naturalmente.”</p></div><div className="agent-objectives"><span className={career.rating >= 7.2 ? "done" : ""}>Nota média 7,2 <b>{career.rating.toFixed(1)}</b></span><span className={career.reputation >= 30 ? "done" : ""}>Reputação 30 <b>{career.reputation}</b></span><span className={career.matches >= 8 ? "done" : ""}>8 partidas <b>{career.matches}</b></span></div></article>
      </section>
    </main>
  );
}

function DeveloperPanel({ career, onAction }: { career: CareerState; onAction: (action: string) => void }) {
  const format = getLeagueDefinition(career.countryId, career.division).format;
  return (
    <aside className="developer-panel">
      <div><span>DEV 0.3.3</span><strong>Laboratório da carreira</strong><small>Alterações são aplicadas somente a este slot.</small></div>
      <section>
        <button onClick={() => onAction("unlock")}>LIBERAR TUDO</button>
        <button onClick={() => onAction("max-player")}>MAXIMIZAR ATLETA</button>
        <button onClick={() => onAction("mid-season")}>IR À RODADA {Math.floor(format.rounds / 2)}</button>
        <button onClick={() => onAction("final-season")}>TESTAR ÚLTIMA RODADA</button>
        <button onClick={() => onAction("reset-season")}>REINICIAR TEMPORADA</button>
        <button onClick={() => onAction("toggle-division")}>TROCAR PARA D{career.division === 1 ? 2 : 1}</button>
        <button onClick={() => onAction("reset-week")}>LIBERAR PREPARAÇÕES</button>
        <button onClick={() => onAction("injury")}>TESTAR LESÃO</button>
        <button onClick={() => onAction("legacy")}>TESTAR PÓS-CARREIRA</button>
      </section>
    </aside>
  );
}

function SettingsView({ settings, onChange, standalone = false, onClose }: { settings: GameSettings; onChange: (settings: GameSettings) => void; standalone?: boolean; onClose?: () => void }) {
  const content = (
    <section className={`settings-panel ${standalone ? "is-standalone" : ""}`}>
      {standalone && <button className="creator-close" onClick={onClose} aria-label="Fechar configurações">×</button>}
      <span className="overline">CONFIGURAÇÕES DO JOGO</span><h1>Do seu jeito.</h1><p>Estas preferências valem para todos os slots e ficam salvas neste dispositivo.</p>
      <div className="settings-groups">
        <div className="setting-row"><div><strong>Velocidade da partida</strong><span>Altera o ritmo da simulação minuto a minuto.</span></div><div className="segmented">{(["1x", "2x", "3x"] as GameSettings["matchSpeed"][]).map((speed) => <button className={settings.matchSpeed === speed ? "is-active" : ""} onClick={() => onChange({ ...settings, matchSpeed: speed })} key={speed}>{speed}</button>)}</div></div>
        <ToggleSetting title="Movimento reduzido" text="Diminui animações e efeitos de transição." checked={settings.reducedMotion} onChange={(checked) => onChange({ ...settings, reducedMotion: checked })} />
        <ToggleSetting title="HUD compacto" text="Reduz espaçamentos para mostrar mais dados." checked={settings.compactHud} onChange={(checked) => onChange({ ...settings, compactHud: checked })} />
        <ToggleSetting title="Alto contraste" text="Reforça bordas e textos secundários." checked={settings.highContrast} onChange={(checked) => onChange({ ...settings, highContrast: checked })} />
        <ToggleSetting title="Narração da partida" text="Mostra o feed de eventos durante o jogo." checked={settings.commentary} onChange={(checked) => onChange({ ...settings, commentary: checked })} />
        <ToggleSetting title="Modo de desenvolvimento" text="Libera atalhos, progressão instantânea e todos os nove tipos de lance." checked={settings.developerMode} onChange={(checked) => onChange({ ...settings, developerMode: checked })} />
      </div>
      <div className="settings-note"><span>{settings.developerMode ? "⌘" : "✓"}</span><div><strong>{settings.developerMode ? "Ferramentas de desenvolvimento ativas" : "Salvamento automático ativo"}</strong><p>{settings.developerMode ? "Alterações feitas pelos atalhos também são salvas neste dispositivo." : "Carreiras e configurações são gravadas após cada escolha."}</p></div></div>
    </section>
  );
  return standalone ? <div className="settings-backdrop">{content}</div> : <main className="career-content inner-view">{content}</main>;
}

function ToggleSetting({ title, text, checked, onChange }: { title: string; text: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="setting-row"><div><strong>{title}</strong><span>{text}</span></div><button className={`toggle ${checked ? "is-on" : ""}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}><i /></button></div>;
}

function outcomeText(moment: MatchMoment, success: boolean, goal: boolean, assist: boolean, career: CareerState, opponent: string) {
  if (goal) return `GOOOL! ${career.name} escolhe a execução certa e vence o goleiro!`;
  if (assist && moment.kind === "corner") return `Cobrança precisa! A bola encontra um companheiro e o ${career.clubName} marca.`;
  if (assist && moment.kind === "counter") return `Contra-ataque letal! Você serve o companheiro para o gol do ${career.clubName}.`;
  if (assist) return `Passe perfeito! A defesa quebra e o ${career.clubName} marca.`;
  if (success && moment.kind === "defense") return `Desarme limpo! O ataque do ${opponent} termina aqui.`;
  if (success && moment.kind === "dribble") return "Você elimina o marcador e faz o estádio levantar.";
  if (success && moment.kind === "freeKick") return "A falta leva perigo e força uma grande defesa do goleiro.";
  if (success && moment.kind === "corner") return "O escanteio encontra a zona planejada e mantém a pressão.";
  if (success && moment.kind === "penalty") return "O goleiro acerta o canto, mas você mantém a equipe viva no rebote.";
  if (success && moment.kind === "counter") return "A transição rápida desmonta a defesa e empurra o rival para trás.";
  if (success && moment.kind === "aerial") return "Você domina o duelo aéreo e ganha a segunda bola.";
  if (success) return "Boa leitura. A jogada continua sob controle.";
  if (moment.kind === "defense") return `O ${opponent} escapa da marcação e finaliza com perigo.`;
  if (moment.kind === "shot") return "A finalização sai por pouco. O goleiro estava vendido.";
  if (moment.kind === "freeKick") return "A cobrança de falta para na barreira.";
  if (moment.kind === "corner") return `O ${opponent} corta o escanteio na primeira trave.`;
  if (moment.kind === "penalty") return "O goleiro espera até o fim e defende o pênalti.";
  if (moment.kind === "counter") return "O passe sai tarde e o contra-ataque é interrompido.";
  if (moment.kind === "aerial") return "O defensor sobe mais alto e afasta o perigo.";
  return "O adversário percebe a intenção e recupera a bola.";
}

function momentLabel(kind: MatchMoment["kind"]) {
  return {
    shot: "FINALIZAÇÃO",
    pass: "PASSE",
    dribble: "DRIBLE",
    defense: "MARCAÇÃO",
    freeKick: "FALTA",
    corner: "ESCANTEIO",
    penalty: "PÊNALTI",
    counter: "CONTRA-ATAQUE",
    aerial: "JOGO AÉREO",
  }[kind];
}

function momentIcon(kind: MatchMoment["kind"]) {
  return {
    shot: "◎",
    pass: "↗",
    dribble: "↝",
    defense: "×",
    freeKick: "◉",
    corner: "◒",
    penalty: "●",
    counter: "»",
    aerial: "↑",
  }[kind];
}

function MatchScreen({
  career,
  fixture,
  settings,
  onFinish,
  onExit,
}: {
  career: CareerState;
  fixture: Fixture;
  settings: GameSettings;
  onFinish: (result: MatchResult) => void;
  onExit: () => void;
}) {
  const [plan] = useState<MatchPlan>(() => generateMatchPlan(career, fixture, settings.developerMode));
  const [minute, setMinute] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [activeMoment, setActiveMoment] = useState<MatchMoment | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [processedEvents, setProcessedEvents] = useState<string[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([{ minute: 0, text: `A bola rola sob ${fixture.weather}. ${fixture.pressure}.` }]);
  const [xp, setXp] = useState(0);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [rating, setRating] = useState(6.2);
  const [toast, setToast] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const interval = settings.matchSpeed === "1x" ? 280 : settings.matchSpeed === "2x" ? 165 : 92;

  /* The clock is an external timer; each new minute intentionally advances the match state machine. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!playing || activeMoment || minute >= 90) return;
    const timer = window.setInterval(() => setMinute((current) => Math.min(90, current + 1)), interval);
    return () => window.clearInterval(timer);
  }, [playing, activeMoment, minute, interval]);

  useEffect(() => {
    const events = plan.events.filter((event) => event.minute === minute && !processedEvents.includes(`${event.minute}-${event.kind}`));
    if (events.length) {
      setFeed((current) => [...current, ...events.map((event) => ({
        minute: event.minute,
        text: event.text,
        tone: event.kind.includes("goal") ? "goal" as const : event.kind === "chance" ? "chance" as const : "normal" as const,
      }))]);
      events.forEach((event) => {
        if (event.kind === "home-goal") setScore(([home, away]) => [home + 1, away]);
        if (event.kind === "away-goal") setScore(([home, away]) => [home, away + 1]);
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
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: settings.reducedMotion ? "auto" : "smooth" });
  }, [feed, settings.reducedMotion]);

  const matchFinished = minute >= 90 && !activeMoment;

  function resolveMoment(target: MatchTarget) {
    if (!activeMoment) return;
    const fatigue = minute * .0012 + (100 - career.energy) / 1400;
    const difficultyPenalty = career.difficulty === "Lenda" ? .045 : career.difficulty === "Promessa" ? -.035 : 0;
    const skill = .58 + career.level * .009 + career.morale / 2400 + career.formBoost / 180 - fatigue - difficultyPenalty;
    const success = settings.developerMode || target.roll < skill - target.risk;
    const secondaryRoll = (target.roll * 997.37) % 1;
    const canCreateGoal = settings.developerMode || goals + assists === 0;
    const directGoalKind = ["shot", "freeKick", "penalty", "aerial"].includes(activeMoment.kind);
    const goalChance = activeMoment.kind === "penalty"
      ? .48
      : activeMoment.kind === "freeKick"
        ? .12 + target.risk * .3
        : activeMoment.kind === "aerial"
          ? .1 + target.risk * .22
          : .1 + target.risk * .28;
    const goal = canCreateGoal && success && (
      (directGoalKind && secondaryRoll < goalChance) ||
      (activeMoment.kind === "dribble" && target.risk > .3 && secondaryRoll < .08) ||
      (activeMoment.kind === "counter" && target.risk > .25 && secondaryRoll < .12)
    );
    const assist = canCreateGoal && success && ["pass", "corner", "counter"].includes(activeMoment.kind) && secondaryRoll < .14 + target.risk * .2;
    const defensiveError = !success && activeMoment.kind === "defense" && secondaryRoll > .82;
    const earned = success ? target.reward : 3;

    setXp((value) => value + earned);
    setRating((value) => Math.max(4, Math.min(10, value + (success ? .32 + target.risk : -.18))));
    if (goal) { setGoals((value) => value + 1); setScore(([home, away]) => [home + 1, away]); }
    if (assist) { setAssists((value) => value + 1); setScore(([home, away]) => [home + 1, away]); }
    if (defensiveError) setScore(([home, away]) => [home, away + 1]);

    const text = outcomeText(activeMoment, success, goal, assist, career, fixture.opponent.name);
    setFeed((current) => [...current, { minute, text, tone: goal || assist ? "goal" : "normal" }]);
    setToast(`${success ? "DECISÃO EXECUTADA" : "LANCE PERDIDO"} · +${earned} XP`);
    setCompleted((current) => [...current, activeMoment.id]);
    setActiveMoment(null);
    window.setTimeout(() => { setToast(null); setPlaying(true); }, settings.reducedMotion ? 100 : 650);
  }

  return (
    <main className="match-shell-v2">
      <header className="match-topbar">
        <button className="match-back" onClick={onExit} aria-label="Sair da partida">←</button>
        <div className="match-competition"><span>{fixture.competition.toUpperCase()}</span><small>RODADA {fixture.round} · {fixture.venue}</small></div>
        <div className="scoreboard-v2">
          <div><TeamCrest short={career.clubShort} color={career.clubColor} small /><strong>{career.clubName}</strong></div>
          <span>{score[0]} <i>–</i> {score[1]}</span>
          <div><strong>{fixture.opponent.name}</strong><TeamCrest short={fixture.opponent.short} color={fixture.opponent.color} small /></div>
        </div>
        <div className="match-clock"><small>{playing ? "EM JOGO" : activeMoment ? "DECISÃO" : "PAUSADO"}</small><strong>{String(minute).padStart(2, "0")}&apos;</strong></div>
      </header>

      <section className={`match-body ${settings.commentary ? "" : "no-commentary"}`}>
        {settings.commentary && <aside className="live-commentary">
          <div className="live-head"><span><i /> NARRAÇÃO AO VIVO</span><b>{settings.matchSpeed}</b></div>
          <div className="live-feed" ref={feedRef}>{feed.map((item, index) => <div className={`live-event ${item.tone ?? ""}`} key={`${item.minute}-${index}`}><span>{item.minute}&apos;</span><p>{item.text}</p></div>)}</div>
          <div className="live-controls"><button disabled={Boolean(activeMoment) || matchFinished} onClick={() => setPlaying((value) => !value)}>{playing ? "Ⅱ" : "▶"} <span>{playing ? "PAUSAR" : "CONTINUAR"}</span></button><div><i style={{ width: `${minute / 90 * 100}%` }} /></div></div>
        </aside>}

        <section className="match-stage">
          <div className="decision-header">
            <div><span className="overline">{activeMoment ? `${momentLabel(activeMoment.kind)} · PRESSÃO ${activeMoment.pressure.toUpperCase()}` : plan.signature}</span><h1>{activeMoment ? activeMoment.title : matchFinished ? "Fim de jogo." : "Leia o campo."}</h1><p>{activeMoment ? activeMoment.prompt : matchFinished ? "O resultado entra para a história desta carreira." : `${plan.events.length} eventos e ${plan.moments.length} decisões exclusivas compõem esta partida.`}</p></div>
            <div className="live-rating"><small>SUA NOTA</small><strong>{rating.toFixed(1)}</strong><span className={rating >= 7 ? "up" : ""}>{rating >= 7 ? "▲ EM ALTA" : "● ESTÁVEL"}</span></div>
          </div>

          <div className={`interactive-pitch ${activeMoment ? "is-active" : ""}`}>
            <div className="pitch-grain" /><div className="field-half" /><div className="field-circle" /><div className="field-box left" /><div className="field-box right" /><div className="field-goal left" /><div className="field-goal right" />
            <div className="field-player user" style={{ left: "48%", top: "51%" }}><span>{career.shirtNumber}</span><small>VOCÊ</small></div>
            <div className="field-player mate" style={{ left: "63%", top: "25%" }} /><div className="field-player mate" style={{ left: "70%", top: "72%" }} /><div className="field-player mate" style={{ left: "36%", top: "35%" }} />
            <div className="field-player rival" style={{ left: "61%", top: "49%" }} /><div className="field-player rival" style={{ left: "77%", top: "64%" }} /><div className="field-player rival" style={{ left: "82%", top: "31%" }} />
            {activeMoment?.targets.map((target) => <button className="decision-target" style={{ left: `${target.x}%`, top: `${target.y}%` }} onClick={() => resolveMoment(target)} aria-label={`${target.label}: ${target.hint}`} key={target.id}><span>{momentIcon(activeMoment.kind)}</span><strong>{target.label}</strong><small>{target.hint} · +{target.reward} XP</small></button>)}
            {!activeMoment && !matchFinished && <div className="match-waiting"><i /> SIMULANDO O PRÓXIMO LANCE</div>}
            {matchFinished && <div className="fulltime-v2"><span>APITO FINAL</span><strong>{score[0]} – {score[1]}</strong><p>{score[0] > score[1] ? `Vitória do ${career.clubName}!` : score[0] === score[1] ? "Um ponto para cada lado." : `Vitória do ${fixture.opponent.name}.`}</p></div>}
          </div>

          <div className="match-bottom-hud">
            <div><small>XP NA PARTIDA</small><strong>+{xp}</strong></div><div><small>PARTICIPAÇÕES</small><strong>{goals + assists}</strong></div><div><small>DECISÕES</small><strong>{completed.length}/{plan.moments.length}</strong></div><div><small>ENERGIA</small><strong>{Math.max(18, career.energy - Math.round(minute * .58))}%</strong></div>
            {matchFinished ? <button onClick={() => onFinish({ xp, goals, assists, rating, unionGoals: score[0], opponentGoals: score[1], opponentName: fixture.opponent.name, signature: plan.signature })}>VER RELATÓRIO <span>→</span></button> : <span className="match-hint">Escolha entre segurança, recompensa e risco.</span>}
          </div>
        </section>
      </section>
      {toast && <div className="match-toast" role="status">{toast}</div>}
    </main>
  );
}

function ResultScreen({ career, result, fixture, onContinue }: { career: CareerState; result: MatchResult; fixture: Fixture; onContinue: () => void }) {
  const won = result.unionGoals > result.opponentGoals;
  const draw = result.unionGoals === result.opponentGoals;
  return (
    <main className="result-shell-v2">
      <div className={`result-atmosphere ${won ? "won" : draw ? "draw" : "lost"}`} />
      <header><Brand dark /><span>{fixture.competition.toUpperCase()} · RODADA {fixture.round}</span></header>
      <section className="result-report">
        <span className="result-kicker">{won ? "VITÓRIA" : draw ? "EMPATE" : "DERROTA"} · {result.signature}</span>
        <h1>{won ? "Uma noite para guardar." : draw ? "Tudo ficou em aberto." : "A resposta vem na próxima."}</h1>
        <div className="result-score-v2">
          <div><TeamCrest short={career.clubShort} color={career.clubColor} /><strong>{career.clubName}</strong></div>
          <p>{result.unionGoals} <span>–</span> {result.opponentGoals}</p>
          <div><TeamCrest short={fixture.opponent.short} color={fixture.opponent.color} /><strong>{fixture.opponent.name}</strong></div>
        </div>
        <div className="result-player-v2"><PlayerAvatar career={career} /><div><small>{career.position.toUpperCase()} · 90 MINUTOS</small><strong>{career.name}</strong><span>{result.goals} gol(s) · {result.assists} assistência(s)</span></div><div className="result-rating"><small>NOTA</small><strong>{result.rating.toFixed(1)}</strong></div></div>
        <div className="result-rewards"><div><span>XP RECEBIDO</span><strong>+{result.xp}</strong></div><div><span>NOVOS FÃS</span><strong>+{Math.max(80, Math.round(result.rating * 43))}</strong></div><div><span>REPUTAÇÃO</span><strong>+{won ? 3 : draw ? 1 : 0}</strong></div><div><span>{fixture.competitionType === "league" ? "PONTOS NA LIGA" : "RESULTADO NA COPA"}</span><strong>{fixture.competitionType === "league" ? `+${won ? 3 : draw ? 1 : 0}` : won ? "AVANÇOU" : draw ? "DECISÃO" : "ELIMINADO"}</strong></div></div>
        <div className="coach-report"><span>RELATÓRIO DO TREINADOR</span><p>{result.rating >= 8 ? "Você decidiu nos momentos grandes. O elenco começa a reconhecer sua liderança." : result.rating >= 7 ? "Atuação segura, com boa leitura e contribuição coletiva." : "Há espaço para evoluir. A preparação da próxima semana será importante."}</p></div>
        <button className="continue-button" onClick={onContinue}>CONTINUAR TEMPORADA <span>→</span></button>
      </section>
    </main>
  );
}

export default function Home() {
  const [slots, setSlots] = useState<Array<CareerState | null>>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [creatorSlot, setCreatorSlot] = useState<number | null>(null);
  const [view, setView] = useState<AppView>("lobby");
  const [lastResult, setLastResult] = useState<MatchResult>(emptyResult);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [showLobbySettings, setShowLobbySettings] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /* Initial client hydration reads the device-local save once after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedSlots = window.localStorage.getItem(slotsKey);
      if (savedSlots) {
        const parsed = JSON.parse(savedSlots) as Array<Partial<CareerState> | null>;
        setSlots([0, 1, 2].map((index) => parsed[index] ? migrateCareer(parsed[index]) : null));
      } else {
        const legacy = legacyKeys.map((key) => window.localStorage.getItem(key)).find(Boolean);
        if (legacy) {
          const migrated = migrateCareer(JSON.parse(legacy));
          setSlots([migrated, null, null]);
        }
      }
      const savedSettings = window.localStorage.getItem(settingsKey);
      if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    } catch {
      setSlots([null, null, null]);
    }
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (loaded) window.localStorage.setItem(slotsKey, JSON.stringify(slots));
  }, [slots, loaded]);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings, loaded]);

  const career = activeSlot === null ? null : slots[activeSlot];
  const fixture = useMemo(() => career ? createFixture(career) : null, [career]);

  function updateCareer(updater: (current: CareerState) => CareerState) {
    if (activeSlot === null) return;
    setSlots((currentSlots) => currentSlots.map((slot, index) => index === activeSlot && slot ? updater(slot) : slot));
  }

  function createCareer(next: CareerState) {
    if (creatorSlot === null) return;
    setSlots((current) => current.map((slot, index) => index === creatorSlot ? next : slot));
    setActiveSlot(creatorSlot);
    setCreatorSlot(null);
    setView("dashboard");
  }

  function deleteCareer(index: number) {
    const target = slots[index];
    if (!target) return;
    if (!window.confirm(`Excluir definitivamente a carreira de ${target.name}?`)) return;
    setSlots((current) => current.map((slot, slotIndex) => slotIndex === index ? null : slot));
  }

  function train(kind: TrainingKind) {
    updateCareer((current) => {
      if (current.preparationActionsUsed >= current.preparationActionsAllowed) return current;
      const attributes = { ...current.attributes };
      let energy = current.energy;
      let morale = current.morale;
      let fans = current.fans;
      let reputation = current.reputation;
      let formBoost = current.formBoost;
      let languageLevel = current.languageLevel;
      let adaptation = current.adaptation;
      let coachTrust = current.coachTrust;
      let weeklyAction = "";
      if (kind === "recovery") { energy = Math.min(100, energy + 10); morale = Math.min(100, morale + 1); weeklyAction = "Recuperação"; }
      if (kind === "technique") {
        const attribute = current.position === "Atacante" ? "shooting" : current.position === "Meia" ? "passing" : current.position === "Ponta" ? "dribbling" : "defending";
        attributes[attribute] = Math.min(95, attributes[attribute] + 1);
        energy = Math.max(40, energy - 7);
        formBoost = Math.min(10, formBoost + 1);
        weeklyAction = "Fundamentos";
      }
      if (kind === "intensity") { energy = Math.max(35, energy - 12); morale = Math.min(100, morale + 3); formBoost = Math.min(10, formBoost + 3); weeklyAction = "Alta intensidade"; }
      if (kind === "tactics") { morale = Math.min(100, morale + 2); formBoost = Math.min(10, formBoost + 2); coachTrust = Math.min(100, coachTrust + 3); weeklyAction = "Treino tático"; }
      if (kind === "setpieces") {
        const attribute = current.position === "Meia" || current.position === "Lateral" ? "passing" : "shooting";
        attributes[attribute] = Math.min(95, attributes[attribute] + 1);
        energy = Math.max(40, energy - 6);
        formBoost = Math.min(10, formBoost + 1);
        weeklyAction = "Bola parada";
      }
      if (kind === "language") { energy = Math.max(45, energy - 2); languageLevel = Math.min(100, languageLevel + 8); adaptation = Math.min(100, adaptation + 4); weeklyAction = "Aula de idioma"; }
      if (kind === "media") { energy = Math.max(45, energy - 4); fans += 350; morale = Math.min(100, morale + 2); reputation = Math.min(100, reputation + 1); weeklyAction = "Ação com fãs"; }
      return {
        ...current,
        attributes,
        energy,
        morale,
        fans,
        reputation,
        formBoost,
        languageLevel,
        adaptation,
        coachTrust,
        weeklyAction,
        preparedForMatch: true,
        preparationActionsUsed: current.preparationActionsUsed + 1,
        preparationLog: [...current.preparationLog, weeklyAction],
        updatedAt: Date.now(),
      };
    });
  }

  function transferTo(team: Team) {
    if (!career || team.id === career.clubId) return;
    if (!window.confirm(`Aceitar a proposta do ${team.name} e mudar para ${team.country}?`)) return;
    updateCareer((current) => {
      const previousCountry = getCountry(current.countryId);
      const country = getCountry(team.countryId);
      const league = getLeagueDefinition(team.countryId, team.division);
      const baseSalary = getSalary(team.countryId, team.division, current.reputation);
      const nextGap = getDaysToNextMatch(current.careerSeed, current.matches, team.countryId);
      const sameCountry = current.countryId === team.countryId;
      const sameLanguage = previousCountry.language === country.language;
      return migrateCareer({
        ...current,
        countryId: team.countryId,
        countryName: team.country,
        division: team.division,
        leagueId: league.id,
        leagueName: league.name,
        clubId: team.id,
        clubName: team.name,
        clubShort: team.short,
        clubColor: team.color,
        clubStrength: team.strength,
        salary: Math.round(baseSalary * 1.12),
        bankBalance: current.bankBalance + baseSalary * 2,
        monthlyExpenses: country.costOfLiving,
        housing: "Hotel do clube",
        language: country.language,
        languageLevel: sameLanguage ? Math.max(current.languageLevel, 80) : 15,
        adaptation: sameCountry ? current.adaptation : 38,
        coachTrust: 42,
        contractMatches: 44,
        seasonRound: 1,
        seasonMatches: 0,
        seasonPoints: 0,
        seasonWins: 0,
        seasonDraws: 0,
        seasonLosses: 0,
        seasonGoalsFor: 0,
        seasonGoalsAgainst: 0,
        leagueTable: [],
        leagueLeaders: [],
        lastRoundResults: [],
        recentResults: [],
        cupStage: "Primeira fase",
        preparedForMatch: false,
        weeklyAction: "Nenhuma",
        nextMatchDate: addDaysToDate(current.currentDate, nextGap),
        daysUntilMatch: nextGap,
        preparationActionsAllowed: getPreparationActionCount(nextGap),
        preparationActionsUsed: 0,
        preparationLog: [],
        formBoost: 0,
        lastSeasonSummary: `Transferência para o ${team.name}, de ${team.country}`,
        updatedAt: Date.now(),
      });
    });
    setView("dashboard");
  }

  function changeHousing(kind: "Clube" | "Apartamento" | "Casa") {
    updateCareer((current) => {
      const cost = getCountry(current.countryId).costOfLiving;
      const option = {
        Clube: { label: "Hotel do clube", deposit: 0, monthly: cost },
        Apartamento: { label: "Apartamento", deposit: cost * 2, monthly: Math.round(cost * 1.15) },
        Casa: { label: "Casa própria", deposit: cost * 5, monthly: Math.round(cost * 1.7) },
      }[kind];
      if (current.bankBalance < option.deposit || current.housing === option.label) return current;
      return {
        ...current,
        housing: option.label,
        bankBalance: current.bankBalance - option.deposit,
        monthlyExpenses: option.monthly,
        adaptation: Math.min(100, current.adaptation + (kind === "Casa" ? 8 : kind === "Apartamento" ? 5 : 1)),
        updatedAt: Date.now(),
      };
    });
  }

  function handleLifeAction(action: string) {
    updateCareer((current) => {
      const history = (text: string) => [text, ...current.lifeEventHistory].slice(0, 20);
      if (action === "invest" && current.bankBalance >= 50_000) return { ...current, bankBalance: current.bankBalance - 50_000, investments: current.investments + 50_000, lifeEventHistory: history("Separou R$ 50 mil para investimentos."), updatedAt: Date.now() };
      if (action === "retirement" && current.bankBalance >= 25_000) return { ...current, bankBalance: current.bankBalance - 25_000, retirementFund: current.retirementFund + 25_000, lifeEventHistory: history("Começou a construir o fundo de aposentadoria."), updatedAt: Date.now() };
      if (action === "pay-debt" && current.debt > 0 && current.bankBalance >= 20_000) {
        const payment = Math.min(20_000, current.debt);
        return { ...current, bankBalance: current.bankBalance - payment, debt: current.debt - payment, lifeEventHistory: history(`Amortizou ${money(payment)} em dívidas.`), updatedAt: Date.now() };
      }
      if (action === "buy-car" && current.bankBalance >= 120_000 && current.car === "Transporte do clube") return { ...current, bankBalance: current.bankBalance - 120_000, monthlyExpenses: current.monthlyExpenses + 1500, car: "Cupê esportivo", morale: Math.min(100, current.morale + 5), lifeEventHistory: history("Comprou o primeiro carro da carreira."), updatedAt: Date.now() };
      if (action === "food-plan" && current.foodPlan !== "Nutricionista particular") return { ...current, foodPlan: "Nutricionista particular", monthlyExpenses: current.monthlyExpenses + 1500, injuryRisk: Math.max(3, current.injuryRisk - 8), energy: Math.min(100, current.energy + 5), updatedAt: Date.now() };
      if (action === "private-training" && current.bankBalance >= 35_000 && current.privateTraining === "Nenhum") return { ...current, bankBalance: current.bankBalance - 35_000, monthlyExpenses: current.monthlyExpenses + 8000, privateTraining: "Equipe técnica particular", attributes: Object.fromEntries(Object.entries(current.attributes).map(([key, value]) => [key, Math.min(95, value + 1)])) as CareerState["attributes"], updatedAt: Date.now() };
      if (action === "leisure" && current.bankBalance >= 2_000) return { ...current, bankBalance: current.bankBalance - 2_000, morale: Math.min(100, current.morale + 8), familyBond: Math.min(100, current.familyBond + 4), updatedAt: Date.now() };
      if (action === "social-post") return { ...current, socialFollowers: current.socialFollowers + 900 + (hashText(`${current.matches}:post`) % 1800), socialReputation: Math.max(10, Math.min(100, current.socialReputation + ((hashText(`${current.matches}:tone`) % 7) - 2))), updatedAt: Date.now() };
      if (action === "interview") return { ...current, pendingLifeEvent: "primeira-entrevista", updatedAt: Date.now() };
      if (action === "sponsor" && current.reputation >= 25 && current.sponsorship === "Sem patrocinador") return { ...current, sponsorship: "Vértice Sports", bankBalance: current.bankBalance + 120_000, socialFollowers: current.socialFollowers + 12_000, lifeEventHistory: history("Assinou o primeiro patrocínio pessoal."), updatedAt: Date.now() };
      if (action === "social-project" && current.socialProject === "Nenhum" && current.bankBalance >= 40_000) return { ...current, bankBalance: current.bankBalance - 40_000, socialProject: `Instituto ${current.name.split(" ")[0]}`, reputation: Math.min(100, current.reputation + 5), socialReputation: Math.min(100, current.socialReputation + 12), lifeEventHistory: history(`Fundou um projeto social ligado ao ${current.clubName}.`), updatedAt: Date.now() };
      if (action === "meet-partner" && current.relationshipStatus === "Solteiro") return { ...current, relationshipStatus: "Namorando", partnerName: current.countryId === "BR" ? "Marina Alves" : current.countryId === "JP" ? "Aiko Mori" : "Sofia Laurent", morale: Math.min(100, current.morale + 8), lifeEventHistory: history("Começou um relacionamento amoroso."), updatedAt: Date.now() };
      if (action === "marry" && current.relationshipStatus === "Namorando" && current.bankBalance >= 60_000) return { ...current, relationshipStatus: "Casado", bankBalance: current.bankBalance - 60_000, familyBond: Math.min(100, current.familyBond + 15), monthlyExpenses: current.monthlyExpenses + 2500, lifeEventHistory: history(`Casou-se com ${current.partnerName}.`), updatedAt: Date.now() };
      if (action === "child" && current.relationshipStatus === "Casado") return { ...current, children: current.children + 1, monthlyExpenses: current.monthlyExpenses + 3000, familyBond: Math.min(100, current.familyBond + 12), lifeEventHistory: history("A família cresceu com a chegada de um filho."), updatedAt: Date.now() };
      if (action === "family-time") return { ...current, bankBalance: Math.max(0, current.bankBalance - 2500), familyBond: Math.min(100, current.familyBond + 10), morale: Math.min(100, current.morale + 4), updatedAt: Date.now() };
      if (action === "squad-dinner") return { ...current, bankBalance: Math.max(0, current.bankBalance - 4500), squadRelations: Math.min(100, current.squadRelations + 10), coachTrust: Math.min(100, current.coachTrust + 2), updatedAt: Date.now() };
      if (action === "treatment" && current.injuryStatus !== "Apto" && current.bankBalance >= 18_000) return { ...current, bankBalance: current.bankBalance - 18_000, injuryStatus: "Apto", injuryRisk: Math.max(5, current.injuryRisk - 20), energy: Math.min(100, current.energy + 15), updatedAt: Date.now() };
      if (action === "rest-day") return { ...current, energy: Math.min(100, current.energy + 16), injuryRisk: Math.max(3, current.injuryRisk - 6), formBoost: Math.max(0, current.formBoost - 1), updatedAt: Date.now() };
      if (action === "future-coach") return { ...current, futurePath: "Treinador", coachTrust: Math.min(100, current.coachTrust + 4), lifeEventHistory: history("Começou a estudar para se tornar treinador."), updatedAt: Date.now() };
      if (action === "future-agent") return { ...current, futurePath: "Empresário", socialReputation: Math.min(100, current.socialReputation + 4), lifeEventHistory: history("Começou a construir uma rede para virar empresário."), updatedAt: Date.now() };

      if (action === "event-humble") return { ...current, squadRelations: Math.min(100, current.squadRelations + 8), discipline: Math.min(100, current.discipline + 5), pendingLifeEvent: "convite-festa", lifeEventHistory: history("Dividiu os méritos com o elenco em uma entrevista."), updatedAt: Date.now() };
      if (action === "event-bold") return { ...current, socialFollowers: current.socialFollowers + 5000, socialReputation: Math.min(100, current.socialReputation + 6), lifeFlags: [...new Set([...current.lifeFlags, "rivalidade-publica"])], pendingLifeEvent: "rival-provocou", lifeEventHistory: history("Assumiu publicamente o papel de protagonista."), updatedAt: Date.now() };
      if (action === "event-party") return { ...current, morale: Math.min(100, current.morale + 10), energy: Math.max(25, current.energy - 15), discipline: Math.max(10, current.discipline - 12), injuryRisk: Math.min(90, current.injuryRisk + 8), pendingLifeEvent: "decisao-medica", lifeFlags: [...new Set([...current.lifeFlags, "noite-indisciplinada"])], lifeEventHistory: history("Foi a uma festa antes do treino e chegou abaixo do ideal."), updatedAt: Date.now() };
      if (action === "event-skip-party") return { ...current, coachTrust: Math.min(100, current.coachTrust + 5), squadRelations: Math.max(20, current.squadRelations - 5), pendingLifeEvent: "familia-distante", lifeEventHistory: history("Recusou uma festa para preservar a preparação."), updatedAt: Date.now() };
      if (action === "event-reply-rival") return { ...current, socialFollowers: current.socialFollowers + 3500, morale: Math.min(100, current.morale + 4), discipline: Math.max(10, current.discipline - 5), pendingLifeEvent: "familia-distante", lifeEventHistory: history("Respondeu a um rival e aumentou a tensão do confronto."), updatedAt: Date.now() };
      if (action === "event-ignore-rival") return { ...current, discipline: Math.min(100, current.discipline + 6), pendingLifeEvent: "familia-distante", lifeEventHistory: history("Ignorou uma provocação pública."), updatedAt: Date.now() };
      if (action === "event-visit-family") return { ...current, bankBalance: Math.max(0, current.bankBalance - 8000), familyBond: Math.min(100, current.familyBond + 20), pendingLifeEvent: "proposta-publicitaria", lifeEventHistory: history("Interrompeu a rotina para visitar a família."), updatedAt: Date.now() };
      if (action === "event-focus-career") return { ...current, formBoost: Math.min(10, current.formBoost + 2), familyBond: Math.max(10, current.familyBond - 15), pendingLifeEvent: "decisao-medica", lifeEventHistory: history("Priorizou a carreira e se afastou da família."), updatedAt: Date.now() };
      if (action === "event-rest") return { ...current, injuryStatus: "Apto", injuryRisk: 5, energy: Math.min(100, current.energy + 20), pendingLifeEvent: "proposta-publicitaria", lifeEventHistory: history("Respeitou o repouso indicado pelo departamento médico."), updatedAt: Date.now() };
      if (action === "event-injection") return { ...current, injuryStatus: "Jogando com dor", injuryRisk: Math.min(95, current.injuryRisk + 25), formBoost: Math.min(10, current.formBoost + 2), pendingLifeEvent: "proposta-publicitaria", lifeEventHistory: history("Aceitou tratamento acelerado para continuar jogando."), updatedAt: Date.now() };
      if (action === "event-sign-sponsor") return { ...current, sponsorship: "Vértice Sports", bankBalance: current.bankBalance + 180_000, socialFollowers: current.socialFollowers + 25_000, pendingLifeEvent: "", lifeEventHistory: history("Aceitou uma grande campanha publicitária."), updatedAt: Date.now() };
      if (action === "event-refuse-sponsor") return { ...current, socialReputation: Math.min(100, current.socialReputation + 10), pendingLifeEvent: "", lifeEventHistory: history("Recusou uma campanha para proteger sua imagem."), updatedAt: Date.now() };
      return current;
    });
  }

  function developerAdvanceTo(targetRound: number) {
    updateCareer((current) => {
      const format = getLeagueDefinition(current.countryId, current.division).format;
      const target = Math.max(0, Math.min(format.rounds - 1, targetRound));
      let state = migrateCareer({
        ...current,
        seasonRound: 1,
        seasonMatches: 0,
        seasonPoints: 0,
        seasonWins: 0,
        seasonDraws: 0,
        seasonLosses: 0,
        seasonGoalsFor: 0,
        seasonGoalsAgainst: 0,
        leagueTable: [],
        leagueLeaders: [],
        lastRoundResults: [],
        recentResults: [],
      });
      for (let round = 1; round <= target; round += 1) {
        const seed = hashText(`dev:${state.careerSeed}:${state.season}:${round}`);
        const clubGoals = seed % 4;
        const opponentGoals = Math.floor(seed / 7) % 4;
        const simulation = simulateFullRound(state, {
          clubGoals,
          opponentGoals,
          opponentId: "",
          goals: clubGoals > 0 && round % 3 === 0 ? 1 : 0,
          assists: clubGoals > 1 && round % 4 === 0 ? 1 : 0,
        });
        const record = simulation.leagueTable.find((item) => item.teamId === state.clubId);
        state = migrateCareer({
          ...state,
          seasonRound: Math.min(format.rounds, round + 1),
          seasonMatches: round,
          seasonPoints: record?.points ?? 0,
          seasonWins: record?.wins ?? 0,
          seasonDraws: record?.draws ?? 0,
          seasonLosses: record?.losses ?? 0,
          seasonGoalsFor: record?.goalsFor ?? 0,
          seasonGoalsAgainst: record?.goalsAgainst ?? 0,
          recentResults: record?.form.map((result) => `${result} DEV`) ?? [],
          ...simulation,
        });
      }
      return { ...state, matches: Math.max(current.matches, target), updatedAt: Date.now() };
    });
  }

  function handleDeveloperAction(action: string) {
    if (action === "mid-season" && career) return developerAdvanceTo(Math.floor(getLeagueDefinition(career.countryId, career.division).format.rounds / 2));
    if (action === "final-season" && career) return developerAdvanceTo(getLeagueDefinition(career.countryId, career.division).format.rounds - 1);
    if (action === "reset-season") return developerAdvanceTo(0);
    updateCareer((current) => {
      if (action === "unlock") return {
        ...current,
        bankBalance: 50_000_000,
        investments: 8_000_000,
        retirementFund: 4_000_000,
        debt: 250_000,
        reputation: 100,
        socialFollowers: 5_000_000,
        socialReputation: 95,
        sponsorship: "Vértice Global",
        relationshipStatus: "Casado",
        partnerName: current.partnerName || "Sofia Laurent",
        children: 2,
        familyBond: 92,
        squadRelations: 92,
        discipline: 90,
        socialProject: `Instituto ${current.name.split(" ")[0]}`,
        pendingLifeEvent: "primeira-entrevista",
        lifeFlags: ["rivalidade-publica", "noite-indisciplinada", "contrato-global"],
        individualAwards: ["Melhor jogador da temporada", "Artilheiro nacional"],
        historicalRecords: ["100 gols na carreira", "Mais jovem a marcar pelo clube"],
        updatedAt: Date.now(),
      };
      if (action === "max-player") return { ...current, level: 25, xp: 99, energy: 100, morale: 100, formBoost: 10, attributes: { pace: 95, shooting: 95, passing: 95, dribbling: 95, defending: 95, physical: 95 }, updatedAt: Date.now() };
      if (action === "reset-week") return { ...current, preparationActionsAllowed: 6, preparationActionsUsed: 0, preparationLog: [], preparedForMatch: false, energy: 100, updatedAt: Date.now() };
      if (action === "injury") return { ...current, injuryStatus: "Lesão muscular moderada", injuryRisk: 78, pendingLifeEvent: "decisao-medica", energy: 45, updatedAt: Date.now() };
      if (action === "legacy") return { ...current, age: 36, matches: Math.max(650, current.matches), goals: Math.max(220, current.goals), assists: Math.max(160, current.assists), retirementFund: Math.max(12_000_000, current.retirementFund), individualAwards: ["Lenda da liga", "Melhor jogador da temporada", ...current.individualAwards], historicalRecords: ["650 jogos profissionais", "220 gols na carreira", ...current.historicalRecords], futurePath: current.futurePath === "Indefinido" ? "Treinador" : current.futurePath, updatedAt: Date.now() };
      if (action === "toggle-division") {
        const division: DivisionLevel = current.division === 1 ? 2 : 1;
        const league = getLeagueDefinition(current.countryId, division);
        const club = getStartingClub(current.countryId, division, current.origin);
        return migrateCareer({ ...current, division, leagueId: league.id, leagueName: league.name, clubId: club.id, clubName: club.name, clubShort: club.short, clubColor: club.color, clubStrength: club.strength, seasonRound: 1, seasonMatches: 0, seasonPoints: 0, seasonWins: 0, seasonDraws: 0, seasonLosses: 0, seasonGoalsFor: 0, seasonGoalsAgainst: 0, leagueTable: [], leagueLeaders: [], lastRoundResults: [], updatedAt: Date.now() });
      }
      return current;
    });
  }

  function continueCareer() {
    if (!career || !fixture) return;
    const nextXp = career.xp + lastResult.xp;
    const won = lastResult.unionGoals > lastResult.opponentGoals;
    const draw = lastResult.unionGoals === lastResult.opponentGoals;
    const resultLetter = won ? "V" : draw ? "E" : "D";
    const newFans = Math.max(80, Math.round(lastResult.rating * 43));
    const leagueMatch = fixture.competitionType === "league";
    const currentLeague = getLeagueDefinition(career.countryId, career.division);
    const nextSeasonMatches = career.seasonMatches + (leagueMatch ? 1 : 0);
    const seasonEnded = leagueMatch && nextSeasonMatches >= currentLeague.format.rounds;
    const fatigueVariance = hashText(`${career.careerSeed}:${career.matches}`) % 7;
    const nextRating = Number(((career.rating * career.matches + lastResult.rating) / (career.matches + 1)).toFixed(1));
    const reputationGain = won ? 3 : draw ? 1 : lastResult.rating >= 7.5 ? 1 : 0;
    const nextCupStage = fixture.competitionType === "cup"
      ? won ? (career.cupStage === "Primeira fase" ? "Oitavas de final" : career.cupStage === "Oitavas de final" ? "Quartas de final" : career.cupStage === "Quartas de final" ? "Semifinal" : "Final") : "Eliminado"
      : career.cupStage;
    const seasonPoints = career.seasonPoints + (leagueMatch ? won ? 3 : draw ? 1 : 0 : 0);
    const seasonWins = career.seasonWins + (leagueMatch && won ? 1 : 0);
    const seasonDraws = career.seasonDraws + (leagueMatch && draw ? 1 : 0);
    const seasonLosses = career.seasonLosses + (leagueMatch && !won && !draw ? 1 : 0);
    const seasonGoalsFor = career.seasonGoalsFor + (leagueMatch ? lastResult.unionGoals : 0);
    const seasonGoalsAgainst = career.seasonGoalsAgainst + (leagueMatch ? lastResult.opponentGoals : 0);
    const recentResults = [`${resultLetter} ${lastResult.unionGoals}–${lastResult.opponentGoals}`, ...career.recentResults].slice(0, 6);
    const roundSimulation = leagueMatch
      ? simulateFullRound(career, {
        clubGoals: lastResult.unionGoals,
        opponentGoals: lastResult.opponentGoals,
        opponentId: fixture.opponent.id,
        goals: lastResult.goals,
        assists: lastResult.assists,
      })
      : { leagueTable: career.leagueTable, leagueLeaders: career.leagueLeaders, lastRoundResults: career.lastRoundResults };
    const completedSeason = migrateCareer({
      ...career,
      seasonMatches: nextSeasonMatches,
      seasonPoints,
      seasonWins,
      seasonDraws,
      seasonLosses,
      seasonGoalsFor,
      seasonGoalsAgainst,
      recentResults,
      ...roundSimulation,
    });
    const finalPosition = seasonEnded ? generateStandings(completedSeason).find((row) => row.isPlayerTeam)?.position ?? 6 : 0;
    let nextDivision: DivisionLevel = career.division;
    let promotions = career.promotions;
    let relegations = career.relegations;
    let lastSeasonSummary = career.lastSeasonSummary;
    let trophies = career.trophies;
    const promotionDirect = currentLeague.format.directPromotion;
    const promotionPlayoff = currentLeague.format.playoffPromotion;
    const inPromotionPlayoff = finalPosition > promotionDirect && finalPosition <= promotionDirect + promotionPlayoff;
    const wonPromotionPlayoff = inPromotionPlayoff && hashText(`${career.careerSeed}:${career.season}:promotion`) % 100 < 55;
    const relegationDirectStarts = currentLeague.format.teamCount - currentLeague.format.directRelegation + 1;
    const relegationPlayoffStarts = relegationDirectStarts - currentLeague.format.relegationPlayoff;
    const inRelegationPlayoff = currentLeague.format.relegationPlayoff > 0 && finalPosition >= relegationPlayoffStarts && finalPosition < relegationDirectStarts;
    const lostRelegationPlayoff = inRelegationPlayoff && hashText(`${career.careerSeed}:${career.season}:relegation`) % 100 < 45;
    if (seasonEnded && career.division === 2 && (finalPosition <= promotionDirect || wonPromotionPlayoff)) {
      nextDivision = 1;
      promotions += 1;
      lastSeasonSummary = `${career.season}: ${finalPosition}º lugar e acesso para a elite${wonPromotionPlayoff ? " pelos playoffs" : ""}`;
      trophies = [`Acesso ${career.countryName} ${career.season}`, ...trophies];
    } else if (seasonEnded && career.division === 1 && currentLeague.format.directRelegation > 0 && (finalPosition >= relegationDirectStarts || lostRelegationPlayoff)) {
      nextDivision = 2;
      relegations += 1;
      lastSeasonSummary = `${career.season}: ${finalPosition}º lugar e rebaixamento${lostRelegationPlayoff ? " na repescagem" : ""}`;
    } else if (seasonEnded) {
      lastSeasonSummary = `${career.season}: ${finalPosition}º lugar na ${career.leagueName}`;
    }
    const nextLeague = getLeagueDefinition(career.countryId, nextDivision);
    const nextReputation = Math.min(100, career.reputation + reputationGain);
    const nextCurrentDate = career.nextMatchDate;
    const nextGap = getDaysToNextMatch(career.careerSeed, career.matches + 1, career.countryId);
    const nextMatchDate = addDaysToDate(nextCurrentDate, nextGap);
    const matchIncome = Math.round(career.salary / 4);
    const periodExpenses = Math.round(career.monthlyExpenses * nextGap / 30);
    const injuryRoll = hashText(`${career.careerSeed}:${career.matches}:medical`) % 100;
    const sufferedInjury = injuryRoll < Math.max(2, Math.round(career.injuryRisk / 4));
    const nextPendingEvent = career.pendingLifeEvent || ((career.matches + 1) % 3 === 0
      ? ["convite-festa", "familia-distante", "decisao-medica", "proposta-publicitaria"][hashText(`${career.careerSeed}:${career.matches}:life`) % 4]
      : "");
    const individualAwards = seasonEnded && finalPosition === 1 && lastResult.rating >= 7.2
      ? [`Craque da ${career.leagueName} ${career.season}`, ...career.individualAwards]
      : career.individualAwards;
    const historicalRecords = career.goals + lastResult.goals >= 100 && !career.historicalRecords.includes("100 gols na carreira")
      ? ["100 gols na carreira", ...career.historicalRecords]
      : career.historicalRecords;
    const nextCareer = migrateCareer({
      ...career,
      level: career.level + (nextXp >= 100 ? 1 : 0),
      xp: nextXp >= 100 ? nextXp - 100 : nextXp,
      matches: career.matches + 1,
      goals: career.goals + lastResult.goals,
      assists: career.assists + lastResult.assists,
      rating: nextRating,
      fans: career.fans + newFans,
      energy: Math.max(38, career.energy - 18 + fatigueVariance),
      morale: Math.max(30, Math.min(100, career.morale + (won ? 7 : draw ? 1 : -5))),
      recentResults: seasonEnded ? [] : recentResults,
      division: nextDivision,
      leagueId: nextLeague.id,
      leagueName: nextLeague.name,
      clubStrength: seasonEnded && nextDivision !== career.division ? Math.max(58, Math.min(84, career.clubStrength + (nextDivision === 1 ? 3 : -2))) : career.clubStrength,
      season: seasonEnded ? career.season + 1 : career.season,
      age: seasonEnded ? career.age + 1 : career.age,
      seasonRound: seasonEnded ? 1 : Math.min(currentLeague.format.rounds, career.seasonRound + (leagueMatch ? 1 : 0)),
      seasonMatches: seasonEnded ? 0 : nextSeasonMatches,
      seasonPoints: seasonEnded ? 0 : seasonPoints,
      seasonWins: seasonEnded ? 0 : seasonWins,
      seasonDraws: seasonEnded ? 0 : seasonDraws,
      seasonLosses: seasonEnded ? 0 : seasonLosses,
      seasonGoalsFor: seasonEnded ? 0 : seasonGoalsFor,
      seasonGoalsAgainst: seasonEnded ? 0 : seasonGoalsAgainst,
      cupStage: seasonEnded ? "Primeira fase" : nextCupStage,
      preparedForMatch: false,
      weeklyAction: "Nenhuma",
      currentDate: nextCurrentDate,
      nextMatchDate,
      daysUntilMatch: nextGap,
      preparationActionsAllowed: getPreparationActionCount(nextGap),
      preparationActionsUsed: 0,
      preparationLog: [],
      formBoost: 0,
      reputation: nextReputation,
      marketValue: Math.round(career.marketValue * (1 + Math.max(-.02, (lastResult.rating - 6.5) / 90))),
      salary: seasonEnded ? getSalary(career.countryId, nextDivision, nextReputation) : career.salary,
      bankBalance: Math.max(0, career.bankBalance + matchIncome - periodExpenses),
      languageLevel: Math.min(100, career.languageLevel + (career.languageLevel < 100 ? 1 : 0)),
      adaptation: Math.min(100, career.adaptation + 2),
      coachTrust: Math.max(15, Math.min(100, career.coachTrust + (lastResult.rating >= 7.5 ? 4 : won ? 2 : lastResult.rating < 6 ? -4 : -1))),
      socialFollowers: career.socialFollowers + newFans * 2,
      investments: Math.round(career.investments * 1.0012),
      retirementFund: Math.round(career.retirementFund * 1.0008),
      injuryStatus: sufferedInjury ? "Lesão muscular leve" : career.injuryStatus,
      injuryRisk: sufferedInjury ? Math.min(90, career.injuryRisk + 18) : Math.max(5, career.injuryRisk - 1),
      pendingLifeEvent: sufferedInjury ? "decisao-medica" : nextPendingEvent,
      individualAwards,
      historicalRecords,
      contractMatches: seasonEnded ? nextLeague.format.rounds : Math.max(0, career.contractMatches - 1),
      leagueTable: seasonEnded ? [] : roundSimulation.leagueTable,
      leagueLeaders: seasonEnded ? [] : roundSimulation.leagueLeaders,
      lastRoundResults: seasonEnded ? [] : roundSimulation.lastRoundResults,
      promotions,
      relegations,
      lastSeasonSummary,
      trophies,
      updatedAt: Date.now(),
    });
    updateCareer(() => nextCareer);
    setView("dashboard");
  }

  if (!loaded) return <div className="loading-screen-v2"><span>L</span><p>CARREGANDO SEU UNIVERSO</p></div>;

  const rootClass = [
    "app-root-v2",
    settings.reducedMotion ? "reduce-motion" : "",
    settings.compactHud ? "compact-hud" : "",
    settings.highContrast ? "high-contrast" : "",
  ].filter(Boolean).join(" ");

  if (view === "lobby" || !career || activeSlot === null) {
    return <div className={rootClass}>
      <Lobby slots={slots} onSelect={(index) => { setActiveSlot(index); setView("dashboard"); }} onCreate={setCreatorSlot} onDelete={deleteCareer} onSettings={() => setShowLobbySettings(true)} />
      {creatorSlot !== null && <CareerCreator slot={creatorSlot} onCreate={createCareer} onClose={() => setCreatorSlot(null)} />}
      {showLobbySettings && <SettingsView settings={settings} onChange={setSettings} standalone onClose={() => setShowLobbySettings(false)} />}
    </div>;
  }

  if (!fixture) return null;

  return <div className={rootClass}>
    {view === "match" ? <MatchScreen career={career} fixture={fixture} settings={settings} onExit={() => setView("dashboard")} onFinish={(result) => { setLastResult(result); setView("result"); }} />
      : view === "result" ? <ResultScreen career={career} result={lastResult} fixture={fixture} onContinue={continueCareer} />
        : <CareerLayout career={career} view={view} onNavigate={setView} onLobby={() => { setActiveSlot(null); setView("lobby"); }}>
          {view === "dashboard" && <Dashboard career={career} fixture={fixture} onPlay={() => setView("match")} onTrain={train} onNavigate={setView} />}
          {view === "season" && <SeasonView career={career} />}
          {view === "player" && <PlayerView career={career} />}
          {view === "life" && <LifeView career={career} onAction={handleLifeAction} />}
          {view === "market" && <MarketView career={career} onTransfer={transferTo} onHousing={changeHousing} />}
          {view === "settings" && <SettingsView settings={settings} onChange={setSettings} />}
        </CareerLayout>}
    {settings.developerMode && view !== "match" && view !== "result" && <DeveloperPanel career={career} onAction={handleDeveloperAction} />}
  </div>;
}
