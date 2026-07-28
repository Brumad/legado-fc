export type Position = "Atacante" | "Ponta" | "Meia" | "Lateral" | "Zagueiro";
export type MomentKind = "shot" | "pass" | "dribble" | "defense";
export type Foot = "Direito" | "Esquerdo";
export type Archetype = "Maestro" | "Finalizador" | "Velocista" | "Operário" | "Muralha";
export type Difficulty = "Promessa" | "Profissional" | "Lenda";

export type PlayerAttributes = {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
};

export type CareerNews = {
  id: string;
  category: "clube" | "mercado" | "liga" | "pessoal";
  title: string;
  text: string;
  isNew?: boolean;
};

export type CareerState = {
  id: string;
  name: string;
  position: Position;
  origin: string;
  nationality: string;
  foot: Foot;
  archetype: Archetype;
  difficulty: Difficulty;
  age: number;
  shirtNumber: number;
  skinTone: string;
  hairStyle: string;
  clubId: string;
  clubName: string;
  clubShort: string;
  clubColor: string;
  level: number;
  xp: number;
  fans: number;
  matches: number;
  goals: number;
  assists: number;
  rating: number;
  energy: number;
  morale: number;
  recentResults: string[];
  careerSeed: number;
  season: number;
  seasonRound: number;
  seasonMatches: number;
  seasonPoints: number;
  seasonWins: number;
  seasonDraws: number;
  seasonLosses: number;
  seasonGoalsFor: number;
  seasonGoalsAgainst: number;
  cupStage: string;
  preparedForMatch: boolean;
  weeklyAction: string;
  formBoost: number;
  reputation: number;
  marketValue: number;
  contractMatches: number;
  attributes: PlayerAttributes;
  inbox: CareerNews[];
  trophies: string[];
  createdAt: number;
  updatedAt: number;
};

export type Team = {
  id: string;
  name: string;
  short: string;
  color: string;
  accent?: string;
  strength: number;
  stars: string[];
  country: string;
};

export type Fixture = {
  id: string;
  seed: number;
  opponent: Team;
  home: boolean;
  competition: string;
  venue: string;
  weather: string;
  pressure: string;
  round: number;
};

export type MatchEvent = {
  minute: number;
  kind: "normal" | "chance" | "home-goal" | "away-goal" | "card" | "injury";
  text: string;
};

export type MatchTarget = {
  id: string;
  label: string;
  hint: string;
  x: number;
  y: number;
  risk: number;
  roll: number;
  reward: number;
};

export type MatchMoment = {
  id: string;
  minute: number;
  title: string;
  prompt: string;
  kind: MomentKind;
  pressure: "baixa" | "média" | "alta";
  targets: MatchTarget[];
};

export type MatchPlan = {
  signature: string;
  fixture: Fixture;
  events: MatchEvent[];
  moments: MatchMoment[];
  baseHomeGoals: number;
  baseAwayGoals: number;
  intensity: number;
};

export type StandingRow = {
  position: number;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
  isPlayerTeam: boolean;
};

export const PLAYER_TEAM: Team = {
  id: "uniao-azul",
  name: "União Azul",
  short: "UNI",
  color: "#1d75d6",
  accent: "#79b8ff",
  strength: 72,
  stars: ["Caio Vidal", "Ramon Luz", "Léo Bastos"],
  country: "Brasil",
};

