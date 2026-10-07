"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  type Archetype,
  type CareerState,
  type CountryId,
  COUNTRIES,
  type Difficulty,
  type DivisionLevel,
  type Foot,
  ORIGINS,
  type OriginType,
  type Position,
  getLeagueDefinition,
  getOverall,
  getSalary,
  getStartingClub,
  hashText,
  migrateCareer,
} from "./game-engine.ts";
import { PlayerAvatar } from "./player-avatar.tsx";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function TeamCrest({ short, color }: { short: string; color: string }) {
  return <span className="team-crest is-small" style={{ "--crest-color": color } as React.CSSProperties}>{short}</span>;
}

function OptionPill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className={`option-pill ${active ? "is-active" : ""}`} onClick={onClick}>{children}</button>;
}

const positionInfo: Array<{ id: Position; icon: string; text: string }> = [
  { id: "Atacante", icon: "◎", text: "Finalização e presença na área" },
  { id: "Ponta", icon: "↯", text: "Velocidade, drible e amplitude" },
  { id: "Meia", icon: "◇", text: "Passe, visão e criação" },
  { id: "Lateral", icon: "↗", text: "Apoio, fôlego e marcação" },
  { id: "Zagueiro", icon: "⬢", text: "Defesa, físico e cobertura" },
];

const archetypeInfo: Record<Archetype, string> = {
  Maestro: "Controle, passe e leitura de jogo.",
  Finalizador: "Chute, presença ofensiva e decisão.",
  Velocista: "Arranque, drible e ataque ao espaço.",
  Operário: "Equilíbrio, intensidade e trabalho coletivo.",
  Muralha: "Defesa, físico e imposição nos duelos.",
};

const difficultyInfo: Record<Difficulty, { title: string; text: string }> = {
  Promessa: { title: "Mais acessível", text: "IA reage com mais calma e pressiona menos." },
  Profissional: { title: "Equilibrada", text: "Ritmo competitivo sem bônus artificiais." },
  Lenda: { title: "Exigente", text: "IA reage mais rápido, ocupa melhor os espaços e pune erros." },
};

const attributeLabels: Array<[keyof CareerState["attributes"], string]> = [
  ["pace", "VEL"],
  ["shooting", "FIN"],
  ["passing", "PAS"],
  ["dribbling", "DRI"],
  ["defending", "DEF"],
  ["physical", "FIS"],
];

