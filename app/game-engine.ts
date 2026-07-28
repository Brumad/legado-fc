export type Position = "Atacante" | "Ponta" | "Meia" | "Lateral" | "Zagueiro";
export type MomentKind = "shot" | "pass" | "dribble" | "defense";

export type CareerState = {
  name: string;
  position: Position;
  origin: string;
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
};

export type Team = {
  id: string;
  name: string;
  short: string;
  color: string;
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

export const TEAMS: Team[] = [
  { id: "corthias", name: "Corthias", short: "CTH", color: "#191d1b", strength: 77, stars: ["Iure Arberto", "Memphis Depar", "Rodrigo Garroa"], country: "Brasil" },
  { id: "palmiros", name: "Palmiros", short: "PAL", color: "#147346", strength: 82, stars: ["João Ares", "Estevão Vilas", "Viga"], country: "Brasil" },
  { id: "Flamenga", name: "Flamenga", short: "FLA", color: "#b8272d", strength: 84, stars: ["Bruno Herrique", "Arrascaeta", "Pedro Guimar"], country: "Brasil" },
  { id: "santoros", name: "Santoros", short: "SAN", color: "#252a28", strength: 71, stars: ["Ney Marinho", "Guilherme Costa", "Tiquinho Soares"], country: "Brasil" },
  { id: "sao-pauli", name: "São Pauli", short: "SPA", color: "#c93b3b", strength: 76, stars: ["Luciano Neves", "Oscar Junior", "Calleri"], country: "Brasil" },
  { id: "gremial", name: "Grêmial", short: "GRE", color: "#3f8fc2", strength: 74, stars: ["Braite Uait", "Cristaldo", "Pavone"], country: "Brasil" },
  { id: "barsemlona", name: "Barsemlona", short: "BAR", color: "#324c9c", strength: 88, stars: ["Lamina Jamal", "Rafinha Dias", "Pedro Gonçal"], country: "Espanha" },
  { id: "real-madria", name: "Real Madria", short: "RMA", color: "#dbd9d0", strength: 90, stars: ["Vini Junior", "Jude Belingam", "Kylian Mbape"], country: "Espanha" },
  { id: "atletica-madri", name: "Atlética Madri", short: "ATM", color: "#ce4141", strength: 84, stars: ["Juliano Alvarez", "Antoine Griezma", "Rodrigo de Paula"], country: "Espanha" },
  { id: "manchester-celeste", name: "Manchester Celeste", short: "MCT", color: "#6ca6c8", strength: 87, stars: ["Erling Raland", "Phil Fodem", "Bernardo Silva"], country: "Inglaterra" },
  { id: "liverpul", name: "Liverpul", short: "LIV", color: "#c5303c", strength: 86, stars: ["Mo Salara", "Luis Dias", "Alex Macalister"], country: "Inglaterra" },
  { id: "arsenal-londres", name: "Arsenal de Londres", short: "ARL", color: "#d84747", strength: 85, stars: ["Bukayo Saka", "Martin Odegar", "Gabriel Martinelo"], country: "Inglaterra" },
  { id: "porto-real", name: "Porto Real", short: "POR", color: "#315caa", strength: 78, stars: ["Samu Aghewa", "Rodrigo Moraes", "Pepê Aquino"], country: "Portugal" },
  { id: "benfica-luz", name: "Benfica da Luz", short: "BEN", color: "#d53c43", strength: 79, stars: ["Vangelis Pavlido", "Orkun Kokçu", "Antonio Silvas"], country: "Portugal" },
  { id: "sportivo-lisboa", name: "Sportivo Lisboa", short: "SPL", color: "#318252", strength: 81, stars: ["Pedro Gonçalo", "Francisco Trinca", "Morten Hjulma"], country: "Portugal" },
];

const competitions = ["Liga Nacional B", "Copa da União", "Taça Continental", "Copa dos Campeões"];
const weather = ["céu limpo", "chuva leve", "vento forte", "noite fria", "calor intenso", "gramado pesado"];
const pressures = ["jogo de afirmação", "duelo direto", "clássico regional", "vale a liderança", "estreia do treinador", "vaga no mata-mata"];
const venues = ["Arena do Vale", "Estádio Horizonte", "Parque Central", "Caldeirão do Norte", "Campo das Nações", "Arena da Luz Verde"];

function hashText(text: string) {
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

export function createFixture(career: Pick<CareerState, "name" | "matches" | "careerSeed">): Fixture {
  const seed = hashText(`${career.name}:${career.careerSeed}:${career.matches + 1}`);
  const rng = makeRng(seed);
  const opponent = TEAMS[Math.floor(rng() * TEAMS.length)];
  const competition = career.matches % 7 === 6 ? pick(rng, competitions.slice(1)) : competitions[0];
  return {
    id: `${opponent.id}-${career.matches + 1}-${seed.toString(36)}`,
    seed,
    opponent,
    home: rng() > .38,
    competition,
    venue: pick(rng, venues),
    weather: pick(rng, weather),
    pressure: pick(rng, pressures),
    round: (career.matches % 38) + 1,
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

export function generateMatchPlan(career: CareerState, fixture = createFixture(career)): MatchPlan {
  const rng = makeRng(fixture.seed ^ hashText(career.position));
  const strengthGap = fixture.opponent.strength - (68 + career.level * 2);
  const intensity = .75 + rng() * .65;
  const eventCount = 11 + Math.floor(rng() * 9);
  const momentCount = 2 + Math.floor(rng() * 5);
  const eventMinutes = uniqueMinutes(rng, eventCount);
  const momentMinutes = uniqueMinutes(rng, momentCount, 7, 87);

  const expectedAgainst = Math.max(.15, 1.05 + strengthGap / 18 + (rng() - .5) * 1.4);
  const expectedFor = Math.max(.15, 1.25 - strengthGap / 24 + (rng() - .5) * 1.6);
  const baseAwayGoals = Math.min(5, Math.floor(expectedAgainst) + (rng() < expectedAgainst % 1 ? 1 : 0));
  const baseHomeGoals = Math.min(5, Math.floor(expectedFor) + (rng() < expectedFor % 1 ? 1 : 0));

  const goalMinutesFor = new Set(uniqueMinutes(rng, baseHomeGoals, 5, 88));
  const goalMinutesAgainst = new Set(uniqueMinutes(rng, baseAwayGoals, 5, 88));
  const allEventMinutes = [...new Set([...eventMinutes, ...goalMinutesFor, ...goalMinutesAgainst])].sort((a, b) => a - b);
  const events = allEventMinutes.map((minute) => {
    if (goalMinutesFor.has(minute)) {
      return { minute, kind: "home-goal" as const, text: pick(rng, [
        "GOL DO UNIÃO AZUL! A jogada nasce numa recuperação alta.",
        "A rede balança! Cruzamento preciso e cabeceio sem defesa.",
        "GOLAÇO! Finalização de fora da área muda o placar.",
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
    return {
      ...template,
      id: `${fixture.id}-m${index}-${minute}`,
      minute,
      targets: targetsFor(template.kind, rng),
    };
  });

  const fingerprint = hashText(JSON.stringify({
    f: fixture.id, e: events.map((e) => [e.minute, e.kind]),
    m: moments.map((m) => [m.minute, m.kind, m.targets.map((t) => t.roll.toFixed(5))]),
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

export function migrateCareer(input: Partial<CareerState> | null): CareerState {
  return {
    name: input?.name ?? "Alex Silva",
    position: input?.position ?? "Meia",
    origin: input?.origin ?? "Clube de bairro",
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
    careerSeed: input?.careerSeed ?? hashText(`${input?.name ?? "Alex Silva"}:${Date.now()}`),
  };
}