export const LEAGUE_TEAMS: Team[] = [
  PLAYER_TEAM,
  { id: "corthias", name: "Corthias", short: "CTH", color: "#202624", accent: "#f2f4ef", strength: 77, stars: ["Iure Arberto", "Memphis Depar", "Rodrigo Garroa"], country: "Brasil" },
  { id: "palmiros", name: "Palmiros", short: "PAL", color: "#117048", accent: "#c7f16a", strength: 82, stars: ["João Ares", "Estevão Vilas", "Viga"], country: "Brasil" },
  { id: "flamenga", name: "Flamenga", short: "FLA", color: "#b52532", accent: "#151918", strength: 84, stars: ["Bruno Herrique", "Arrascaeta", "Pedro Guimar"], country: "Brasil" },
  { id: "santoros", name: "Santoros", short: "SAN", color: "#323936", accent: "#f4f2e9", strength: 71, stars: ["Ney Marinho", "Guilherme Costa", "Tiquinho Soares"], country: "Brasil" },
  { id: "sao-pauli", name: "São Pauli", short: "SPA", color: "#c63c42", accent: "#f2eee6", strength: 76, stars: ["Luciano Neves", "Oscar Junior", "Calleri"], country: "Brasil" },
  { id: "gremial", name: "Grêmial", short: "GRE", color: "#3688bd", accent: "#111817", strength: 74, stars: ["Braite Uait", "Cristaldo", "Pavone"], country: "Brasil" },
  { id: "cruzeiral", name: "Cruzeiral", short: "CRU", color: "#2256a4", accent: "#f5f1e9", strength: 73, stars: ["Kaio Jorge", "Matheus Perera", "Fabrício Bruno"], country: "Brasil" },
  { id: "estrela-preta", name: "Estrela Preta", short: "EPT", color: "#171c1a", accent: "#e7d355", strength: 79, stars: ["Igor Jesua", "Savarino Lima", "Almada Júnior"], country: "Brasil" },
  { id: "vasco-mar", name: "Vasco do Mar", short: "VAS", color: "#343a38", accent: "#d95050", strength: 70, stars: ["Vegeta", "Philippe Couto", "Rayan Rocha"], country: "Brasil" },
  { id: "inter-sul", name: "Inter do Sul", short: "INT", color: "#d64747", accent: "#f4eee4", strength: 75, stars: ["Alan Patrix", "Borré Silva", "Vitão Santos"], country: "Brasil" },
  { id: "bahia-dourada", name: "Bahia Dourada", short: "BAH", color: "#315ea6", accent: "#f1bd45", strength: 72, stars: ["Everton Ribeiroa", "Cauly Souza", "Lucho Rodrígues"], country: "Brasil" },
];

export const WORLD_TEAMS: Team[] = [
  { id: "barsemlona", name: "Barsemlona", short: "BAR", color: "#324c9c", accent: "#d04c54", strength: 88, stars: ["Lamina Jamal", "Rafinha Dias", "Pedro Gonçal"], country: "Espanha" },
  { id: "real-madria", name: "Real Madria", short: "RMA", color: "#ddd9ce", accent: "#7051bd", strength: 90, stars: ["Vini Junior", "Jude Belingam", "Kylian Mbape"], country: "Espanha" },
  { id: "atletica-madri", name: "Atlética Madri", short: "ATM", color: "#ce4141", accent: "#f1eee6", strength: 84, stars: ["Juliano Alvarez", "Antoine Griezma", "Rodrigo de Paula"], country: "Espanha" },
  { id: "manchester-celeste", name: "Manchester Celeste", short: "MCT", color: "#6ca6c8", accent: "#f2e9cf", strength: 87, stars: ["Erling Raland", "Phil Fodem", "Bernardo Silva"], country: "Inglaterra" },
  { id: "liverpul", name: "Liverpul", short: "LIV", color: "#c5303c", accent: "#f2e8d6", strength: 86, stars: ["Mo Salara", "Luis Dias", "Alex Macalister"], country: "Inglaterra" },
  { id: "arsenal-londres", name: "Arsenal de Londres", short: "ARL", color: "#d84747", accent: "#e9d5a7", strength: 85, stars: ["Bukayo Saka", "Martin Odegar", "Gabriel Martinelo"], country: "Inglaterra" },
  { id: "porto-real", name: "Porto Real", short: "POR", color: "#315caa", accent: "#f2eee3", strength: 78, stars: ["Samu Aghewa", "Rodrigo Moraes", "Pepê Aquino"], country: "Portugal" },
  { id: "benfica-luz", name: "Benfica da Luz", short: "BEN", color: "#d53c43", accent: "#f1e8d8", strength: 79, stars: ["Vangelis Pavlido", "Orkun Kokçu", "Antonio Silvas"], country: "Portugal" },
  { id: "sportivo-lisboa", name: "Sportivo Lisboa", short: "SPL", color: "#318252", accent: "#f0eadc", strength: 81, stars: ["Pedro Gonçalo", "Francisco Trinca", "Morten Hjulma"], country: "Portugal" },
];