export function CareerCreator({
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
  const [hairColor, setHairColor] = useState("#171917");
  const [facialHair, setFacialHair] = useState("Sem barba");
  const [faceShape, setFaceShape] = useState("Oval");

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
    hairColor,
    facialHair,
    faceShape,
  }), [name, position, origin, nationality, countryId, selectedCountry.name, division, selectedLeague.id, selectedLeague.name, selectedClub, foot, archetype, difficulty, age, shirtNumber, skinTone, hairStyle, hairColor, facialHair, faceShape]);

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
    <div className="creator-backdrop creator-v053">
      <section className="creator-window" role="dialog" aria-modal="true" aria-labelledby="creator-title">
        <aside className="creator-preview">
          <button className="creator-close light" onClick={onClose} aria-label="Fechar criação">←</button>
          <div className="creator-preview-top">
            <span className="overline">NOVO ATLETA · SLOT 0{slot + 1}</span>
            <strong>LEGADO FC <b>0.5.4</b></strong>
          </div>
          <div className="preview-stage">
            <div className="preview-spotlight" />
            <PlayerAvatar career={preview} large />
            <span className="preview-shirt">{shirtNumber}</span>
          </div>
          <div className="preview-name">
            <small>{position.toUpperCase()} · {foot.toUpperCase()} · {archetype.toUpperCase()}</small>
            <h2>{name.trim() || "NOVO TALENTO"}</h2>
            <span>{selectedCountry.flag} {selectedLeague.name} · OVR {getOverall(preview)}</span>
          </div>
          <div className="creator-attribute-preview" aria-label="Atributos iniciais">
            {attributeLabels.map(([key, label]) => <div key={key}>
              <span>{label}</span>
              <i><em style={{ width: `${preview.attributes[key]}%` }} /></i>
              <strong>{preview.attributes[key]}</strong>
            </div>)}
          </div>
          <div className="preview-club"><TeamCrest short={selectedClub.short} color={selectedClub.color} /><div><small>CONTRATO INICIAL · FORÇA {selectedClub.strength}</small><strong>{selectedClub.name}</strong><span>{money(getSalary(countryId, division))}/mês</span></div></div>
        </aside>

        <div className="creator-form-pane">
          <button className="creator-close" onClick={onClose} aria-label="Fechar criação">×</button>
          <span className="step-label">CRIE SEU ATLETA</span>
          <h1 id="creator-title">Sua carreira começa<br />antes do primeiro toque.</h1>
          <div className="creator-step-summary" aria-label="Etapas da criação">
            <span><b>01</b> Identidade</span><span><b>02</b> Destino</span><span><b>03</b> Jogo</span><span><b>04</b> Visual</span>
          </div>

          <form onSubmit={submit}>
            <div className="creator-section">
              <div className="creator-section-title"><span>01</span><div><strong>Identidade</strong><small>Nome, idade, nacionalidade e camisa</small></div></div>
              <label className="field-label">Nome do jogador<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Silva" maxLength={24} autoFocus /></label>
              <div className="field-grid three">
                <label className="field-label">Idade<input type="number" min="16" max="23" value={age} onChange={(event) => setAge(Number(event.target.value))} /></label>
                <label className="field-label">Nacionalidade<select value={nationality} onChange={(event) => setNationality(event.target.value)}>{COUNTRIES.map((country) => <option key={country.id}>{country.name}</option>)}<option>Colômbia</option><option>Uruguai</option></select></label>
                <label className="field-label">Camisa<input type="number" min="1" max="99" value={shirtNumber} onChange={(event) => setShirtNumber(Number(event.target.value))} /></label>
              </div>
            </div>

            <div className="creator-section">
              <div className="creator-section-title"><span>02</span><div><strong>Onde tudo começa</strong><small>Todos os 12 países devem permanecer acessíveis</small></div></div>
              <div className="country-choice-meta"><span>PAÍS DA LIGA</span><strong>{COUNTRIES.length}/12 disponíveis</strong></div>
              <div className="country-choice-shell" tabIndex={0} aria-label="Escolha entre os 12 países">
                <div className="country-choice-grid">
                  {COUNTRIES.map((country) => (
                    <button type="button" className={`country-choice ${countryId === country.id ? "is-active" : ""}`} onClick={() => setCountryId(country.id)} key={country.id}>
                      <span>{country.flag}</span><div><strong>{country.name}</strong><small>{country.style}</small></div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="division-choice">
                <button type="button" className={division === 2 ? "is-active" : ""} onClick={() => setDivision(2)}><span>CAMINHO DA ASCENSÃO</span><strong>{selectedCountry.leagues[1].name}</strong><small>Construa seu nome desde baixo</small></button>
                <button type="button" className={division === 1 ? "is-active" : ""} onClick={() => setDivision(1)}><span>DESAFIO DA ELITE</span><strong>{selectedCountry.leagues[0].name}</strong><small>Mais salário, pressão e risco</small></button>
              </div>
              <div className="origin-choice-grid">
                {ORIGINS.map((item) => (
                  <button type="button" className={origin === item.id ? "is-active" : ""} onClick={() => setOrigin(item.id)} key={item.id}>
                    <strong>{item.id}</strong><small>{item.description}</small>
                  </button>
                ))}
              </div>
              <div className="starting-contract"><TeamCrest short={selectedClub.short} color={selectedClub.color} /><div><small>CONTRATO INICIAL</small><strong>{selectedClub.name}</strong><span>{money(getSalary(countryId, division))}/mês · {selectedLeague.name}</span></div></div>
            </div>

            <div className="creator-section">
              <div className="creator-section-title"><span>03</span><div><strong>Perfil de jogo</strong><small>Posição, pé dominante e arquétipo moldam os atributos</small></div></div>
              <div className="creator-position-grid">
                {positionInfo.map((item) => <button type="button" className={position === item.id ? "is-active" : ""} onClick={() => setPosition(item.id)} key={item.id}><span>{item.icon}</span><strong>{item.id}</strong><small>{item.text}</small></button>)}
              </div>
              <div className="choice-row" aria-label="Pé dominante"><span>PÉ DOMINANTE</span><div><OptionPill active={foot === "Direito"} onClick={() => setFoot("Direito")}>Direito</OptionPill><OptionPill active={foot === "Esquerdo"} onClick={() => setFoot("Esquerdo")}>Esquerdo</OptionPill></div></div>
              <div className="archetype-grid creator-archetypes">
                {(["Maestro", "Finalizador", "Velocista", "Operário", "Muralha"] as Archetype[]).map((item) => (
                  <button type="button" className={`archetype-card ${archetype === item ? "is-active" : ""}`} onClick={() => setArchetype(item)} key={item}>
                    <span>{item === "Maestro" ? "◎" : item === "Finalizador" ? "◉" : item === "Velocista" ? "↯" : item === "Operário" ? "◆" : "⬢"}</span>
                    <strong>{item}</strong><small>{archetypeInfo[item]}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="creator-section appearance-section">
              <div className="creator-section-title"><span>04</span><div><strong>Aparência e desafio</strong><small>Crie uma identidade visual e escolha o nível da IA</small></div></div>
              <div className="creator-appearance-grid">
                <div className="creator-appearance-card"><span>ROSTO</span><div className="segmented mini">{["Oval","Quadrado","Angular"].map((item) => <button type="button" className={faceShape === item ? "is-active" : ""} onClick={() => setFaceShape(item)} key={item}>{item}</button>)}</div></div>
                <div className="creator-appearance-card"><span>PELE</span><div className="swatches">{["#f2c5a0","#d89a70","#b97850","#8b573d","#5e382b","#3e241d"].map((tone) => <button type="button" aria-label={`Tom de pele ${tone}`} className={skinTone === tone ? "is-active" : ""} style={{ background: tone }} onClick={() => setSkinTone(tone)} key={tone} />)}</div></div>
                <div className="creator-appearance-card"><span>CABELO</span><select value={hairStyle} onChange={(event) => setHairStyle(event.target.value)}>{["Curto","Raspado","Cacheado","Tranças","Moicano","Ondulado"].map((item)=><option key={item}>{item}</option>)}</select></div>
                <div className="creator-appearance-card"><span>COR DO CABELO</span><div className="swatches hair-swatches">{["#171917","#3a261d","#6b452f","#9b6d3f","#d6b27a"].map((tone) => <button type="button" aria-label={`Cor de cabelo ${tone}`} className={hairColor === tone ? "is-active" : ""} style={{ background: tone }} onClick={() => setHairColor(tone)} key={tone} />)}</div></div>
                <div className="creator-appearance-card"><span>BARBA</span><select value={facialHair} onChange={(event) => setFacialHair(event.target.value)}><option>Sem barba</option><option>Barba curta</option><option>Bigode</option></select></div>
              </div>

              <div className="creator-difficulty-grid">
                {(["Promessa","Profissional","Lenda"] as Difficulty[]).map((item) => <button type="button" className={difficulty === item ? "is-active" : ""} onClick={() => setDifficulty(item)} key={item}><span>{item}</span><strong>{difficultyInfo[item].title}</strong><small>{difficultyInfo[item].text}</small></button>)}
              </div>
            </div>

            <div className="create-career-wrap">
              <div><small>PRONTO PARA COMEÇAR</small><strong>{selectedCountry.flag} {selectedClub.name} · {position} · {difficulty}</strong></div>
              <button className="create-career-button" type="submit"><span>INICIAR CARREIRA</span><b>Entrar na {selectedLeague.name} →</b></button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
