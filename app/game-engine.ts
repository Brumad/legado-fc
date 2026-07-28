export type Position = "Atacante" | "Ponta" | "Meia" | "Lateral" | "Zagueiro";
export type MomentKind = "shot" | "pass" | "dribble" | "defense" | "freeKick" | "corner" | "penalty" | "counter" | "aerial";
export type Foot = "Direito" | "Esquerdo";
export type Archetype = "Maestro" | "Finalizador" | "Velocista" | "Operário" | "Muralha";
export type Difficulty = "Promessa" | "Profissional" | "Lenda";
export type CountryId = "BR" | "AR" | "PT" | "EN" | "ES" | "IT" | "DE" | "FR" | "NL" | "MX" | "US" | "JP";
export type DivisionLevel = 1 | 2;
export type OriginType = "Clube de bairro" | "Academia regional" | "Futebol escolar" | "Projeto social" | "Sem clube";

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
  origin: OriginType;
  nationality: string;
  countryId: CountryId;
  countryName: string;
  division: DivisionLevel;
  leagueId: string;
  leagueName: string;
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
  clubStrength: number;
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
  currentDate: string;
  nextMatchDate: string;
  daysUntilMatch: number;
  preparationActionsAllowed: number;
  preparationActionsUsed: number;
  preparationLog: string[];
  formBoost: number;
  reputation: number;
  marketValue: number;
  salary: number;
  bankBalance: number;
  monthlyExpenses: number;
  housing: string;
  language: string;
  languageLevel: number;
  adaptation: number;
  coachTrust: number;
  contractMatches: number;
  promotions: number;
  relegations: number;
  lastSeasonSummary: string;
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
  countryId: CountryId;
  division: DivisionLevel;
};

export type LeagueDefinition = {
  id: string;
  name: string;
  countryId: CountryId;
  countryName: string;
  division: DivisionLevel;
  salaryBase: number;
  teams: Team[];
};

export type CountryDefinition = {
  id: CountryId;
  name: string;
  flag: string;
  style: string;
  currencyLabel: string;
  language: string;
  costOfLiving: number;
  leagues: [LeagueDefinition, LeagueDefinition];
};