export const TEAMS = [...LEAGUE_TEAMS.filter((team) => team.id !== PLAYER_TEAM.id), ...WORLD_TEAMS];

const competitions = ["Liga Nacional B", "Copa da União", "Taça Continental", "Copa dos Campeões"];
const weather = ["céu limpo", "chuva leve", "vento forte", "noite fria", "calor intenso", "gramado pesado"];
const pressures = ["jogo de afirmação", "duelo direto", "clássico regional", "vale a liderança", "estreia do treinador", "vaga no mata-mata"];
const venues = ["Arena do Vale", "Estádio Horizonte", "Parque Central", "Caldeirão do Norte", "Campo das Nações", "Arena da Serra"];

export function hashText(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, values: T[]) {
  return values[Math.floor(rng() * values.length)];
}

function uniqueMinutes(rng: () => number, count: number, minimum = 3, maximum = 88) {
  const result = new Set<number>();
  while (result.size < count) result.add(minimum + Math.floor(rng() * (maximum - minimum + 1)));
  return [...result].sort((a, b) => a - b);
}

function fixtureOpponent(career: Pick<CareerState, "careerSeed" | "seasonRound" | "matches">) {
  const opponents = LEAGUE_TEAMS.filter((team) => team.id !== PLAYER_TEAM.id);
  const round = Math.max(1, career.seasonRound || career.matches + 1);
  const cycle = Math.floor((round - 1) / opponents.length);
  const offset = career.careerSeed % opponents.length;
  return opponents[(round - 1 + offset + cycle * 3) % opponents.length];
}

export function createFixture(career: Pick<CareerState, "name" | "matches" | "careerSeed"> & Partial<Pick<CareerState, "seasonRound">>): Fixture {
  const round = career.seasonRound ?? ((career.matches % 22) + 1);
  const seed = hashText(`${career.name}:${career.careerSeed}:${career.matches + 1}:${round}`);
  const rng = makeRng(seed);
  const matchNumber = career.matches + 1;
  const isCup = matchNumber > 2 && matchNumber % 7 === 0;
  const isContinental = career.matches > 10 && matchNumber % 17 === 0;
  const opponent = isContinental ? pick(rng, WORLD_TEAMS) : fixtureOpponent({ ...career, seasonRound: round });
  const competition = isContinental ? competitions[2] : isCup ? competitions[1] : competitions[0];
  return {
    id: `${opponent.id}-${career.matches + 1}-${seed.toString(36)}`,
    seed,
    opponent,
    home: rng() > .4,
    competition,
    venue: pick(rng, venues),
    weather: pick(rng, weather),
    pressure: isCup ? "vaga no mata-mata" : pick(rng, pressures),
    round,
  };
}

function narration(rng: () => number, fixture: Fixture, minute: number): MatchEvent {
  const star = pick(rng, fixture.opponent.stars);
  const templates = [
    `O ${fixture.opponent.name} adianta as linhas e tenta sufocar a saída.`,
    `${star} recebe entre os zagueiros, mas a cobertura chega a tempo.`,
    "A arquibancada sente o momento e aumenta o volume.",
    "O jogo muda de lado rapidamente. Há espaço para contra-atacar.",
    "Uma sequência de passes obriga o bloco defensivo a recuar.",
    "Dividida forte no meio-campo. O árbitro manda seguir.",
    "A bola viaja pela área e ninguém consegue completar.",
    "O treinador pede mais largura e aceleração pelos lados.",
    `Boa triangulação do ${fixture.opponent.name}, interrompida na entrada da área.`,
    "O ritmo cai por alguns instantes; as equipes reorganizam as linhas.",
    "Pressão após a perda recupera a posse ainda no campo ofensivo.",
    `${star} tenta o passe vertical e força uma defesa difícil.`,
    `A torcida do ${fixture.opponent.name} tenta transformar o jogo em pressão.`,
    "O banco se levanta: a próxima disputa pode mudar o roteiro.",
  ];
  const kinds: MatchEvent["kind"][] = ["normal", "normal", "normal", "chance", "normal", "card"];
  return { minute, text: pick(rng, templates), kind: pick(rng, kinds) };
}

function momentTemplates(position: Position, rng: () => number, star: string) {
  const common: Array<Omit<MatchMoment, "id" | "minute" | "targets">> = [
    { title: "Quebre a pressão", prompt: "A marcação saltou. Escolha a saída antes que o espaço desapareça.", kind: "pass", pressure: "média" },
    { title: "Ataque o corredor", prompt: "Há campo livre e dois defensores desalinhados.", kind: "dribble", pressure: "média" },
    { title: "A bola do jogo", prompt: "O goleiro deu um passo. Escolha canto e força.", kind: "shot", pressure: "alta" },
    { title: `Pare ${star}`, prompt: "O craque adversário acelera em direção à área. Antecipe a jogada.", kind: "defense", pressure: "alta" },
    { title: "Último passe", prompt: "Três companheiros atacam a área por caminhos diferentes.", kind: "pass", pressure: "alta" },
    { title: "Segunda bola", prompt: "O rebote cai na entrada da área e a defesa ainda está desorganizada.", kind: "shot", pressure: "média" },
    { title: "Saída sob risco", prompt: "Um passe seguro mantém a posse; um passe vertical desmonta o bloco.", kind: "pass", pressure: "baixa" },
    { title: "Um contra um", prompt: "Você ficou isolado contra o marcador. Decida antes da cobertura.", kind: "dribble", pressure: "alta" },
  ];
  const preferred: Record<Position, MomentKind[]> = {
    Atacante: ["shot", "shot", "dribble", "pass"],
    Ponta: ["dribble", "pass", "shot", "dribble"],
    Meia: ["pass", "pass", "dribble", "shot"],
    Lateral: ["pass", "defense", "dribble", "defense"],
    Zagueiro: ["defense", "defense", "pass", "defense"],
  };
  const kind = pick(rng, preferred[position]);
  return pick(rng, common.filter((item) => item.kind === kind));
}

function targetsFor(kind: MomentKind, rng: () => number): MatchTarget[] {
  const banks: Record<MomentKind, Array<Omit<MatchTarget, "id" | "roll">>> = {
    pass: [
      { label: "Apoio curto", hint: "manter a posse", x: 31, y: 66, risk: .06, reward: 9 },
      { label: "Inversão", hint: "mudar o lado", x: 62, y: 22, risk: .2, reward: 17 },
      { label: "Passe para gol", hint: "romper a linha", x: 79, y: 48, risk: .37, reward: 29 },
    ],
    shot: [
      { label: "Colocada", hint: "canto direito", x: 90, y: 31, risk: .2, reward: 24 },
      { label: "Potência", hint: "alto e forte", x: 94, y: 50, risk: .32, reward: 31 },
      { label: "Rasteira", hint: "canto esquerdo", x: 90, y: 69, risk: .25, reward: 27 },
    ],
    dribble: [
      { label: "Proteger", hint: "esperar apoio", x: 42, y: 67, risk: .08, reward: 10 },
      { label: "Cortar para dentro", hint: "ganhar o centro", x: 65, y: 43, risk: .25, reward: 21 },
      { label: "Partir para cima", hint: "eliminar dois", x: 75, y: 72, risk: .4, reward: 32 },
    ],
    defense: [
      { label: "Conter", hint: "fechar o ângulo", x: 61, y: 56, risk: .08, reward: 11 },
      { label: "Antecipar", hint: "cortar o passe", x: 72, y: 35, risk: .24, reward: 22 },
      { label: "Dar o bote", hint: "recuperar e sair", x: 78, y: 62, risk: .39, reward: 33 },
    ],
  };
  return banks[kind].map((target, index) => ({
    ...target,
    id: `${kind}-${index}-${Math.floor(rng() * 99999)}`,
    roll: rng(),
  }));
}