export type Fixture = {
  id: string;
  seed: number;
  opponent: Team;
  home: boolean;
  competition: string;
  competitionType: "league" | "cup" | "continental";
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
  expectedHomeGoals: number;
  expectedAwayGoals: number;
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

const COLORS = [
  ["#1d75d6", "#79b8ff"], ["#b52532", "#f3d7d8"], ["#117048", "#c7f16a"],
  ["#d49a24", "#fff0b6"], ["#41378f", "#b8adff"], ["#222a28", "#f4f2e9"],
  ["#b75b2a", "#ffe1c7"], ["#317b83", "#c8fbff"], ["#75472d", "#f5cfaf"],
  ["#8c2e69", "#ffc6ec"], ["#315ea6", "#f1bd45"], ["#5f7b36", "#d8efac"],
];

const STAR_POOLS: Record<CountryId, string[]> = {
  BR: ["Caio Vidal", "Ramon Luz", "Léo Bastos", "Iure Arberto", "João Ares", "Davi Nobre", "Mateus Serra", "Renan Valente"],
  AR: ["Tomás Ferreyra", "Lautaro Vega", "Nico Peralta", "Santiago Ríos", "Facundo Paz", "Bruno Almada", "Julián Sosa", "Matías Luna"],
  PT: ["Tiago Neves", "Afonso Luz", "Diogo Serra", "Tomé Pires", "Gonçalo Vale", "Rui Miranda", "Leandro Matos", "Nuno Rocha"],
  EN: ["Oliver Grant", "Ethan Cole", "Jamie Rivers", "Noah Brooks", "Leo Turner", "Mason Hill", "Jack Palmer", "Theo Ward"],
  ES: ["Iker Montes", "Pablo Sierra", "Álvaro Roca", "Hugo León", "Nico Valdés", "Dani Cobo", "Mario Soler", "Sergio Vidal"],
  IT: ["Luca Moretti", "Matteo Romano", "Enzo Ricci", "Marco Bellini", "Davide Conti", "Nico Gallo", "Pietro Serra", "Tommaso Greco"],
  DE: ["Lukas Adler", "Jonas Weber", "Felix Hartmann", "Leon Bauer", "Noah Klein", "Max Vogel", "Elias Wolf", "Finn Krüger"],
  FR: ["Lucas Moreau", "Hugo Laurent", "Enzo Dubois", "Mathis Bernard", "Theo Girard", "Noah Mercier", "Jules Petit", "Adam Fontaine"],
  NL: ["Daan de Wit", "Sem Bakker", "Luuk Smit", "Finn Visser", "Bram Bos", "Mees Dekker", "Jesse Mulder", "Thijs Vos"],
  MX: ["Santiago Cruz", "Mateo Reyes", "Diego Navarro", "Emilio Rojas", "Gael Mendoza", "Iván Salgado", "Bruno Luna", "Ángel Paredes"],
  US: ["Liam Carter", "Mason Reed", "Ethan Walker", "Noah Bennett", "Logan Cooper", "Caleb Foster", "Owen Brooks", "Aiden Parker"],
  JP: ["Haruto Sato", "Ren Takahashi", "Yuto Nakamura", "Sora Kobayashi", "Kaito Ito", "Riku Yamamoto", "Hinata Watanabe", "Daiki Mori"],
};

const TEAM_NAMES: Record<CountryId, { first: string[]; second: string[] }> = {
  BR: {
    first: ["Corthias", "Palmiros", "Flamenga", "Santoros", "São Pauli", "Grêmial", "Cruzeiral", "Estrela Preta", "Vasco do Mar", "Inter do Sul", "Bahia Dourada", "Fortaleza Real"],
    second: ["Vila Esperança FC", "Academia do Vale", "Colégio União", "Projeto Horizonte", "Atlético da Ponte", "União Azul", "Real da Serra", "Ferroviário Central", "Operário Verde", "Nação do Norte", "Clube do Cerrado", "Estrela do Litoral"],
  },
  AR: {
    first: ["Buenos Aires Rojo", "Millonários del Plata", "Boca del Puerto", "Racing de Plata", "San Lorenzo Sur", "Independente Roja", "Rosario Centralo", "Vélez Serrano", "Estudiantes del Lago", "Talleres Córdoba", "Lanús Unido", "Newell del Parque"],
    second: ["Barrio del Sol", "Academia Porteña", "Instituto Central", "Jóvenes Unidos", "Deportivo Puente", "Unión Pampeana", "Ferro del Oeste", "Atlético Mendonza", "Club del Bosque", "Estrella Patagónica", "Huracán Norte", "Río Segundo"],
  },
  PT: {
    first: ["Lisboa Verde", "Benfica da Luz", "Porto Real", "Braga Guerreira", "Vitória Guimar", "Boavista Norte", "Famalicão Azul", "Estoril Dourado", "Casa Pia Real", "Rio Aveiro", "Moreira Cônego", "Santa Clara Ilha"],
    second: ["Bairro do Tejo", "Academia da Serra", "Colégio Lusitano", "Projeto Navegantes", "Atlético Ribeira", "União de Coimbra", "Estrela do Minho", "Marítimo Funchal", "Leiria Central", "Viseu Real", "Torreense Azul", "Oliveirense Clube"],
  },
  EN: {
    first: ["Manchester Celeste", "Liverpul", "Arsenal de Londres", "Chelsea Royal", "Tottenham White", "Newcastle Uniteda", "Aston Villara", "Westham Iron", "Brighton Waves", "Everton Blue", "Nottingham Forestal", "Crystal Palacea"],
    second: ["Riverside Borough", "Northbridge Academy", "Kingsway School", "Community Lions", "Sunday Town FC", "Sheffield Forge", "Bristol Harbour", "Leeds County", "Norwich Gold", "Coventry Sky", "Plymouth Sailors", "Oxford Scholars"],
  },
  ES: {
    first: ["Barsemlona", "Real Madria", "Atlética Madri", "Sevilha Real", "Valência Naranja", "Bilbao Athletic", "Vila Realena", "Betis Verde", "Girona Vermelha", "Sociedad Azul", "Celta Galícia", "Mallorca Ilha"],
    second: ["Atlético del Barrio", "Cantera Dorada", "Colegio Estrella", "Fundación Real", "Unión del Parque", "Deportivo Castilla", "Racing Cantábrico", "Sporting Astúria", "Levante del Mar", "Granada Sierra", "Córdoba Blanca", "Tenerife Solar"],
  },
  IT: {
    first: ["Milano Rosso", "Internazionale Blu", "Juventa Torino", "Roma Imperial", "Napoli Azzurra", "Lazio Celeste", "Atalanta Bergamo", "Fiorenza Viola", "Bologna Rossoblù", "Torino Granata", "Genoa Marítima", "Udine Calcio"],
    second: ["Borgo Verde", "Scuola Torino", "Istituto Roma", "Progetto Futuro", "Atletico Ponte", "Parma Ducale", "Palermo Rosa", "Bari Adriatico", "Pisa Torre", "Venezia Laguna", "Modena Gialla", "Spezia Marina"],
  },
  DE: {
    first: ["München Rot", "Dortmund Amarelo", "Leverkusen Werk", "Leipzig Energia", "Stuttgart Branco", "Frankfurt Águia", "Wolfsburg Verde", "Freiburg Floresta", "Bremen Norte", "Mainz Rubro", "Berlin União", "Hamburg Azul"],
    second: ["Jugend Berlin", "Akademie Rhein", "Schule Hamburg", "Projekt Zukunft", "Verein Brücke", "Köln Dom", "Hannover Central", "Dresden Dynamo", "Nürnberg Burg", "Karlsruhe Blau", "Bochum Mineiro", "Kiel Marítimo"],
  },
  FR: {
    first: ["Paris Lumière", "Marseille Olímpico", "Lyon Imperial", "Mônaco Real", "Lille do Norte", "Nice Riviera", "Lens Sangue Ouro", "Rennes Bretão", "Strasbourg Azul", "Nantes Atlântico", "Toulouse Violeta", "Bordeaux Vin"],
    second: ["Banlieue Paris", "Académie Lyon", "École Marseille", "Jeunesse Unie", "Club du Pont", "Metz Lorraine", "Caen Normand", "Grenoble Alpes", "Amiens Picardie", "Bastia Corse", "Dijon Mostarda", "Angers Loire"],
  },
  NL: {
    first: ["Amsterdam Ajaxia", "Rotterdam Feyenor", "Eindhoven PSVita", "Alkmaar Queijo", "Utrecht Central", "Twente Vermelho", "Heerenveen Frísio", "Groningen Verde", "Arnhem Vitesse", "Nijmegen União", "Breda Amarelo", "Zwolle Azul"],
    second: ["Buurt Amsterdam", "Academie Oranje", "School Rotterdam", "Stichting Toekomst", "Brugge Clube", "Volendam Peixe", "Dordrecht Leão", "Eindhoven Jovem", "Maastricht Sul", "Tilburg Tricolor", "Almere Cidade", "Haarlem Tulipa"],
  },
  MX: {
    first: ["Águilas Capital", "Guadalajara Rojiblanca", "Monterra Azul", "Tigres del Norte", "Cruz Celeste", "Pumas Universitários", "Toluca Diablos", "León Esmeralda", "Pachuca Mineira", "Santos Laguna", "Atlas Rojinegro", "Tijuana Frontera"],
    second: ["Barrio Azteca", "Academia Monterra", "Escuela Guadalajara", "Proyecto Esperanza", "Deportivo Puente", "Oaxaca Alebrije", "Sonora Dorada", "Mérida Maya", "Morelia Monarca", "Cancún Caribe", "Celaya Cajeta", "Tepatitlán Rojo"],
  },
  US: {
    first: ["Miami Flamingos", "Los Angeles Stars", "New York Empire", "Seattle Soundwave", "Austin Verde", "Atlanta Uniteda", "Portland Pines", "Chicago Fireline", "Dallas Lone Star", "Boston Harbor", "Orlando Solar", "Denver Peaks"],
    second: ["Queens Borough FC", "California Academy", "Liberty High", "Community Eagles", "Sunday Valley", "Detroit Motors", "Phoenix Risinga", "San Diego Waves", "Las Vegas Lights", "Tampa Bay Union", "Sacramento Gold", "Charlotte Crown"],
  },
  JP: {
    first: ["Tokyo Sakura", "Osaka Gambaia", "Yokohama Marinoso", "Kobe Vitória", "Kawasaki Frontaleiro", "Urawa Vermelha", "Nagoya Orcas", "Hiroshima Arrows", "Fukuoka Avispa", "Sapporo Norte", "Kyoto Púrpura", "Kashima Antlersa"],
    second: ["Bairro Asakusa", "Academia Osaka", "Escola Yokohama", "Projeto Mirai", "Ponte de Kyoto", "Sendai Verde", "Chiba United", "Nagasaki Azul", "Kumamoto Fogo", "Oita Trinita", "Mito Holly", "Gunma Trovão"],
  },
};

const COUNTRY_META: Record<CountryId, { name: string; flag: string; style: string; currencyLabel: string; language: string; costOfLiving: number; leagues: [string, string]; salaries: [number, number] }> = {
  BR: { name: "Brasil", flag: "🇧🇷", style: "Técnica, pressão e calendário intenso", currencyLabel: "R$ por mês", language: "Português", costOfLiving: 4200, leagues: ["Liga Nacional A", "Liga Nacional B"], salaries: [48000, 12000] },
  AR: { name: "Argentina", flag: "🇦🇷", style: "Clássicos quentes e jogo competitivo", currencyLabel: "R$ equivalentes", language: "Espanhol", costOfLiving: 3800, leagues: ["Liga Federal A", "Liga Federal B"], salaries: [36000, 9000] },
  PT: { name: "Portugal", flag: "🇵🇹", style: "Formação técnica e vitrine europeia", currencyLabel: "R$ equivalentes", language: "Português", costOfLiving: 7200, leagues: ["Liga Lusitana", "Liga de Honra"], salaries: [72000, 22000] },
  EN: { name: "Inglaterra", flag: "🏴", style: "Ritmo alto, físico e grande exposição", currencyLabel: "R$ equivalentes", language: "Inglês", costOfLiving: 12000, leagues: ["Premier Crown", "Championship Union"], salaries: [190000, 62000] },
  ES: { name: "Espanha", flag: "🇪🇸", style: "Posse, técnica e pressão por resultados", currencyLabel: "R$ equivalentes", language: "Espanhol", costOfLiving: 8500, leagues: ["Liga Estelar", "Liga de Plata"], salaries: [110000, 36000] },
  IT: { name: "Itália", flag: "🇮🇹", style: "Tática, defesa e tradição regional", currencyLabel: "R$ equivalentes", language: "Italiano", costOfLiving: 8200, leagues: ["Serie Suprema", "Serie de Ascenso"], salaries: [105000, 34000] },
  DE: { name: "Alemanha", flag: "🇩🇪", style: "Intensidade, estrutura e estádios cheios", currencyLabel: "R$ equivalentes", language: "Alemão", costOfLiving: 9400, leagues: ["Bundes Liga", "Bundes Zwei"], salaries: [125000, 42000] },
  FR: { name: "França", flag: "🇫🇷", style: "Atletismo, juventude e grandes vitrines", currencyLabel: "R$ equivalentes", language: "Francês", costOfLiving: 9700, leagues: ["Ligue Élite", "Ligue National"], salaries: [115000, 38000] },
  NL: { name: "Países Baixos", flag: "🇳🇱", style: "Formação, ataque e futebol posicional", currencyLabel: "R$ equivalentes", language: "Holandês", costOfLiving: 10200, leagues: ["Ere Liga", "Primeira Divisie"], salaries: [92000, 30000] },
  MX: { name: "México", flag: "🇲🇽", style: "Técnica, altitude e mata-matas intensos", currencyLabel: "R$ equivalentes", language: "Espanhol", costOfLiving: 4600, leagues: ["Liga Azteca", "Liga Expansión"], salaries: [45000, 13000] },
  US: { name: "Estados Unidos", flag: "🇺🇸", style: "Físico, espetáculo e longas viagens", currencyLabel: "R$ equivalentes", language: "Inglês", costOfLiving: 13500, leagues: ["Major Union", "National Championship"], salaries: [95000, 30000] },
  JP: { name: "Japão", flag: "🇯🇵", style: "Disciplina, velocidade e precisão", currencyLabel: "R$ equivalentes", language: "Japonês", costOfLiving: 9200, leagues: ["J-Liga Sakura", "J-Liga Mirai"], salaries: [75000, 24000] },
};

export function hashText(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function slugify(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function shortCode(name: string) {
  const words = name.replace(/\b(do|da|de|del|of|fc)\b/gi, "").split(/\s+/).filter(Boolean);
  return (words.length >= 3 ? words.slice(0, 3).map((word) => word[0]).join("") : words.map((word) => word.slice(0, 2)).join("")).slice(0, 3).toUpperCase();
}

function makeTeams(countryId: CountryId, division: DivisionLevel, names: string[]) {
  const meta = COUNTRY_META[countryId];
  const baseStrength = division === 1 ? 77 : 66;
  const stars = STAR_POOLS[countryId];
  return names.map((name, index): Team => {
    const [color, accent] = COLORS[index % COLORS.length];
    const strengthWave = ((index * 5 + hashText(name)) % 9) - 4;
    return {
      id: `${countryId.toLowerCase()}-${division}-${slugify(name)}`,
      name,
      short: shortCode(name),
      color,
      accent,
      strength: baseStrength + strengthWave,
      stars: [stars[index % stars.length], stars[(index + 3) % stars.length], stars[(index + 5) % stars.length]],
      country: meta.name,
      countryId,
      division,
    };
  });
}

function buildLeague(countryId: CountryId, division: DivisionLevel): LeagueDefinition {
  const meta = COUNTRY_META[countryId];
  return {
    id: `${countryId.toLowerCase()}-${division}`,
    name: meta.leagues[division - 1],
    countryId,
    countryName: meta.name,
    division,
    salaryBase: meta.salaries[division - 1],
    teams: makeTeams(countryId, division, division === 1 ? TEAM_NAMES[countryId].first : TEAM_NAMES[countryId].second),
  };
}

export const COUNTRIES: CountryDefinition[] = (Object.keys(COUNTRY_META) as CountryId[]).map((id) => ({
  id,
  name: COUNTRY_META[id].name,
  flag: COUNTRY_META[id].flag,
  style: COUNTRY_META[id].style,
  currencyLabel: COUNTRY_META[id].currencyLabel,
  language: COUNTRY_META[id].language,
  costOfLiving: COUNTRY_META[id].costOfLiving,
  leagues: [buildLeague(id, 1), buildLeague(id, 2)],
}));

export const ORIGINS: Array<{ id: OriginType; description: string }> = [
  { id: "Clube de bairro", description: "Raiz local, moral alta e pouca estrutura." },
  { id: "Academia regional", description: "Base técnica e maior cobrança por desempenho." },
  { id: "Futebol escolar", description: "Disciplina, estudo e evolução equilibrada." },
  { id: "Projeto social", description: "História inspiradora e ligação forte com a comunidade." },
  { id: "Sem clube", description: "Começo difícil por meio de peneiras e contratos curtos." },
];

export function getCountry(countryId: CountryId) {
  return COUNTRIES.find((country) => country.id === countryId) ?? COUNTRIES[0];
}

export function getLeagueDefinition(countryId: CountryId, division: DivisionLevel) {
  return getCountry(countryId).leagues[division - 1];
}

export function getStartingClub(countryId: CountryId, division: DivisionLevel, origin: OriginType) {
  const league = getLeagueDefinition(countryId, division);
  const index = Math.max(0, ORIGINS.findIndex((item) => item.id === origin));
  return league.teams[index % league.teams.length];
}

export function getCareerLeague(career: Pick<CareerState, "countryId" | "division" | "clubId" | "clubName" | "clubShort" | "clubColor" | "clubStrength">) {
  const league = getLeagueDefinition(career.countryId, career.division);
  if (league.teams.some((team) => team.id === career.clubId)) return league;
  const playerTeam: Team = {
    id: career.clubId,
    name: career.clubName,
    short: career.clubShort,
    color: career.clubColor,
    strength: career.clubStrength,
    stars: ["Capitão da equipe", "Jovem promessa", "Camisa dez"],
    country: league.countryName,
    countryId: career.countryId,
    division: career.division,
  };
  return { ...league, teams: [playerTeam, ...league.teams.slice(0, 11)] };
}

export function getSalary(countryId: CountryId, division: DivisionLevel, reputation = 12) {
  const base = getLeagueDefinition(countryId, division).salaryBase;
  return Math.round(base * (0.72 + Math.min(100, reputation) / 180));
}

export function addDaysToDate(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getDaysToNextMatch(careerSeed: number, matches: number, countryId: CountryId) {
  return 3 + (hashText(`${careerSeed}:${matches + 1}:${countryId}:calendar`) % 7);
}

export function getPreparationActionCount(daysUntilMatch: number) {
  return Math.max(1, Math.floor(daysUntilMatch / 2));
}

export const PLAYER_TEAM = getStartingClub("BR", 2, "Clube de bairro");
export const LEAGUE_TEAMS = getLeagueDefinition("BR", 2).teams;
export const WORLD_TEAMS = COUNTRIES.flatMap((country) => country.leagues[0].teams);
export const TEAMS = COUNTRIES.flatMap((country) => country.leagues.flatMap((league) => league.teams));

const weatherByCountry: Record<CountryId, string[]> = {
  BR: ["céu limpo", "chuva tropical", "calor intenso", "noite úmida", "gramado pesado"],
  AR: ["noite fria", "vento dos pampas", "céu limpo", "garoa leve", "gramado rápido"],
  PT: ["brisa atlântica", "chuva fina", "noite amena", "céu limpo", "vento costeiro"],
  EN: ["chuva constante", "neblina", "tarde fria", "vento forte", "gramado molhado"],
  ES: ["noite seca", "calor mediterrâneo", "céu limpo", "vento leve", "gramado rápido"],
  IT: ["noite amena", "chuva fina", "brisa costeira", "céu limpo", "tarde fria"],
  DE: ["frio intenso", "chuva leve", "céu nublado", "vento forte", "gramado úmido"],
  FR: ["garoa parisiense", "céu limpo", "vento atlântico", "noite fria", "chuva moderada"],
  NL: ["vento forte", "chuva lateral", "céu nublado", "tarde fria", "gramado molhado"],
  MX: ["altitude elevada", "calor seco", "noite quente", "chuva de verão", "céu limpo"],
  US: ["calor intenso", "noite seca", "chuva forte", "vento continental", "céu limpo"],
  JP: ["chuva fina", "umidade alta", "noite fresca", "vento costeiro", "céu limpo"],
};
const pressures = ["jogo de afirmação", "duelo direto", "clássico regional", "vale a liderança", "estreia do treinador", "confronto pela permanência"];
const venuesByCountry: Record<CountryId, string[]> = {
  BR: ["Arena do Vale", "Estádio Horizonte", "Parque Central", "Caldeirão do Norte"],
  AR: ["Estadio del Sol", "Parque de Plata", "La Fortaleza", "Campo Pampeano"],
  PT: ["Estádio do Tejo", "Parque da Serra", "Campo dos Navegantes", "Arena Lusitana"],
  EN: ["Riverside Ground", "Crown Park", "Northbridge Lane", "Union Stadium"],
  ES: ["Estadio del Reino", "Arena Mediterránea", "Campo de la Estrella", "Parque Castilla"],
  IT: ["Stadio Imperiale", "Arena del Borgo", "Campo Azzurro", "Parco Romano"],
  DE: ["Adler Arena", "Rhein Stadion", "Nord Park", "Werk Arena"],
  FR: ["Stade Lumière", "Parc National", "Arène du Rhône", "Stade Atlantique"],
  NL: ["Oranje Arena", "Tulip Park", "Haven Stadion", "Polder Ground"],
  MX: ["Estadio Azteca Nova", "Arena del Sol", "Parque Maya", "Fortaleza Norte"],
  US: ["Liberty Stadium", "Pacific Field", "Lone Star Arena", "Empire Park"],
  JP: ["Sakura Stadium", "Mirai Arena", "Fuji Park", "Hikari Field"],
};

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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function uniqueMinutes(rng: () => number, count: number, minimum = 3, maximum = 88) {
  const result = new Set<number>();
  while (result.size < count) result.add(minimum + Math.floor(rng() * (maximum - minimum + 1)));
  return [...result].sort((a, b) => a - b);
}

function samplePoisson(rng: () => number, lambda: number) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;
  do {
    count += 1;
    product *= rng();
  } while (product > limit && count < 8);
  return Math.min(4, count - 1);
}

function fixtureOpponent(career: CareerState) {
  const league = getCareerLeague(career);
  const opponents = league.teams.filter((team) => team.id !== career.clubId);
  const round = Math.max(1, career.seasonRound || career.matches + 1);
  const cycle = Math.floor((round - 1) / opponents.length);
  const offset = career.careerSeed % opponents.length;
  return opponents[(round - 1 + offset + cycle * 3) % opponents.length];
}

export function createFixture(careerInput: Partial<CareerState> & Pick<CareerState, "name" | "matches" | "careerSeed">): Fixture {
  const career = migrateCareer(careerInput);
  const round = career.seasonRound;
  const seed = hashText(`${career.id}:${career.countryId}:${career.division}:${career.matches + 1}:${round}`);
  const rng = makeRng(seed);
  const matchNumber = career.matches + 1;
  const isCup = matchNumber > 2 && matchNumber % 8 === 0;
  const isContinental = career.division === 1 && career.matches > 12 && matchNumber % 19 === 0;
  const cupTeams = getCountry(career.countryId).leagues.flatMap((league) => league.teams).filter((team) => team.id !== career.clubId);
  const internationalTeams = WORLD_TEAMS.filter((team) => team.countryId !== career.countryId);
  const opponent = isContinental ? pick(rng, internationalTeams) : isCup ? pick(rng, cupTeams) : fixtureOpponent(career);
  const competition = isContinental ? "Taça Continental" : isCup ? `Copa ${getCountry(career.countryId).name}` : career.leagueName;
  return {
    id: `${opponent.id}-${matchNumber}-${seed.toString(36)}`,
    seed,
    opponent,
    home: rng() > .46,
    competition,
    competitionType: isContinental ? "continental" : isCup ? "cup" : "league",
    venue: pick(rng, venuesByCountry[career.countryId]),
    weather: pick(rng, weatherByCountry[career.countryId]),
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
    "O banco se levanta: a próxima disputa pode mudar o roteiro.",
  ];
  const kinds: MatchEvent["kind"][] = ["normal", "normal", "normal", "chance", "normal", "card"];
  return { minute, text: pick(rng, templates), kind: pick(rng, kinds) };
}

function momentTemplates(position: Position, rng: () => number, star: string) {
  const common: Array<Omit<MatchMoment, "id" | "minute" | "targets">> = [
    { title: "Quebre a pressão", prompt: "A marcação saltou. Escolha a saída antes que o espaço desapareça.", kind: "pass", pressure: "média" },
    { title: "Ataque o corredor", prompt: "Há campo livre e dois defensores desalinhados.", kind: "dribble", pressure: "média" },
    { title: "Drible em espaço curto", prompt: "Dois marcadores fecham a linha lateral. Escolha como escapar.", kind: "dribble", pressure: "alta" },
    { title: "A bola do jogo", prompt: "O goleiro deu um passo. Escolha canto e força.", kind: "shot", pressure: "alta" },
    { title: `Pare ${star}`, prompt: "O craque adversário acelera em direção à área. Antecipe a jogada.", kind: "defense", pressure: "alta" },
    { title: "Último passe", prompt: "Três companheiros atacam a área por caminhos diferentes.", kind: "pass", pressure: "alta" },
    { title: "Segunda bola", prompt: "O rebote cai na entrada da área e a defesa ainda está desorganizada.", kind: "shot", pressure: "média" },
    { title: "Saída sob risco", prompt: "Um passe seguro mantém a posse; um passe vertical desmonta o bloco.", kind: "pass", pressure: "baixa" },
    { title: "Um contra um", prompt: "Você ficou isolado contra o marcador. Decida antes da cobertura.", kind: "dribble", pressure: "alta" },
    { title: "Falta na entrada da área", prompt: "A barreira está montada. Escolha a trajetória da cobrança.", kind: "freeKick", pressure: "alta" },
    { title: "Escanteio decisivo", prompt: "A defesa alterna entre zona e marcação individual. Escolha a jogada ensaiada.", kind: "corner", pressure: "média" },
    { title: "Pênalti sob pressão", prompt: "O goleiro tenta antecipar sua escolha. Defina canto e estilo da batida.", kind: "penalty", pressure: "alta" },
    { title: "Contra-ataque aberto", prompt: "Três contra três e muito campo pela frente. Escolha o ritmo da transição.", kind: "counter", pressure: "alta" },
    { title: "Duelo pelo alto", prompt: "O cruzamento vem forte entre zagueiro e goleiro. Ataque o espaço certo.", kind: "aerial", pressure: "média" },
  ];
  const preferred: Record<Position, MomentKind[]> = {
    Atacante: ["shot", "dribble", "aerial", "penalty", "counter", "freeKick"],
    Ponta: ["dribble", "corner", "counter", "pass", "freeKick", "shot"],
    Meia: ["pass", "freeKick", "corner", "counter", "dribble", "shot"],
    Lateral: ["pass", "defense", "corner", "counter", "aerial", "dribble"],
    Zagueiro: ["defense", "aerial", "pass", "defense", "corner", "counter"],
  };
  const kind = pick(rng, preferred[position]);
  return pick(rng, common.filter((item) => item.kind === kind));
}

function targetsFor(kind: MomentKind, rng: () => number): MatchTarget[] {
  const banks: Record<MomentKind, Array<Omit<MatchTarget, "id" | "roll">>> = {
    pass: [
      { label: "Apoio curto", hint: "manter a posse", x: 31, y: 66, risk: .07, reward: 8 },
      { label: "Inversão", hint: "mudar o lado", x: 62, y: 22, risk: .23, reward: 16 },
      { label: "Passe para gol", hint: "romper a linha", x: 79, y: 48, risk: .42, reward: 28 },
    ],
    shot: [
      { label: "Colocada", hint: "canto direito", x: 90, y: 31, risk: .24, reward: 22 },
      { label: "Potência", hint: "alto e forte", x: 94, y: 50, risk: .38, reward: 29 },
      { label: "Rasteira", hint: "canto esquerdo", x: 90, y: 69, risk: .29, reward: 25 },
    ],
    dribble: [
      { label: "Proteger", hint: "esperar apoio", x: 42, y: 67, risk: .1, reward: 9 },
      { label: "Cortar para dentro", hint: "ganhar o centro", x: 65, y: 43, risk: .29, reward: 19 },
      { label: "Partir para cima", hint: "eliminar dois", x: 75, y: 72, risk: .45, reward: 30 },
    ],
    defense: [
      { label: "Conter", hint: "fechar o ângulo", x: 61, y: 56, risk: .09, reward: 10 },
      { label: "Antecipar", hint: "cortar o passe", x: 72, y: 35, risk: .28, reward: 20 },
      { label: "Dar o bote", hint: "recuperar e sair", x: 78, y: 62, risk: .44, reward: 30 },
    ],
    freeKick: [
      { label: "Por cima da barreira", hint: "curva no ângulo", x: 91, y: 29, risk: .36, reward: 31 },
      { label: "Forte no canto", hint: "surpreender o goleiro", x: 93, y: 67, risk: .3, reward: 27 },
      { label: "Jogada ensaiada", hint: "passe por baixo", x: 76, y: 52, risk: .18, reward: 19 },
    ],
    corner: [
      { label: "Primeiro pau", hint: "desvio rápido", x: 86, y: 29, risk: .24, reward: 22 },
      { label: "Marca do pênalti", hint: "buscar o cabeceador", x: 78, y: 51, risk: .31, reward: 26 },
      { label: "Curto", hint: "criar novo ângulo", x: 69, y: 76, risk: .12, reward: 14 },
    ],
    penalty: [
      { label: "Canto esquerdo", hint: "batida colocada", x: 91, y: 67, risk: .24, reward: 28 },
      { label: "Canto direito", hint: "esperar o goleiro", x: 91, y: 31, risk: .27, reward: 29 },
      { label: "No centro", hint: "assumir o risco", x: 94, y: 50, risk: .34, reward: 32 },
    ],
    counter: [
      { label: "Acelerar", hint: "atacar antes da cobertura", x: 75, y: 46, risk: .32, reward: 27 },
      { label: "Abrir na ponta", hint: "alongar a defesa", x: 66, y: 22, risk: .18, reward: 18 },
      { label: "Prender e esperar", hint: "garantir a posse", x: 48, y: 68, risk: .08, reward: 10 },
    ],
    aerial: [
      { label: "Testar firme", hint: "buscar o chão", x: 89, y: 56, risk: .29, reward: 26 },
      { label: "Desviar", hint: "tirar do goleiro", x: 83, y: 32, risk: .23, reward: 22 },
      { label: "Escorar", hint: "servir um companheiro", x: 73, y: 65, risk: .14, reward: 16 },
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
    freeKick: Math.round((career.attributes.shooting * 2 + career.attributes.passing) / 3),
    corner: career.attributes.passing,
    penalty: career.attributes.shooting,
    counter: Math.round((career.attributes.pace + career.attributes.dribbling) / 2),
    aerial: Math.round((career.attributes.physical + career.attributes.shooting) / 2),
  }[kind];
  return (attribute - 65) / 1200;
}

export function generateMatchPlan(career: CareerState, fixture = createFixture(career)): MatchPlan {
  const rng = makeRng(fixture.seed ^ hashText(`${career.position}:${career.archetype}`));
  const overall = Object.values(career.attributes).reduce((total, value) => total + value, 0) / 6;
  const playerStrength = career.clubStrength + (overall - 68) * .08 + career.formBoost * .25 + (career.morale - 70) * .025;
  const strengthGap = playerStrength - fixture.opponent.strength;
  const homeEffect = fixture.home ? .16 : -.12;
  const difficultyEffect = career.difficulty === "Lenda" ? -.12 : career.difficulty === "Promessa" ? .09 : 0;
  const energyEffect = (career.energy - 75) / 240;
  const expectedFor = clamp(1.08 + strengthGap * .026 + homeEffect + difficultyEffect + energyEffect, .3, 2.25);
  const expectedAgainst = clamp(1.1 - strengthGap * .024 - homeEffect * .75 - difficultyEffect * .45 - energyEffect * .35, .32, 2.3);
  const baseHomeGoals = samplePoisson(rng, expectedFor);
  const baseAwayGoals = samplePoisson(rng, expectedAgainst);
  const intensity = .72 + rng() * .56;
  const eventCount = 13 + Math.floor(rng() * 8);
  const momentCount = 4 + Math.floor(rng() * 3);
  const eventMinutes = uniqueMinutes(rng, eventCount);
  const momentMinutes = uniqueMinutes(rng, momentCount, 8, 86);

  const goalMinutesFor = new Set(uniqueMinutes(rng, baseHomeGoals, 5, 88));
  const goalMinutesAgainst = new Set(uniqueMinutes(rng, baseAwayGoals, 5, 88));
  const allEventMinutes = [...new Set([...eventMinutes, ...goalMinutesFor, ...goalMinutesAgainst])].sort((a, b) => a - b);
  const events = allEventMinutes.map((minute) => {
    if (goalMinutesFor.has(minute)) {
      return { minute, kind: "home-goal" as const, text: pick(rng, [
        `GOL DO ${career.clubName.toUpperCase()}! A jogada nasce numa recuperação alta.`,
        "A rede balança! Cruzamento preciso e cabeceio sem defesa.",
        "Finalização de fora da área muda o placar.",
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
    expectedHomeGoals: expectedFor,
    expectedAwayGoals: expectedAgainst,
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
  const league = getCareerLeague(career);
  const rng = makeRng(hashText(`table:${career.careerSeed}:${career.season}:${career.seasonMatches}:${career.leagueId}`));
  const played = Math.min(22, career.seasonMatches);
  const rows = league.teams.map((team) => {
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
    const strengthBias = (team.strength - (career.division === 1 ? 77 : 66)) / 18;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    const form: string[] = [];
    for (let game = 0; game < played; game += 1) {
      const roll = rng() + strengthBias * .22;
      const result = roll > .66 ? "V" : roll > .37 ? "E" : "D";
      form.unshift(result);
      if (result === "V") wins += 1;
      if (result === "E") draws += 1;
      if (result === "D") losses += 1;
      const attackLambda = clamp(1.08 + strengthBias * .35, .45, 1.85);
      const defenseLambda = clamp(1.1 - strengthBias * .28, .48, 1.8);
      goalsFor += samplePoisson(rng, attackLambda);
      goalsAgainst += samplePoisson(rng, defenseLambda);
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
  const objective = career.division === 2 ? "acesso" : playerPosition >= 10 ? "permanência" : "título";
  return [
    {
      id: `club-${career.matches}`,
      category: "clube",
      title: playerPosition <= 4 ? `Clube entra na briga pelo ${objective}` : "Treinador cobra reação",
      text: `${career.clubName} ocupa a ${playerPosition}ª posição da ${career.leagueName} e prepara um plano específico para o ${fixture.opponent.name}.`,
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
  const countryId = input?.countryId ?? "BR";
  const division = input?.division === 1 ? 1 : 2;
  const origin = (ORIGINS.some((item) => item.id === input?.origin) ? input?.origin : "Clube de bairro") as OriginType;
  const league = getLeagueDefinition(countryId, division);
  const startingClub = getStartingClub(countryId, division, origin);
  const existingTeam = TEAMS.find((team) => team.id === input?.clubId);
  const selectedClub = existingTeam ?? startingClub;
  const reputation = input?.reputation ?? 12;
  const careerSeed = input?.careerSeed ?? hashText(`${input?.name ?? "Alex Silva"}:${now}`);
  const matches = input?.matches ?? 0;
  const currentDate = input?.currentDate ?? "2026-01-05";
  const daysUntilMatch = input?.daysUntilMatch ?? getDaysToNextMatch(careerSeed, matches, countryId);
  const preparationActionsAllowed = input?.preparationActionsAllowed ?? getPreparationActionCount(daysUntilMatch);
  const preparationActionsUsed = input?.preparationActionsUsed ?? (input?.preparedForMatch ? 1 : 0);
  const country = getCountry(countryId);
  const salary = input?.salary ?? getSalary(countryId, division, reputation);
  return {
    id: input?.id ?? `career-${hashText(`${input?.name ?? "Alex Silva"}:${now}`).toString(36)}`,
    name: input?.name ?? "Alex Silva",
    position,
    origin,
    nationality: input?.nationality ?? COUNTRY_META[countryId].name,
    countryId,
    countryName: input?.countryName ?? COUNTRY_META[countryId].name,
    division,
    leagueId: input?.leagueId ?? league.id,
    leagueName: input?.leagueName ?? league.name,
    foot: input?.foot ?? "Direito",
    archetype,
    difficulty: input?.difficulty ?? "Profissional",
    age: input?.age ?? 18,
    shirtNumber: input?.shirtNumber ?? 18,
    skinTone: input?.skinTone ?? "#b97850",
    hairStyle: input?.hairStyle ?? "Curto",
    clubId: input?.clubId ?? selectedClub.id,
    clubName: input?.clubName ?? selectedClub.name,
    clubShort: input?.clubShort ?? selectedClub.short,
    clubColor: input?.clubColor ?? selectedClub.color,
    clubStrength: input?.clubStrength ?? selectedClub.strength,
    level: input?.level ?? 1,
    xp: input?.xp ?? 35,
    fans: input?.fans ?? 1280,
    matches,
    goals: input?.goals ?? 0,
    assists: input?.assists ?? 0,
    rating: input?.rating ?? 6.8,
    energy: input?.energy ?? 86,
    morale: input?.morale ?? 74,
    recentResults: input?.recentResults ?? [],
    careerSeed,
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
    preparedForMatch: input?.preparedForMatch ?? preparationActionsUsed > 0,
    weeklyAction: input?.weeklyAction ?? "Nenhuma",
    currentDate,
    nextMatchDate: input?.nextMatchDate ?? addDaysToDate(currentDate, daysUntilMatch),
    daysUntilMatch,
    preparationActionsAllowed,
    preparationActionsUsed,
    preparationLog: input?.preparationLog ?? (input?.weeklyAction && input.weeklyAction !== "Nenhuma" ? [input.weeklyAction] : []),
    formBoost: input?.formBoost ?? 0,
    reputation,
    marketValue: input?.marketValue ?? Math.round(league.salaryBase * 22),
    salary,
    bankBalance: input?.bankBalance ?? salary * 2,
    monthlyExpenses: input?.monthlyExpenses ?? country.costOfLiving,
    housing: input?.housing ?? "Apartamento do clube",
    language: input?.language ?? country.language,
    languageLevel: input?.languageLevel ?? ((input?.nationality ?? country.name) === country.name ? 100 : 35),
    adaptation: input?.adaptation ?? 100,
    coachTrust: input?.coachTrust ?? 52,
    contractMatches: input?.contractMatches ?? 22,
    promotions: input?.promotions ?? 0,
    relegations: input?.relegations ?? 0,
    lastSeasonSummary: input?.lastSeasonSummary ?? "Primeira temporada em andamento",
    attributes: input?.attributes ?? createInitialAttributes(archetype, position),
    inbox: input?.inbox ?? [],
    trophies: input?.trophies ?? [],
    createdAt: input?.createdAt ?? now,
    updatedAt: input?.updatedAt ?? now,
  };
}