function attributeForMoment(career: CareerState, kind: MomentKind) {
  const attribute = {
    shot: career.attributes.shooting,
    pass: career.attributes.passing,
    dribble: career.attributes.dribbling,
    defense: career.attributes.defending,
  }[kind];
  return (attribute - 65) / 1000;
}

export function generateMatchPlan(career: CareerState, fixture = createFixture(career)): MatchPlan {
  const rng = makeRng(fixture.seed ^ hashText(`${career.position}:${career.archetype}`));
  const overall = Object.values(career.attributes).reduce((total, value) => total + value, 0) / 6;
  const strengthGap = fixture.opponent.strength - (66 + career.level * 1.4 + overall * .08 + career.formBoost);
  const intensity = .75 + rng() * .65;
  const eventCount = 12 + Math.floor(rng() * 10);
  const momentCount = 3 + Math.floor(rng() * 5);
  const eventMinutes = uniqueMinutes(rng, eventCount);
  const momentMinutes = uniqueMinutes(rng, momentCount, 7, 87);

  const expectedAgainst = Math.max(.15, 1.05 + strengthGap / 18 + (rng() - .5) * 1.4);
  const expectedFor = Math.max(.15, 1.28 - strengthGap / 24 + (rng() - .5) * 1.65);
  const baseAwayGoals = Math.min(5, Math.floor(expectedAgainst) + (rng() < expectedAgainst % 1 ? 1 : 0));
  const baseHomeGoals = Math.min(5, Math.floor(expectedFor) + (rng() < expectedFor % 1 ? 1 : 0));

  const goalMinutesFor = new Set(uniqueMinutes(rng, baseHomeGoals, 5, 88));
  const goalMinutesAgainst = new Set(uniqueMinutes(rng, baseAwayGoals, 5, 88));
  const allEventMinutes = [...new Set([...eventMinutes, ...goalMinutesFor, ...goalMinutesAgainst])].sort((a, b) => a - b);
  const events = allEventMinutes.map((minute) => {
    if (goalMinutesFor.has(minute)) {
      return { minute, kind: "home-goal" as const, text: pick(rng, [
        `GOL DO ${career.clubName.toUpperCase()}! A jogada nasce numa recuperação alta.`,
        "A rede balança! Cruzamento preciso e cabeceio sem defesa.",
        "GOLAÇO! Finalização de fora da área muda o placar.",
        "Tabela curta, invasão da área e chute no canto. É gol!",
      ]) };
    }
    if (goalMinutesAgainst.has(minute)) {
      const scorer = pick(rng, fixture.opponent.stars);
      return { minute, kind: "away-goal" as const, text: `Gol do ${fixture.opponent.name}. ${scorer} aproveita o espaço e finaliza.` };
    }
    return narration(rng, fixture, minute);
  });

  const moments = momentMinutes.map((minute, index) => {
    const template = momentTemplates(career.position, rng, pick(rng, fixture.opponent.stars));
    const targets = targetsFor(template.kind, rng).map((target) => ({
      ...target,
      roll: Math.max(0, target.roll - attributeForMoment(career, template.kind)),
    }));
    return {
      ...template,
      id: `${fixture.id}-m${index}-${minute}`,
      minute,
      targets,
    };
  });

  const fingerprint = hashText(JSON.stringify({
    f: fixture.id,
    a: career.archetype,
    e: events.map((event) => [event.minute, event.kind]),
    m: moments.map((moment) => [moment.minute, moment.kind, moment.targets.map((target) => target.roll.toFixed(5))]),
  })).toString(36);

  return {
    signature: `JOGO-${career.matches + 1}-${fingerprint.toUpperCase()}`,
    fixture,
    events,
    moments,
    baseHomeGoals,
    baseAwayGoals,
    intensity,
  };
}

const archetypeAttributes: Record<Archetype, PlayerAttributes> = {
  Maestro: { pace: 68, shooting: 66, passing: 76, dribbling: 73, defending: 55, physical: 62 },
  Finalizador: { pace: 70, shooting: 78, passing: 60, dribbling: 69, defending: 45, physical: 68 },
  Velocista: { pace: 80, shooting: 67, passing: 63, dribbling: 76, defending: 49, physical: 61 },
  Operário: { pace: 67, shooting: 61, passing: 69, dribbling: 64, defending: 70, physical: 74 },
  Muralha: { pace: 58, shooting: 48, passing: 63, dribbling: 55, defending: 79, physical: 80 },
};

export function createInitialAttributes(archetype: Archetype, position: Position) {
  const base = { ...archetypeAttributes[archetype] };
  if (position === "Atacante") base.shooting += 3;
  if (position === "Ponta") { base.pace += 2; base.dribbling += 2; }
  if (position === "Meia") base.passing += 3;
  if (position === "Lateral") { base.pace += 1; base.defending += 2; }
  if (position === "Zagueiro") { base.defending += 3; base.physical += 2; }
  return base;
}

export function getOverall(career: Pick<CareerState, "attributes">) {
  return Math.round(Object.values(career.attributes).reduce((total, value) => total + value, 0) / 6);
}

export function generateStandings(career: CareerState): StandingRow[] {
  const rng = makeRng(hashText(`table:${career.careerSeed}:${career.season}:${career.seasonMatches}`));
  const played = Math.min(22, career.seasonMatches);
  const rows = LEAGUE_TEAMS.map((team) => {
    if (team.id === career.clubId) {
      return {
        position: 0,
        team,
        played,
        wins: career.seasonWins,
        draws: career.seasonDraws,
        losses: career.seasonLosses,
        goalsFor: career.seasonGoalsFor,
        goalsAgainst: career.seasonGoalsAgainst,
        goalDifference: career.seasonGoalsFor - career.seasonGoalsAgainst,
        points: career.seasonPoints,
        form: career.recentResults.slice(0, 5).map((result) => result[0]),
        isPlayerTeam: true,
      };
    }
    const strengthBias = (team.strength - 70) / 18;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    const form: string[] = [];
    for (let game = 0; game < played; game += 1) {
      const roll = rng() + strengthBias * .26;
      const result = roll > .61 ? "V" : roll > .32 ? "E" : "D";
      form.unshift(result);
      if (result === "V") wins += 1;
      if (result === "E") draws += 1;
      if (result === "D") losses += 1;
      goalsFor += Math.max(0, Math.floor(rng() * 3.5 + strengthBias));
      goalsAgainst += Math.max(0, Math.floor(rng() * 3.1 - strengthBias * .4));
    }
    return {
      position: 0,
      team,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: wins * 3 + draws,
      form: form.slice(0, 5),
      isPlayerTeam: false,
    };
  });
  return rows
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export function buildCareerNews(career: CareerState, fixture: Fixture): CareerNews[] {
  const table = generateStandings(career);
  const playerPosition = table.find((row) => row.isPlayerTeam)?.position ?? 1;
  const marketTeam = WORLD_TEAMS[(career.matches + career.careerSeed) % WORLD_TEAMS.length];
  const opponentStar = fixture.opponent.stars[fixture.seed % fixture.opponent.stars.length];
  return [
    {
      id: `club-${career.matches}`,
      category: "clube",
      title: playerPosition <= 4 ? "Clube entra na briga pelo acesso" : "Treinador cobra reação",
      text: `${career.clubName} ocupa a ${playerPosition}ª posição e prepara um plano específico para o ${fixture.opponent.name}.`,
      isNew: true,
    },
    {
      id: `market-${career.matches}`,
      category: "mercado",
      title: `${marketTeam.name} envia observador`,
      text: `O clube acompanha ${career.name}. Reputação ${career.reputation} e nota média ${career.rating.toFixed(1)} pesam no relatório.`,
    },
    {
      id: `league-${career.matches}`,
      category: "liga",
      title: `${opponentStar} é a ameaça da rodada`,
      text: `A comissão destaca a movimentação do principal nome do ${fixture.opponent.name}.`,
    },
  ];
}

export function migrateCareer(input: Partial<CareerState> | null): CareerState {
  const now = Date.now();
  const archetype = input?.archetype ?? "Maestro";
  const position = input?.position ?? "Meia";
  return {
    id: input?.id ?? `career-${hashText(`${input?.name ?? "Alex Silva"}:${now}`).toString(36)}`,
    name: input?.name ?? "Alex Silva",
    position,
    origin: input?.origin ?? "Clube de bairro",
    nationality: input?.nationality ?? "Brasil",
    foot: input?.foot ?? "Direito",
    archetype,
    difficulty: input?.difficulty ?? "Profissional",
    age: input?.age ?? 18,
    shirtNumber: input?.shirtNumber ?? 18,
    skinTone: input?.skinTone ?? "#b97850",
    hairStyle: input?.hairStyle ?? "Curto",
    clubId: input?.clubId ?? PLAYER_TEAM.id,
    clubName: input?.clubName ?? PLAYER_TEAM.name,
    clubShort: input?.clubShort ?? PLAYER_TEAM.short,
    clubColor: input?.clubColor ?? PLAYER_TEAM.color,
    level: input?.level ?? 1,
    xp: input?.xp ?? 35,
    fans: input?.fans ?? 1280,
    matches: input?.matches ?? 0,
    goals: input?.goals ?? 0,
    assists: input?.assists ?? 0,
    rating: input?.rating ?? 6.8,
    energy: input?.energy ?? 86,
    morale: input?.morale ?? 74,
    recentResults: input?.recentResults ?? [],
    careerSeed: input?.careerSeed ?? hashText(`${input?.name ?? "Alex Silva"}:${now}`),
    season: input?.season ?? 2026,
    seasonRound: input?.seasonRound ?? 1,
    seasonMatches: input?.seasonMatches ?? 0,
    seasonPoints: input?.seasonPoints ?? 0,
    seasonWins: input?.seasonWins ?? 0,
    seasonDraws: input?.seasonDraws ?? 0,
    seasonLosses: input?.seasonLosses ?? 0,
    seasonGoalsFor: input?.seasonGoalsFor ?? 0,
    seasonGoalsAgainst: input?.seasonGoalsAgainst ?? 0,
    cupStage: input?.cupStage ?? "Primeira fase",
    preparedForMatch: input?.preparedForMatch ?? false,
    weeklyAction: input?.weeklyAction ?? "Nenhuma",
    formBoost: input?.formBoost ?? 0,
    reputation: input?.reputation ?? 12,
    marketValue: input?.marketValue ?? 450000,
    contractMatches: input?.contractMatches ?? 22,
    attributes: input?.attributes ?? createInitialAttributes(archetype, position),
    inbox: input?.inbox ?? [],
    trophies: input?.trophies ?? [],
    createdAt: input?.createdAt ?? now,
    updatedAt: input?.updatedAt ?? now,
  };
}
