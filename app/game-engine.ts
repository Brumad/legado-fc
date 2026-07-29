export type Position = "Atacante" | "Ponta" | "Meia" | "Lateral" | "Zagueiro";
export type MomentKind = "shot" | "pass" | "dribble" | "defense" | "freeKick" | "corner" | "penalty" | "counter" | "aerial";
export type Foot = "Direito" | "Esquerdo";
export type Archetype = "Maestro" | "Finalizador" | "Velocista" | "Operário" | "Muralha";
export type Difficulty = "Promessa" | "Profissional" | "Lenda";
export type MatchApproach = "Disciplinado" | "Equilibrado" | "Agressivo" | "Criativo";
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

export type SquadPlayer = {
  id: string;
  name: string;
  position: "GOL" | "LD" | "ZAG" | "LE" | "VOL" | "MEI" | "PD" | "PE" | "ATA";
  overall: number;
  teamId: string;
  teamName: string;
  nationalityId: CountryId;
  nationality: string;
};

export type LeaguePlayerStat = SquadPlayer & {
  goals: number;
  assists: number;
  appearances: number;
};

export type TeamSeasonRecord = {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: string[];
};

export type RoundMatchResult = {
  homeId: string;
  homeName: string;
  awayId: string;
  awayName: string;
  homeGoals: number;
  awayGoals: number;
};

export type WorldPlayerState = SquadPlayer & {
  age: number;
  potential: number;
  countryId: CountryId;
  status: "Ativo" | "Aposentado";
};

export type WorldTransfer = {
  id: string;
  season: number;
  playerId: string;
  playerName: string;
  age: number;
  overall: number;
  fromTeamId: string;
  fromTeamName: string;
  toTeamId: string;
  toTeamName: string;
  fromCountryId: CountryId;
  toCountryId: CountryId;
  fee: number;
};

export type CareerSquadRole = "Projeto" | "Rotação" | "Titular" | "Estrela";

export type CareerTransferOffer = {
  id: string;
  generatedSeason: number;
  generatedRound: number;
  teamId: string;
  teamName: string;
  teamShort: string;
  teamColor: string;
  teamStrength: number;
  countryId: CountryId;
  countryName: string;
  division: DivisionLevel;
  leagueId: string;
  leagueName: string;
  interest: number;
  transferFee: number;
  salary: number;
  signingBonus: number;
  contractUntilSeason: number;
  releaseClause: number;
  role: CareerSquadRole;
  available: boolean;
  requirement: string;
};

export type CareerTransferRecord = {
  id: string;
  season: number;
  fromTeamName: string;
  toTeamName: string;
  fromCountryId: CountryId;
  toCountryId: CountryId;
  fee: number;
  salary: number;
  role: CareerSquadRole;
};

export type CareerMatchRecord = {
  id: string;
  season: number;
  round: number;
  date: string;
  competition: string;
  opponentId: string;
  opponentName: string;
  opponentShort: string;
  playerGoals: number;
  opponentGoals: number;
  goals: number;
  assists: number;
  rating: number;
  minutesPlayed: number;
  result: "V" | "E" | "D";
  tacticName: string;
  tacticFormation: string;
  approach: MatchApproach;
  possession: number;
  shots: number;
  shotsAgainst: number;
  yellowCards: number;
  redCard: boolean;
  injuryStatus: string;
  signature: string;
  consequenceImpact: string[];
};

export type PersonalityProfile = {
  professionalism: number;
  loyalty: number;
  mediaStyle: number;
  teamwork: number;
  ambition: number;
};

export type ConsequenceEffects = {
  performance?: number;
  fatigue?: number;
  injuryRisk?: number;
  cardRisk?: number;
  coachTrust?: number;
  squadRelations?: number;
  reputation?: number;
  transferInterest?: number;
  morale?: number;
  income?: number;
};

export type CareerConsequence = {
  id: string;
  key: string;
  source: string;
  title: string;
  description: string;
  tone: "positive" | "negative" | "mixed";
  createdMatch: number;
  remainingMatches: number;
  totalMatches: number;
  effects: ConsequenceEffects;
  resolutionEvent: string;
  resolutionText: string;
};

export type ConsequenceModifiers = Required<ConsequenceEffects>;

export type ContractRenewal = {
  available: boolean;
  salary: number;
  signingBonus: number;
  contractUntilSeason: number;
  releaseClause: number;
  role: CareerSquadRole;
  requirement: string;
};

export type WorldChampion = {
  countryId: CountryId;
  countryName: string;
  leagueName: string;
  teamId: string;
  teamName: string;
};

export type WorldSeasonRecord = {
  season: number;
  champions: WorldChampion[];
  playerOfYear: string;
  playerOfYearClub: string;
  biggestTransfer: string;
  biggestTransferFee: number;
  retirements: string[];
  generatedProspects: number;
};

export type CareerSeasonArchive = {
  season: number;
  countryName: string;
  leagueName: string;
  clubName: string;
  position: number;
  champion: string;
  topScorer: string;
  topScorerGoals: number;
  topAssister: string;
  topAssisterAssists: number;
  playerGoals: number;
  playerAssists: number;
  playerRating: number;
  outcome: string;
};

export type CareerNews = {
  id: string;
  category: "clube" | "mercado" | "liga" | "pessoal";
  title: string;
  text: string;
  isNew?: boolean;
};

export type CareerState = {
  saveVersion: number;
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
  car: string;
  foodPlan: string;
  privateTraining: string;
  investments: number;
  debt: number;
  retirementFund: number;
  sponsorship: string;
  socialFollowers: number;
  socialReputation: number;
  relationshipStatus: string;
  partnerName: string;
  children: number;
  familyBond: number;
  squadRelations: number;
  discipline: number;
  injuryStatus: string;
  injuryRisk: number;
  injuryMatchesRemaining: number;
  yellowCards: number;
  redCards: number;
  suspensionMatches: number;
  socialProject: string;
  pendingLifeEvent: string;
  queuedLifeEvents: string[];
  lifeEventHistory: string[];
  lifeFlags: string[];
  personality: PersonalityProfile;
  activeConsequences: CareerConsequence[];
  consequenceHistory: CareerConsequence[];
  individualAwards: string[];
  historicalRecords: string[];
  futurePath: string;
  contractMatches: number;
  contractUntilSeason: number;
  contractRole: CareerSquadRole;
  releaseClause: number;
  pendingTransfer: CareerTransferOffer | null;
  careerTransferHistory: CareerTransferRecord[];
  matchHistory: CareerMatchRecord[];
  promotions: number;
  relegations: number;
  lastSeasonSummary: string;
  leagueTable: TeamSeasonRecord[];
  leagueLeaders: LeaguePlayerStat[];
  lastRoundResults: RoundMatchResult[];
  worldPlayers: WorldPlayerState[];
  worldTransfers: WorldTransfer[];
  worldHistory: WorldSeasonRecord[];
  seasonArchive: CareerSeasonArchive[];
  worldLastUpdatedSeason: number;
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
  squad: SquadPlayer[];
};

export type LeagueFormat = {
  teamCount: number;
  rounds: number;
  matchesPerRound: number;
  directPromotion: number;
  playoffPromotion: number;
  directRelegation: number;
  relegationPlayoff: number;
  structure: "ida-e-volta" | "zonas-e-playoffs" | "apertura-e-playoffs" | "conferencias" | "temporada-especial";
  note: string;
};

export type LeagueDefinition = {
  id: string;
  name: string;
  countryId: CountryId;
  countryName: string;
  division: DivisionLevel;
  salaryBase: number;
  format: LeagueFormat;
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
  kind: "normal" | "chance" | "home-goal" | "away-goal" | "yellow-card" | "red-card" | "offside" | "substitution" | "injury" | "tactical";
  text: string;
  side?: "player" | "opponent" | "neutral";
  affectsPlayer?: boolean;
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
  positionFocus: string;
  targets: MatchTarget[];
};

export type OpponentTactic = {
  id: "pressao-alta" | "bloco-baixo" | "transicao" | "posse" | "jogo-direto" | "gegenpress" | "amplitude" | "losango" | "falso-nove" | "marcacao-individual" | "linha-alta" | "catenaccio";
  name: string;
  formation: string;
  description: string;
  pressing: number;
  tempo: number;
  defensiveLine: number;
  width: number;
  aggression: number;
  risk: number;
  strengths: string[];
  weaknesses: string[];
  favoredKinds: MomentKind[];
  exposedKinds: MomentKind[];
};

export type TeamMatchStatistics = {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  bigChances: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  expectedGoals: number;
};

export type MatchStatistics = {
  playerTeam: TeamMatchStatistics;
  opponent: TeamMatchStatistics;
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
  importance: number;
  opponentTactic: OpponentTactic;
  statistics: MatchStatistics;
  playerAvailable: boolean;
  unavailableReason: string;
  tacticalAdvantage: number;
  tacticalInstruction: string;
  rivalryLevel: number;
  consequenceModifiers: ConsequenceModifiers;
  consequenceNarratives: string[];
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

const CLUB_EXPANSIONS: Record<CountryId, string[]> = {
  BR: ["Botafogo Estrela", "Atlético Mineiral", "Atlético Paranael", "Fluminensa", "Bragantina Red", "Vitória Rubra", "Cearense SC", "Recife Sporta", "Juventude Serrana", "Goiânia Esporte", "Campinas Ponte", "Curitiba Azul", "Amazonas Verde", "Belém Remo", "Maceió Regatas", "Chapecó União", "Cuiabá Dourada", "Natal América", "Londrina Café", "Ribeirão Pantera", "Santos Laguna", "Joinville Norte", "Pelotas Brasil", "Maringá Real"],
  AR: ["Huracán Viento", "Argentinos Jovens", "Belgrano Celeste", "Instituto Córdoba", "Tigre del Norte", "Unión Santa Fé", "Banfield Verde", "Defensa Florencio", "Central Córdoba", "Atlético Tucumán", "Sarmiento Junín", "Platense Calamar", "Godoy Cruzado", "Gimnasia Plata", "Barracas Porteño", "Riestra Deportivo", "Mendoza Independiente", "Aldosivi Mar", "Colón Sabalero", "Quilmes Cervecero", "Ferro Carril", "Chacarita Jovem", "San Martín Cuyo", "Temperley Gasolero"],
  PT: ["Arouca Serra", "Gil Vicenteiro", "Nacional Madeira", "Farense Algarve", "AVS Vila", "Tondela Ouro", "Paços Castor", "Penafiel Rubro", "Feirense Castelo", "Chaves Flávia", "Portimonense Praia", "Académica Coimbra", "Leixões Porto", "Mafra Real", "Vizela Azul", "Varzim Mar"],
  EN: ["Manchester Rubro", "Leeds Branco", "Sunderland Cats", "Fulham Cottage", "Bournemouth Cherry", "Brentford Bees", "Wolverhampton Gold", "Leicester Fox", "Burnley Clarets", "Southampton Saints", "Watford Hornets", "Middlesbrough River", "Blackburn Roses", "Derby Rams", "Stoke Potters", "West Bromwich", "Millwall Lions", "Preston North", "Hull Tigers", "Cardiff Dragons", "Swansea Whites", "Portsmouth Navy", "Birmingham Royal", "QPR Park"],
  ES: ["Osasuna Roja", "Getafe Azul", "Rayo Vallecano", "Espanyol Branco", "Alavés Norte", "Elche Palmeira", "Oviedo Real", "Las Palmas Solar", "Zaragoza Leões", "Valladolid Violeta", "Eibar Armería", "Huesca Pirineus", "Almería Deserto", "Cádiz Amarillo", "Málaga Costa", "Santander Racing", "Gijón Sporting", "Burgos Castelo", "Leganés Pepino", "Albacete Manchego", "Mirandés Ebro", "Castellón Branco"],
  IT: ["Como Lago", "Parma Ducal", "Verona Mastino", "Cagliari Sardo", "Lecce Salento", "Sassuolo Verde", "Empoli Toscano", "Monza Coroa", "Palermo Rosa", "Bari Galo", "Catanzaro Águia", "Cremona Cinza", "Frosinone Amarelo", "Sampdoria Mar", "Cesena Cavalo", "Mantova Virgil", "Modena Canário", "Reggiana Granata", "Salerno Mar", "Spezia Aquila"],
  DE: ["Augsburg Fênix", "Hoffenheim Azul", "Mönchen Verde", "Heidenheim Vermelho", "St Pauli Pirata", "Köln Bode", "Schalke Azul", "Hertha Berlin", "Düsseldorf Fortuna", "Paderborn SC", "Kaiserslautern", "Darmstadt Lírio", "Hannover Norte", "Nürnberg Clube", "Elversberg Saar", "Karlsruhe Baden", "Bochum Mineiro", "Kiel Cegonha"],
  FR: ["Auxerre Borgonha", "Le Havre Porto", "Reims Champagne", "Saint Étienne", "Montpellier Sul", "Brest Pirata", "Lorient Merlu", "Paris Vermelho", "Troyes Azul", "Guingamp Bretão", "Dunkerque Corsário", "Annecy Alpes", "Rodez Sangue", "Laval Tango", "Pau Pirineus", "Clermont Vulcão", "Ajaccio Corse", "Nancy Lorraine"],
  NL: ["Fortuna Sittard", "Sparta Rotterdam", "Go Ahead Águias", "Heracles Almelo", "Waalwijk Amarelo", "Tilburg Willem", "Excelsior Kralingen", "Cambuur Leeuwarden", "Den Haag Cegonha", "Emmen Vermelho", "Graafschap Azul", "Roda Kerkrade", "Helmond Sport", "Venlo VVV", "Oss Top", "Dordrecht Carneiro", "Telstar Branco", "Volendam Laranja"],
  MX: ["Querétaro Galo", "Juárez Frontera", "Necaxa Raio", "Puebla Franja", "San Luis Atlético", "Mazatlán Cañón", "Atlante Potro", "Morelia Monarca", "Leones Negros", "Tampico Jaiba", "Mineros Zacateca", "Venados Yucatán", "Correcaminos Norte", "Celaya Touro", "Cancún Caribe", "Oaxaca Alebrije", "La Paz Atlético", "Tapatío Jovem"],
  US: ["Cincinnati Orange", "Columbus Crewmen", "Philadelphia Bell", "Nashville Notes", "Minnesota Loons", "Houston Orbit", "Kansas Sporting", "Salt Lake Royals", "San Jose Quakes", "St Louis Arch", "Charlotte Crown", "Montreal Fleur", "Toronto Maple", "Vancouver Peak", "San Diego Tide", "Louisville City", "Charleston Battery", "Oakland Roots", "Indy Eleven", "Rhode Island Anchor", "Pittsburgh River", "Memphis Blues", "New Mexico Sun", "Colorado Springs"],
  JP: ["Machida Zelvia", "Kashiwa Sol", "Shonan Bellmare", "Niigata Albirex", "Okayama Fagiano", "Shimizu Pulse", "Tokyo Verdia", "Cerezo Osaka", "Júbilo Iwata", "Sendai Vegalta", "Chiba JEF", "Omiya Ardija", "Kofu Ventforet", "Yamagata Montedio", "Nagasaki Varen", "Mito Hollyhock", "Kumamoto Roasso", "Oita Trinita", "Ehime Laranja", "Yamaguchi Renofa"],
};

const NAME_POOLS: Record<CountryId, { first: string[]; last: string[] }> = {
  BR: { first: ["Caio", "Iure", "João", "Renan", "Davi", "Mateus", "Ramon", "Léo", "Gabriel", "Vinícius", "André", "Pedro"], last: ["Arberto", "Ares", "Luz", "Bastos", "Nobre", "Valente", "Serra", "Moura", "Rocha", "Freitas", "Dourado", "Teles", "Prado", "Farias"] },
  AR: { first: ["Tomás", "Lautaro", "Nico", "Santiago", "Facundo", "Bruno", "Julián", "Matías", "Franco", "Valentín", "Thiago", "Agustín"], last: ["Ferreyra", "Vega", "Peralta", "Ríos", "Paz", "Almada", "Sosa", "Luna", "Acosta", "Medina", "Romero", "Benítez", "Ponce", "Suárez"] },
  PT: { first: ["Tiago", "Afonso", "Diogo", "Tomé", "Gonçalo", "Rui", "Leandro", "Nuno", "João", "Duarte", "Vasco", "Pedro"], last: ["Neves", "Luz", "Serra", "Pires", "Vale", "Miranda", "Matos", "Rocha", "Coelho", "Faria", "Tavares", "Leite", "Nunes", "Vaz"] },
  EN: { first: ["Oliver", "Ethan", "Jamie", "Noah", "Leo", "Mason", "Jack", "Theo", "Harry", "Lewis", "Alfie", "Callum"], last: ["Grant", "Cole", "Rivers", "Brooks", "Turner", "Hill", "Palmer", "Ward", "Bennett", "Foster", "Clarke", "Stone", "Walker", "Reed"] },
  ES: { first: ["Iker", "Pablo", "Álvaro", "Hugo", "Nico", "Dani", "Mario", "Sergio", "Lamina", "Pedri", "Gavi", "Ferran"], last: ["Montes", "Sierra", "Roca", "León", "Valdés", "Cobo", "Soler", "Vidal", "Jamal", "Olmo", "Torres", "Ruiz", "Navarro", "Molina"] },
  IT: { first: ["Luca", "Matteo", "Enzo", "Marco", "Davide", "Nico", "Pietro", "Tommaso", "Andrea", "Alessio", "Federico", "Giacomo"], last: ["Moretti", "Romano", "Ricci", "Bellini", "Conti", "Gallo", "Serra", "Greco", "Rossi", "Bianchi", "Mancini", "Esposito", "Lombardi", "Ferrari"] },
  DE: { first: ["Lukas", "Jonas", "Felix", "Leon", "Noah", "Max", "Elias", "Finn", "Florian", "Julian", "Niklas", "Kai"], last: ["Adler", "Weber", "Hartmann", "Bauer", "Klein", "Vogel", "Wolf", "Krüger", "Schmidt", "Wagner", "Becker", "Koch", "Richter", "Hoffmann"] },
  FR: { first: ["Lucas", "Hugo", "Enzo", "Mathis", "Theo", "Noah", "Jules", "Adam", "Kylian", "Rayan", "Antoine", "Malik"], last: ["Moreau", "Laurent", "Dubois", "Bernard", "Girard", "Mercier", "Petit", "Fontaine", "Henry", "Leroux", "Diallo", "Camara", "Fofana", "Traoré"] },
  NL: { first: ["Daan", "Sem", "Luuk", "Finn", "Bram", "Mees", "Jesse", "Thijs", "Xavi", "Jorrit", "Sven", "Teun"], last: ["de Wit", "Bakker", "Smit", "Visser", "Bos", "Dekker", "Mulder", "Vos", "van Dijk", "de Jong", "Meijer", "Hoek", "Kuiper", "Prins"] },
  MX: { first: ["Santiago", "Mateo", "Diego", "Emilio", "Gael", "Iván", "Bruno", "Ángel", "Luis", "Jorge", "Raúl", "Carlos"], last: ["Cruz", "Reyes", "Navarro", "Rojas", "Mendoza", "Salgado", "Luna", "Paredes", "Vega", "Ochoa", "Montes", "Guzmán", "Ortega", "Flores"] },
  US: { first: ["Liam", "Mason", "Ethan", "Noah", "Logan", "Caleb", "Owen", "Aiden", "Tyler", "Jordan", "Miles", "Cameron"], last: ["Carter", "Reed", "Walker", "Bennett", "Cooper", "Foster", "Brooks", "Parker", "Miller", "Johnson", "Adams", "Morgan", "Bailey", "Turner"] },
  JP: { first: ["Haruto", "Ren", "Yuto", "Sora", "Kaito", "Riku", "Hinata", "Daiki", "Takumi", "Ao", "Ryota", "Kei"], last: ["Sato", "Takahashi", "Nakamura", "Kobayashi", "Ito", "Yamamoto", "Watanabe", "Mori", "Aoki", "Fujita", "Kato", "Shimizu", "Maeda", "Endo"] },
};

const LEAGUE_FORMATS: Record<CountryId, [LeagueFormat, LeagueFormat]> = {
  BR: [
    { teamCount: 20, rounds: 38, matchesPerRound: 10, directPromotion: 0, playoffPromotion: 0, directRelegation: 4, relegationPlayoff: 0, structure: "ida-e-volta", note: "20 clubes, 38 rodadas e quatro rebaixados" },
    { teamCount: 20, rounds: 38, matchesPerRound: 10, directPromotion: 2, playoffPromotion: 2, directRelegation: 4, relegationPlayoff: 0, structure: "ida-e-volta", note: "20 clubes; dois acessos diretos e dois por playoffs" },
  ],
  AR: [
    { teamCount: 30, rounds: 16, matchesPerRound: 15, directPromotion: 0, playoffPromotion: 0, directRelegation: 2, relegationPlayoff: 0, structure: "zonas-e-playoffs", note: "30 clubes em duas zonas, 16 jogos e mata-mata" },
    { teamCount: 36, rounds: 34, matchesPerRound: 18, directPromotion: 2, playoffPromotion: 0, directRelegation: 4, relegationPlayoff: 0, structure: "zonas-e-playoffs", note: "36 clubes em zonas nacionais" },
  ],
  PT: [
    { teamCount: 18, rounds: 34, matchesPerRound: 9, directPromotion: 0, playoffPromotion: 0, directRelegation: 2, relegationPlayoff: 1, structure: "ida-e-volta", note: "18 clubes; duas quedas diretas e uma repescagem" },
    { teamCount: 18, rounds: 34, matchesPerRound: 9, directPromotion: 2, playoffPromotion: 1, directRelegation: 2, relegationPlayoff: 0, structure: "ida-e-volta", note: "18 clubes; dois acessos e uma repescagem" },
  ],
  EN: [
    { teamCount: 20, rounds: 38, matchesPerRound: 10, directPromotion: 0, playoffPromotion: 0, directRelegation: 3, relegationPlayoff: 0, structure: "ida-e-volta", note: "20 clubes, 380 jogos e três rebaixados" },
    { teamCount: 24, rounds: 46, matchesPerRound: 12, directPromotion: 2, playoffPromotion: 1, directRelegation: 3, relegationPlayoff: 0, structure: "ida-e-volta", note: "24 clubes; dois acessos diretos e um por playoffs" },
  ],
  ES: [
    { teamCount: 20, rounds: 38, matchesPerRound: 10, directPromotion: 0, playoffPromotion: 0, directRelegation: 3, relegationPlayoff: 0, structure: "ida-e-volta", note: "20 clubes, 38 rodadas e três rebaixados" },
    { teamCount: 22, rounds: 42, matchesPerRound: 11, directPromotion: 2, playoffPromotion: 1, directRelegation: 4, relegationPlayoff: 0, structure: "ida-e-volta", note: "22 clubes; três acessos e quatro quedas" },
  ],
  IT: [
    { teamCount: 20, rounds: 38, matchesPerRound: 10, directPromotion: 0, playoffPromotion: 0, directRelegation: 3, relegationPlayoff: 0, structure: "ida-e-volta", note: "20 clubes e três rebaixados" },
    { teamCount: 20, rounds: 38, matchesPerRound: 10, directPromotion: 2, playoffPromotion: 1, directRelegation: 3, relegationPlayoff: 1, structure: "ida-e-volta", note: "20 clubes com playoffs de acesso e permanência" },
  ],
  DE: [
    { teamCount: 18, rounds: 34, matchesPerRound: 9, directPromotion: 0, playoffPromotion: 0, directRelegation: 2, relegationPlayoff: 1, structure: "ida-e-volta", note: "18 clubes; duas quedas e uma repescagem" },
    { teamCount: 18, rounds: 34, matchesPerRound: 9, directPromotion: 2, playoffPromotion: 1, directRelegation: 2, relegationPlayoff: 1, structure: "ida-e-volta", note: "18 clubes; dois acessos e duelo de repescagem" },
  ],
  FR: [
    { teamCount: 18, rounds: 34, matchesPerRound: 9, directPromotion: 0, playoffPromotion: 0, directRelegation: 2, relegationPlayoff: 1, structure: "ida-e-volta", note: "18 clubes; duas quedas e uma repescagem" },
    { teamCount: 18, rounds: 34, matchesPerRound: 9, directPromotion: 2, playoffPromotion: 1, directRelegation: 2, relegationPlayoff: 1, structure: "ida-e-volta", note: "18 clubes com playoffs de acesso" },
  ],
  NL: [
    { teamCount: 18, rounds: 34, matchesPerRound: 9, directPromotion: 0, playoffPromotion: 0, directRelegation: 2, relegationPlayoff: 1, structure: "ida-e-volta", note: "18 clubes; duas quedas diretas e playoffs" },
    { teamCount: 20, rounds: 38, matchesPerRound: 10, directPromotion: 2, playoffPromotion: 1, directRelegation: 0, relegationPlayoff: 0, structure: "ida-e-volta", note: "20 clubes; dois acessos diretos e playoffs" },
  ],
  MX: [
    { teamCount: 18, rounds: 17, matchesPerRound: 9, directPromotion: 0, playoffPromotion: 0, directRelegation: 0, relegationPlayoff: 0, structure: "apertura-e-playoffs", note: "18 clubes, turno curto e playoffs; sem rebaixamento" },
    { teamCount: 15, rounds: 14, matchesPerRound: 7, directPromotion: 0, playoffPromotion: 0, directRelegation: 0, relegationPlayoff: 0, structure: "apertura-e-playoffs", note: "15 clubes e playoffs; acesso suspenso" },
  ],
  US: [
    { teamCount: 30, rounds: 34, matchesPerRound: 15, directPromotion: 0, playoffPromotion: 0, directRelegation: 0, relegationPlayoff: 0, structure: "conferencias", note: "30 clubes, 34 jogos e playoffs por conferência; sem queda" },
    { teamCount: 24, rounds: 34, matchesPerRound: 12, directPromotion: 0, playoffPromotion: 0, directRelegation: 0, relegationPlayoff: 0, structure: "conferencias", note: "24 clubes em conferências independentes" },
  ],
  JP: [
    { teamCount: 20, rounds: 19, matchesPerRound: 10, directPromotion: 0, playoffPromotion: 0, directRelegation: 0, relegationPlayoff: 0, structure: "temporada-especial", note: "Temporada especial 2026 com 20 clubes e sem rebaixamento" },
    { teamCount: 20, rounds: 19, matchesPerRound: 10, directPromotion: 0, playoffPromotion: 0, directRelegation: 0, relegationPlayoff: 0, structure: "temporada-especial", note: "Temporada especial regional, sem acesso ou queda" },
  ],
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

function completeTeamNames(countryId: CountryId, division: DivisionLevel, names: string[], count: number) {
  const additions = CLUB_EXPANSIONS[countryId];
  const completed = [...names];
  let index = 0;
  while (completed.length < count) {
    const root = additions[index % additions.length];
    const cycle = Math.floor(index / additions.length);
    const suffix = cycle ? ` ${cycle + 1}` : "";
    completed.push(division === 1 ? `${root}${suffix}` : `Academia ${root}${suffix}`);
    index += 1;
  }
  return completed.slice(0, count);
}

const SQUAD_POSITIONS: SquadPlayer["position"][] = ["GOL", "LD", "ZAG", "ZAG", "LE", "VOL", "MEI", "PD", "PE", "ATA", "ATA"];

function makeSquad(countryId: CountryId, teamId: string, teamName: string, teamIndex: number, strength: number): SquadPlayer[] {
  const pool = NAME_POOLS[countryId];
  return SQUAD_POSITIONS.map((position, slot) => {
    const sequence = teamIndex * 11 + slot;
    const first = pool.first[sequence % pool.first.length];
    const last = pool.last[Math.floor(sequence / pool.first.length) % pool.last.length];
    const extra = sequence >= pool.first.length * pool.last.length ? ` ${pool.last[(sequence * 5 + 3) % pool.last.length]}` : "";
    return {
      id: `${teamId}-p${slot + 1}`,
      name: `${first} ${last}${extra}`,
      position,
      overall: Math.max(54, Math.min(91, strength + ((hashText(`${teamId}:${slot}`) % 11) - 5))),
      teamId,
      teamName,
      nationalityId: countryId,
      nationality: COUNTRY_META[countryId].name,
    };
  });
}

function makeTeams(countryId: CountryId, division: DivisionLevel, names: string[]) {
  const meta = COUNTRY_META[countryId];
  const baseStrength = division === 1 ? 77 : 66;
  return names.map((name, index): Team => {
    const [color, accent] = COLORS[index % COLORS.length];
    const prestigePosition = names.length <= 1 ? 0 : index / (names.length - 1);
    const prestigeBias = division === 1
      ? Math.round(6 - prestigePosition * 11)
      : Math.round(4 - prestigePosition * 8);
    const strengthWave = ((index * 5 + hashText(name)) % 5) - 2;
    const id = `${countryId.toLowerCase()}-${division}-${slugify(name)}`;
    const strength = baseStrength + prestigeBias + strengthWave;
    const squad = makeSquad(countryId, id, name, index, strength);
    return {
      id,
      name,
      short: shortCode(name),
      color,
      accent,
      strength,
      stars: squad.slice().sort((a, b) => b.overall - a.overall).slice(0, 3).map((player) => player.name),
      country: meta.name,
      countryId,
      division,
      squad,
    };
  });
}

function buildLeague(countryId: CountryId, division: DivisionLevel): LeagueDefinition {
  const meta = COUNTRY_META[countryId];
  const format = LEAGUE_FORMATS[countryId][division - 1];
  const baseNames = division === 1 ? TEAM_NAMES[countryId].first : TEAM_NAMES[countryId].second;
  return {
    id: `${countryId.toLowerCase()}-${division}`,
    name: meta.leagues[division - 1],
    countryId,
    countryName: meta.name,
    division,
    salaryBase: meta.salaries[division - 1],
    format,
    teams: makeTeams(countryId, division, completeTeamNames(countryId, division, baseNames, format.teamCount)),
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
    squad: makeSquad(career.countryId, career.clubId, career.clubName, 0, career.clubStrength),
  };
  return { ...league, teams: [playerTeam, ...league.teams.slice(0, league.format.teamCount - 1)] };
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

export function createInitialWorldPlayers(careerSeed: number, startingSeason = 2026): WorldPlayerState[] {
  return WORLD_TEAMS.flatMap((team) => team.squad.map((player, index) => {
    const seed = hashText(`world-player:${careerSeed}:${startingSeason}:${player.id}`);
    const age = 18 + (seed % 15);
    const growthRoom = age <= 22 ? 8 : age <= 26 ? 5 : 2;
    return {
      ...player,
      age,
      potential: Math.min(95, player.overall + 1 + (Math.floor(seed / 17) % growthRoom)),
      countryId: team.countryId,
      status: "Ativo" as const,
      overall: Math.max(52, player.overall - (index > 8 ? 1 : 0)),
    };
  }));
}

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

const opponentTactics: OpponentTactic[] = [
  {
    id: "pressao-alta",
    name: "Pressão sufocante",
    formation: "4-3-3",
    description: "Marca a saída, força decisões rápidas e deixa espaço nas costas.",
    pressing: 92,
    tempo: 82,
    defensiveLine: 86,
    width: 68,
    aggression: 82,
    risk: 74,
    strengths: ["recuperação no campo ofensivo", "volume depois da perda"],
    weaknesses: ["bola longa nas costas", "fadiga no terço final"],
    favoredKinds: ["defense", "counter"],
    exposedKinds: ["pass", "aerial"],
  },
  {
    id: "bloco-baixo",
    name: "Bloco compacto",
    formation: "5-4-1",
    description: "Protege a área, reduz espaços centrais e tenta sobreviver no contra-ataque.",
    pressing: 38,
    tempo: 44,
    defensiveLine: 32,
    width: 45,
    aggression: 54,
    risk: 28,
    strengths: ["proteção da área", "densidade pelo centro"],
    weaknesses: ["chutes de média distância", "trocas rápidas de corredor"],
    favoredKinds: ["defense", "aerial"],
    exposedKinds: ["shot", "corner"],
  },
  {
    id: "transicao",
    name: "Transição vertical",
    formation: "4-2-3-1",
    description: "Recupera e acelera pelos lados antes que a defesa consiga se reorganizar.",
    pressing: 66,
    tempo: 91,
    defensiveLine: 58,
    width: 76,
    aggression: 69,
    risk: 71,
    strengths: ["ataque ao espaço", "velocidade após recuperar"],
    weaknesses: ["posse prolongada", "perda da segunda bola"],
    favoredKinds: ["counter", "dribble"],
    exposedKinds: ["pass", "defense"],
  },
  {
    id: "posse",
    name: "Posse paciente",
    formation: "4-1-4-1",
    description: "Controla o ritmo, atrai a pressão e encontra o passe entre as linhas.",
    pressing: 57,
    tempo: 52,
    defensiveLine: 69,
    width: 63,
    aggression: 43,
    risk: 46,
    strengths: ["controle territorial", "superioridade entre linhas"],
    weaknesses: ["transição defensiva", "duelos em velocidade"],
    favoredKinds: ["pass", "dribble"],
    exposedKinds: ["counter", "aerial"],
  },
  {
    id: "jogo-direto",
    name: "Jogo direto",
    formation: "4-4-2",
    description: "Busca duelos, segunda bola e cruzamentos constantes para a área.",
    pressing: 71,
    tempo: 77,
    defensiveLine: 51,
    width: 79,
    aggression: 78,
    risk: 57,
    strengths: ["segunda bola", "cruzamentos e duelos"],
    weaknesses: ["espaço entre meio e defesa", "saída sob pressão"],
    favoredKinds: ["aerial", "corner"],
    exposedKinds: ["dribble", "pass"],
  },
  {
    id: "gegenpress",
    name: "Gegenpress coordenado",
    formation: "4-2-2-2",
    description: "Perde a bola e cerca imediatamente com quatro jogadores próximos.",
    pressing: 96,
    tempo: 88,
    defensiveLine: 82,
    width: 55,
    aggression: 90,
    risk: 81,
    strengths: ["pressão após a perda", "ataques curtos e frequentes"],
    weaknesses: ["inversão de jogo", "desgaste acelerado"],
    favoredKinds: ["defense", "shot"],
    exposedKinds: ["pass", "counter"],
  },
  {
    id: "amplitude",
    name: "Sobrecarga pelos lados",
    formation: "3-4-3",
    description: "Alarga o campo, cria dois contra um e ocupa a área com muitos jogadores.",
    pressing: 64,
    tempo: 75,
    defensiveLine: 62,
    width: 94,
    aggression: 67,
    risk: 68,
    strengths: ["superioridade nos corredores", "cruzamento no lado oposto"],
    weaknesses: ["espaço atrás dos alas", "inferioridade no centro"],
    favoredKinds: ["corner", "aerial"],
    exposedKinds: ["counter", "pass"],
  },
  {
    id: "losango",
    name: "Losango central",
    formation: "4-3-1-2",
    description: "Concentra jogadores por dentro, aproxima atacantes e domina segundas bolas.",
    pressing: 72,
    tempo: 69,
    defensiveLine: 65,
    width: 34,
    aggression: 73,
    risk: 55,
    strengths: ["superioridade central", "tabelas curtas"],
    weaknesses: ["amplitude defensiva", "troca de lado"],
    favoredKinds: ["pass", "shot"],
    exposedKinds: ["dribble", "corner"],
  },
  {
    id: "falso-nove",
    name: "Falso nove móvel",
    formation: "4-3-3",
    description: "O atacante recua, arrasta zagueiros e abre diagonais para os pontas.",
    pressing: 61,
    tempo: 64,
    defensiveLine: 73,
    width: 71,
    aggression: 48,
    risk: 62,
    strengths: ["ocupação entre linhas", "movimentos sem referência"],
    weaknesses: ["presença na área", "duelos contra bloco físico"],
    favoredKinds: ["pass", "dribble"],
    exposedKinds: ["defense", "aerial"],
  },
  {
    id: "marcacao-individual",
    name: "Encaixes individuais",
    formation: "3-5-2",
    description: "Cada recepção é perseguida, mesmo quando isso desmonta a estrutura original.",
    pressing: 84,
    tempo: 63,
    defensiveLine: 67,
    width: 58,
    aggression: 91,
    risk: 76,
    strengths: ["negação de tempo ao craque", "duelos constantes"],
    weaknesses: ["trocas de posição", "cartões e coberturas longas"],
    favoredKinds: ["defense", "freeKick"],
    exposedKinds: ["dribble", "pass"],
  },
  {
    id: "linha-alta",
    name: "Linha alta e impedimento",
    formation: "4-2-4",
    description: "Comprime o campo, arrisca a armadilha de impedimento e mantém muitos jogadores à frente.",
    pressing: 87,
    tempo: 86,
    defensiveLine: 97,
    width: 66,
    aggression: 77,
    risk: 92,
    strengths: ["campo curto", "armadilha de impedimento"],
    weaknesses: ["corridas em profundidade", "passe direto bem executado"],
    favoredKinds: ["defense", "counter"],
    exposedKinds: ["counter", "shot"],
  },
  {
    id: "catenaccio",
    name: "Catenaccio reativo",
    formation: "5-3-2",
    description: "Defende a área com sobra, aceita pouca posse e escolhe um momento para atacar.",
    pressing: 31,
    tempo: 58,
    defensiveLine: 26,
    width: 42,
    aggression: 64,
    risk: 24,
    strengths: ["cobertura profunda", "proteção de vantagem"],
    weaknesses: ["pressão territorial", "rebotes fora da área"],
    favoredKinds: ["defense", "counter"],
    exposedKinds: ["freeKick", "shot"],
  },
];

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

const emptyConsequenceModifiers: ConsequenceModifiers = {
  performance: 0,
  fatigue: 0,
  injuryRisk: 0,
  cardRisk: 0,
  coachTrust: 0,
  squadRelations: 0,
  reputation: 0,
  transferInterest: 0,
  morale: 0,
  income: 0,
};

export function getConsequenceModifiers(career: CareerState): ConsequenceModifiers {
  const modifiers = { ...emptyConsequenceModifiers };
  career.activeConsequences.forEach((consequence) => {
    (Object.keys(modifiers) as Array<keyof ConsequenceModifiers>).forEach((key) => {
      modifiers[key] += consequence.effects[key] ?? 0;
    });
  });

  modifiers.performance += career.personality.professionalism / 45 + career.personality.teamwork / 70;
  modifiers.cardRisk -= career.personality.professionalism / 9;
  modifiers.coachTrust += career.personality.professionalism / 24 + career.personality.teamwork / 32;
  modifiers.squadRelations += career.personality.teamwork / 22;
  modifiers.transferInterest += career.personality.ambition / 22 + career.personality.mediaStyle / 28 - career.personality.loyalty / 35;
  modifiers.morale += career.familyBond < 35 ? -4 : career.familyBond >= 82 ? 2 : 0;
  modifiers.performance += career.squadRelations >= 82 ? 1.5 : career.squadRelations < 38 ? -2.5 : 0;

  return {
    performance: clamp(Number(modifiers.performance.toFixed(1)), -12, 12),
    fatigue: clamp(Math.round(modifiers.fatigue), -18, 24),
    injuryRisk: clamp(Math.round(modifiers.injuryRisk), -30, 45),
    cardRisk: clamp(Math.round(modifiers.cardRisk), -28, 38),
    coachTrust: clamp(Math.round(modifiers.coachTrust), -18, 18),
    squadRelations: clamp(Math.round(modifiers.squadRelations), -18, 18),
    reputation: clamp(Math.round(modifiers.reputation), -12, 16),
    transferInterest: clamp(Math.round(modifiers.transferInterest), -18, 24),
    morale: clamp(Math.round(modifiers.morale), -12, 12),
    income: Math.round(modifiers.income),
  };
}

export function advanceCareerConsequences(career: CareerState) {
  const resolved = career.activeConsequences
    .filter((consequence) => consequence.remainingMatches <= 1)
    .map((consequence) => ({ ...consequence, remainingMatches: 0 }));
  const activeConsequences = career.activeConsequences
    .filter((consequence) => consequence.remainingMatches > 1)
    .map((consequence) => ({ ...consequence, remainingMatches: consequence.remainingMatches - 1 }));
  const triggeredEvent = resolved.find((consequence) => consequence.resolutionEvent)?.resolutionEvent ?? "";
  return {
    activeConsequences,
    resolved,
    consequenceHistory: [...resolved, ...career.consequenceHistory].slice(0, 40),
    triggeredEvent,
  };
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
  const round = Math.max(1, career.seasonRound || career.matches + 1);
  const pairing = getRoundPairings(league.teams, round).find(([home, away]) => home.id === career.clubId || away.id === career.clubId);
  if (pairing) return pairing[0].id === career.clubId ? pairing[1] : pairing[0];
  return league.teams.find((team) => team.id !== career.clubId) ?? league.teams[0];
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
    "A defesa quebra a primeira linha e conduz até o meio-campo.",
    "O volante gira sob pressão e muda completamente o lado da jogada.",
    "O goleiro segura a bola e pede calma antes de reiniciar.",
    "Uma cobertura perfeita evita o duelo dentro da área.",
    "A torcida vaia a troca de passes e exige mais velocidade.",
    "O lateral chega ao fundo, mas o cruzamento é bloqueado.",
    "A segunda bola fica viva e transforma o lance em um ataque perigoso.",
    "O árbitro conversa com os capitães depois de uma disputa mais quente.",
    "A marcação encaixa por alguns segundos e não deixa opção de passe.",
    `O ${fixture.opponent.name} tenta atrair a pressão para atacar o espaço vazio.`,
    minute > 75 ? "Os jogadores sentem o desgaste; cada corrida agora custa mais." : "As duas equipes ainda procuram entender onde está o espaço.",
  ];
  const kinds: MatchEvent["kind"][] = ["normal", "normal", "normal", "chance", "normal"];
  return { minute, text: pick(rng, templates), kind: pick(rng, kinds) };
}

function momentTemplates(position: Position, rng: () => number, star: string, forcedKind?: MomentKind) {
  const common: Array<Omit<MatchMoment, "id" | "minute" | "targets">> = [
    { title: "Quebre a pressão", prompt: "A marcação saltou. Escolha a saída antes que o espaço desapareça.", kind: "pass", pressure: "média", positionFocus: "Leitura coletiva" },
    { title: "Ataque o corredor", prompt: "Há campo livre e dois defensores desalinhados.", kind: "dribble", pressure: "média", positionFocus: "Condução vertical" },
    { title: "Drible em espaço curto", prompt: "Dois marcadores fecham a linha lateral. Escolha como escapar.", kind: "dribble", pressure: "alta", positionFocus: "Controle sob pressão" },
    { title: "A bola do jogo", prompt: "O goleiro deu um passo. Escolha canto e força.", kind: "shot", pressure: "alta", positionFocus: "Finalização" },
    { title: `Pare ${star}`, prompt: "O craque adversário acelera em direção à área. Antecipe a jogada.", kind: "defense", pressure: "alta", positionFocus: "Duelo defensivo" },
    { title: "Último passe", prompt: "Três companheiros atacam a área por caminhos diferentes.", kind: "pass", pressure: "alta", positionFocus: "Criação" },
    { title: "Segunda bola", prompt: "O rebote cai na entrada da área e a defesa ainda está desorganizada.", kind: "shot", pressure: "média", positionFocus: "Reação" },
    { title: "Saída sob risco", prompt: "Um passe seguro mantém a posse; um passe vertical desmonta o bloco.", kind: "pass", pressure: "baixa", positionFocus: "Construção" },
    { title: "Um contra um", prompt: "Você ficou isolado contra o marcador. Decida antes da cobertura.", kind: "dribble", pressure: "alta", positionFocus: "Improviso" },
    { title: "Falta na entrada da área", prompt: "A barreira está montada. Escolha a trajetória da cobrança.", kind: "freeKick", pressure: "alta", positionFocus: "Bola parada" },
    { title: "Escanteio decisivo", prompt: "A defesa alterna entre zona e marcação individual. Escolha a jogada ensaiada.", kind: "corner", pressure: "média", positionFocus: "Bola parada" },
    { title: "Pênalti sob pressão", prompt: "O goleiro tenta antecipar sua escolha. Defina canto e estilo da batida.", kind: "penalty", pressure: "alta", positionFocus: "Frieza" },
    { title: "Contra-ataque aberto", prompt: "Três contra três e muito campo pela frente. Escolha o ritmo da transição.", kind: "counter", pressure: "alta", positionFocus: "Transição" },
    { title: "Duelo pelo alto", prompt: "O cruzamento vem forte entre zagueiro e goleiro. Ataque o espaço certo.", kind: "aerial", pressure: "média", positionFocus: "Jogo aéreo" },
  ];
  const positional: Record<Position, Array<Omit<MatchMoment, "id" | "minute" | "targets">>> = {
    Atacante: [
      { title: "Ataque a última linha", prompt: "O zagueiro olha para a bola. Escolha o momento da ruptura sem cair em impedimento.", kind: "shot", pressure: "alta", positionFocus: "Movimento de atacante" },
      { title: "Pivô na entrada da área", prompt: "O contato vem por trás e dois companheiros se aproximam.", kind: "pass", pressure: "média", positionFocus: "Pivô de atacante" },
    ],
    Ponta: [
      { title: "Isole o lateral", prompt: "Você recebe aberto, com campo para cortar por dentro ou ganhar a linha de fundo.", kind: "dribble", pressure: "alta", positionFocus: "Duelo de ponta" },
      { title: "Diagonal nas costas", prompt: "A defesa acompanha a bola e abre o corredor entre lateral e zagueiro.", kind: "counter", pressure: "alta", positionFocus: "Diagonal de ponta" },
    ],
    Meia: [
      { title: "Controle o ritmo", prompt: "O bloco rival está indeciso. Acelere, atraia ou encontre a ruptura.", kind: "pass", pressure: "média", positionFocus: "Visão de meia" },
      { title: "Entre linhas", prompt: "Você recebe de costas no espaço mais disputado do campo.", kind: "dribble", pressure: "alta", positionFocus: "Giro de meia" },
    ],
    Lateral: [
      { title: "Dois contra um no corredor", prompt: "O ponta rival recebe apoio e tenta criar superioridade.", kind: "defense", pressure: "alta", positionFocus: "Cobertura de lateral" },
      { title: "Ultrapassagem surpresa", prompt: "A ponta prende o marcador e libera o corredor até a área.", kind: "corner", pressure: "média", positionFocus: "Apoio de lateral" },
    ],
    Zagueiro: [
      { title: "Proteja a profundidade", prompt: "O atacante ameaça correr nas costas. Escolha entre antecipar e recuar.", kind: "defense", pressure: "alta", positionFocus: "Leitura de zagueiro" },
      { title: "Saída do primeiro passe", prompt: "A pressão fecha o volante e obriga você a iniciar a construção.", kind: "pass", pressure: "média", positionFocus: "Construção de zagueiro" },
    ],
  };
  const preferred: Record<Position, MomentKind[]> = {
    Atacante: ["shot", "dribble", "aerial", "penalty", "counter", "freeKick"],
    Ponta: ["dribble", "corner", "counter", "pass", "freeKick", "shot"],
    Meia: ["pass", "freeKick", "corner", "counter", "dribble", "shot"],
    Lateral: ["pass", "defense", "corner", "counter", "aerial", "dribble"],
    Zagueiro: ["defense", "aerial", "pass", "defense", "corner", "counter"],
  };
  const kind = forcedKind ?? pick(rng, preferred[position]);
  const pool = [...positional[position], ...common].filter((item) => item.kind === kind);
  return pick(rng, pool.length ? pool : common.filter((item) => item.kind === kind));
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
      { label: "Caneta e aceleração", hint: "surpreender no primeiro toque", x: 72, y: 24, risk: .52, reward: 35 },
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
      { label: "Folha seca", hint: "queda atrás da barreira", x: 87, y: 45, risk: .48, reward: 36 },
    ],
    corner: [
      { label: "Primeiro pau", hint: "desvio rápido", x: 86, y: 29, risk: .24, reward: 22 },
      { label: "Marca do pênalti", hint: "buscar o cabeceador", x: 78, y: 51, risk: .31, reward: 26 },
      { label: "Curto", hint: "criar novo ângulo", x: 69, y: 76, risk: .12, reward: 14 },
      { label: "Segunda trave", hint: "atacar o lado cego", x: 91, y: 68, risk: .39, reward: 31 },
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
      { label: "Passe de primeira", hint: "romper sem dominar", x: 82, y: 69, risk: .46, reward: 34 },
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

export function generateMatchPlan(career: CareerState, fixture = createFixture(career), showcase = false): MatchPlan {
  const rng = makeRng(fixture.seed ^ hashText(`${career.position}:${career.archetype}`));
  const consequenceModifiers = getConsequenceModifiers(career);
  const consequenceNarratives = career.activeConsequences
    .slice(0, 3)
    .map((consequence) => `${consequence.title}: ${consequence.description}`);
  const previousMeetings = career.matchHistory.filter((match) => match.opponentId === fixture.opponent.id);
  const tacticIndex = (hashText(`${fixture.opponent.id}:${fixture.seed}:tactic`) + previousMeetings.length * 5) % opponentTactics.length;
  const opponentTactic = opponentTactics[tacticIndex];
  const positionKinds: Record<Position, MomentKind[]> = {
    Atacante: ["shot", "aerial", "counter"],
    Ponta: ["dribble", "counter", "corner"],
    Meia: ["pass", "freeKick", "corner"],
    Lateral: ["defense", "pass", "corner"],
    Zagueiro: ["defense", "aerial", "pass"],
  };
  const exploitableKinds = opponentTactic.exposedKinds.filter((kind) => positionKinds[career.position].includes(kind));
  const preparedBonus = career.weeklyAction === "Treino tático" || career.preparationLog.includes("Treino tático") ? 5 : 0;
  const skillMatch = exploitableKinds.length * 4 + preparedBonus;
  const effectiveEnergy = clamp(career.energy - consequenceModifiers.fatigue, 10, 100);
  const physicalPenalty = Math.max(0, opponentTactic.pressing - effectiveEnergy) / 7;
  const tacticalAdvantage = clamp(Math.round(skillMatch - physicalPenalty + (career.adaptation - 70) / 15 + consequenceModifiers.performance / 2), -16, 20);
  const instructionKind = exploitableKinds[0] ?? opponentTactic.exposedKinds[0];
  const tacticalInstruction = {
    pass: "circule rápido e encontre o lado oposto antes do encaixe",
    shot: "ataque os rebotes e finalize antes de o bloco fechar",
    dribble: "troque de posição e desafie o marcador fora de sua zona",
    defense: "antecipe a referência e proteja a segunda bola",
    freeKick: "force contatos perto da área e explore a bola parada",
    corner: "ataque a zona mais distante da primeira cobertura",
    penalty: "invada a área com conduções curtas e obrigue o bote",
    counter: "acelere imediatamente no espaço deixado pela linha",
    aerial: "ataque a segunda trave e domine o duelo físico",
  }[instructionKind];
  const rivalryConsequence = career.activeConsequences.some((consequence) => consequence.key === "duelo-pessoal" || consequence.key === "holofotes") ? 18 : 0;
  const rivalryLevel = clamp(previousMeetings.length * 18 + (fixture.competitionType !== "league" ? 16 : 0) + rivalryConsequence, 0, 100);
  const overall = Object.values(career.attributes).reduce((total, value) => total + value, 0) / 6;
  const fatigueReadiness = (effectiveEnergy - 72) / 210;
  const playerStrength = career.clubStrength
    + (overall - 68) * .075
    + career.formBoost * .22
    + (career.morale + consequenceModifiers.morale - 70) * .023
    + consequenceModifiers.performance * .055;
  const strengthGap = playerStrength - fixture.opponent.strength;
  const homeEffect = fixture.home ? .13 : -.1;
  const difficultyEffect = career.difficulty === "Lenda" ? -.1 : career.difficulty === "Promessa" ? .07 : 0;
  const importance = clamp(
    .54
      + (fixture.competitionType === "continental" ? .26 : fixture.competitionType === "cup" ? .18 : 0)
      + (Math.abs(strengthGap) <= 4 ? .12 : 0)
      + rivalryLevel / 850
      + (fixture.pressure.includes("liderança") || fixture.pressure.includes("permanência") ? .1 : 0),
    .5,
    1,
  );
  const tacticForEffect = (opponentTactic.risk - 55) / 320 + tacticalAdvantage / 125;
  const tacticAgainstEffect = (opponentTactic.tempo + opponentTactic.aggression - 125) / 520 - tacticalAdvantage / 210;
  const expectedFor = clamp(.99 + strengthGap * .024 + homeEffect + difficultyEffect + fatigueReadiness + tacticForEffect, .28, 2.16);
  const expectedAgainst = clamp(1.12 - strengthGap * .023 - homeEffect * .72 - difficultyEffect * .38 - fatigueReadiness * .3 + tacticAgainstEffect, .34, 2.24);
  const baseHomeGoals = samplePoisson(rng, expectedFor);
  const baseAwayGoals = samplePoisson(rng, expectedAgainst);
  const intensity = .66 + rng() * .48 + importance * .2;
  const unavailableReason = career.suspensionMatches > 0
    ? `Suspenso por ${career.suspensionMatches} partida(s)`
    : career.injuryMatchesRemaining > 0
      ? `${career.injuryStatus} · ${career.injuryMatchesRemaining} jogo(s) de recuperação`
      : "";
  const playerAvailable = !unavailableReason;
  const eventCount = 14 + Math.floor(rng() * 9);
  const momentCount = playerAvailable ? (showcase ? 9 : 5 + Math.floor(rng() * 3)) : 0;
  const eventMinutes = uniqueMinutes(rng, eventCount);
  const momentMinutes = uniqueMinutes(rng, momentCount, 8, 86);

  const goalMinutesFor = new Set(uniqueMinutes(rng, baseHomeGoals, 5, 88));
  const goalMinutesAgainst = new Set(uniqueMinutes(rng, baseAwayGoals, 5, 88));
  const allEventMinutes = [...new Set([...eventMinutes, ...goalMinutesFor, ...goalMinutesAgainst])].sort((a, b) => a - b);
  const events: MatchEvent[] = allEventMinutes.map((minute) => {
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

  const specialCount = 8 + Math.floor(rng() * 7);
  const specialMinutes = uniqueMinutes(rng, specialCount, 7, 87);
  let specialIndex = 0;
  const addSpecialEvent = (event: Omit<MatchEvent, "minute">) => {
    const minute = specialMinutes[specialIndex];
    specialIndex += 1;
    if (minute !== undefined) events.push({ minute, ...event });
  };
  const yellowCount = 1 + Math.floor(opponentTactic.aggression / 28) + Math.floor(rng() * 3);
  for (let index = 0; index < yellowCount && specialIndex < specialMinutes.length; index += 1) {
    const affectsPlayer = playerAvailable && rng() < Math.max(.035, (100 - career.discipline + opponentTactic.aggression * .12 + consequenceModifiers.cardRisk) / 160);
    const side = affectsPlayer ? "player" : rng() > .46 ? "opponent" : "player";
    addSpecialEvent({
      kind: "yellow-card",
      side,
      affectsPlayer,
      text: affectsPlayer
        ? `${career.name} chega atrasado na disputa e recebe cartão amarelo.`
        : `${side === "opponent" ? fixture.opponent.name : career.clubName} interrompe a transição com falta. Cartão amarelo.`,
    });
  }
  if (specialIndex < specialMinutes.length && rng() < .055 + opponentTactic.aggression / 1_350 + (100 - career.discipline + consequenceModifiers.cardRisk) / 1_050) {
    const affectsPlayer = playerAvailable && rng() < Math.max(.02, (100 - career.discipline + consequenceModifiers.cardRisk) / 310);
    const side = affectsPlayer ? "player" : rng() > .5 ? "opponent" : "player";
    addSpecialEvent({
      kind: "red-card",
      side,
      affectsPlayer,
      text: affectsPlayer
        ? `${career.name} é expulso depois de uma entrada perigosa.`
        : `Cartão vermelho! ${side === "opponent" ? fixture.opponent.name : career.clubName} fica com dez jogadores.`,
    });
  }
  const offsideCount = 1 + Math.floor(opponentTactic.defensiveLine / 34) + Math.floor(rng() * 2);
  for (let index = 0; index < offsideCount && specialIndex < specialMinutes.length; index += 1) {
    const side = rng() > .5 ? "opponent" : "player";
    addSpecialEvent({
      kind: "offside",
      side,
      text: side === "player"
        ? `Impedimento marcado. A última linha do ${fixture.opponent.name} sobe no instante certo.`
        : `${fixture.opponent.name} balança a rede, mas o assistente já marcava impedimento.`,
    });
  }
  if (specialIndex < specialMinutes.length) {
    addSpecialEvent({
      kind: "tactical",
      side: "opponent",
      text: `${fixture.opponent.name} ajusta o ${opponentTactic.formation}: ${opponentTactic.description}`,
    });
  }
  if (specialIndex < specialMinutes.length) {
    const affectsPlayer = playerAvailable && rng() < .32;
    addSpecialEvent({
      kind: "substitution",
      side: affectsPlayer ? "player" : "neutral",
      affectsPlayer,
      text: affectsPlayer
        ? `O treinador conversa com o banco e avalia a condição de ${career.name}.`
        : "Os dois bancos se movimentam e renovam a intensidade para o trecho final.",
    });
  }
  if (specialIndex < specialMinutes.length && rng() < .018 + Math.max(0, career.injuryRisk + consequenceModifiers.injuryRisk) / 600 + opponentTactic.aggression / 2_400) {
    const affectsPlayer = playerAvailable && rng() < .42;
    addSpecialEvent({
      kind: "injury",
      side: affectsPlayer ? "player" : "opponent",
      affectsPlayer,
      text: affectsPlayer
        ? `${career.name} sente a musculatura e pede atendimento imediatamente.`
        : `O jogo para para atendimento médico. ${fixture.opponent.name} prepara uma substituição.`,
    });
  }
  events.sort((a, b) => a.minute - b.minute || a.kind.localeCompare(b.kind));

  const moments = momentMinutes.map((minute, index) => {
    const showcaseKinds: MomentKind[] = ["pass", "dribble", "shot", "defense", "freeKick", "corner", "penalty", "counter", "aerial"];
    const matchupKind = rng() < .48
      ? pick(rng, exploitableKinds.length ? exploitableKinds : opponentTactic.exposedKinds)
      : undefined;
    const template = momentTemplates(career.position, rng, pick(rng, fixture.opponent.stars), showcase ? showcaseKinds[index] : matchupKind);
    const latePressure = minute >= 75;
    const context = latePressure
      ? " O placar está aberto e o rival vai alterar a postura depois desta decisão."
      : minute <= 20
        ? " O jogo ainda procura um dono e a primeira vantagem pode mudar o plano tático."
        : " O posicionamento do adversário já revela onde a partida pode ser decidida.";
    const targets = targetsFor(template.kind, rng).map((target) => ({
      ...target,
      roll: Math.max(0, target.roll - attributeForMoment(career, template.kind) - tacticalAdvantage / 900 + (latePressure ? .015 : 0)),
    }));
    return {
      ...template,
      prompt: `${template.prompt}${context}`,
      pressure: latePressure || importance >= .86 ? "alta" as const : template.pressure,
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
    t: opponentTactic.id,
    i: importance.toFixed(3),
  })).toString(36);

  const possession = clamp(Math.round(50 + strengthGap * .42 + (opponentTactic.id === "posse" ? -8 : opponentTactic.id === "bloco-baixo" ? 7 : 0) + (rng() - .5) * 9), 31, 69);
  const playerShots = Math.max(baseHomeGoals + 2, Math.round(5 + expectedFor * 4.3 + rng() * 4));
  const opponentShots = Math.max(baseAwayGoals + 2, Math.round(5 + expectedAgainst * 4.4 + rng() * 4));
  const playerOnTarget = clamp(Math.round(playerShots * (.31 + rng() * .18)), baseHomeGoals, playerShots);
  const opponentOnTarget = clamp(Math.round(opponentShots * (.3 + rng() * .18)), baseAwayGoals, opponentShots);
  const playerYellowCards = events.filter((event) => event.kind === "yellow-card" && event.side === "player").length;
  const opponentYellowCards = events.filter((event) => event.kind === "yellow-card" && event.side === "opponent").length;
  const playerRedCards = events.filter((event) => event.kind === "red-card" && event.side === "player").length;
  const opponentRedCards = events.filter((event) => event.kind === "red-card" && event.side === "opponent").length;
  const statistics: MatchStatistics = {
    playerTeam: {
      possession,
      shots: playerShots,
      shotsOnTarget: playerOnTarget,
      bigChances: Math.max(baseHomeGoals, Math.round(expectedFor + rng() * 2)),
      corners: Math.floor(2 + expectedFor * 1.6 + rng() * 4),
      fouls: 8 + Math.floor(intensity * 4 + rng() * 6),
      offsides: events.filter((event) => event.kind === "offside" && event.side === "player").length,
      yellowCards: playerYellowCards,
      redCards: playerRedCards,
      expectedGoals: Number(expectedFor.toFixed(2)),
    },
    opponent: {
      possession: 100 - possession,
      shots: opponentShots,
      shotsOnTarget: opponentOnTarget,
      bigChances: Math.max(baseAwayGoals, Math.round(expectedAgainst + rng() * 2)),
      corners: Math.floor(2 + expectedAgainst * 1.6 + rng() * 4),
      fouls: 8 + Math.floor(intensity * 4 + rng() * 6),
      offsides: events.filter((event) => event.kind === "offside" && event.side === "opponent").length,
      yellowCards: opponentYellowCards,
      redCards: opponentRedCards,
      expectedGoals: Number(expectedAgainst.toFixed(2)),
    },
  };

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
    importance,
    opponentTactic,
    statistics,
    playerAvailable,
    unavailableReason,
    tacticalAdvantage,
    tacticalInstruction,
    rivalryLevel,
    consequenceModifiers,
    consequenceNarratives,
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

function emptySeasonRecord(teamId: string): TeamSeasonRecord {
  return { teamId, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] };
}

function getRoundPairings(teams: Team[], round: number) {
  const rotation: Array<Team | null> = teams.length % 2 ? [...teams, null] : [...teams];
  const cycleLength = rotation.length - 1;
  const step = (Math.max(1, round) - 1) % cycleLength;
  const returnLeg = Math.floor((Math.max(1, round) - 1) / cycleLength) % 2 === 1;
  for (let index = 0; index < step; index += 1) rotation.splice(1, 0, rotation.pop() ?? null);
  const pairs: Array<[Team, Team]> = [];
  for (let index = 0; index < rotation.length / 2; index += 1) {
    const left = rotation[index];
    const right = rotation[rotation.length - 1 - index];
    if (!left || !right) continue;
    const swap = (index === 0 ? step % 2 === 1 : index % 2 === 1) !== returnLeg;
    pairs.push(swap ? [right, left] : [left, right]);
  }
  return pairs;
}

function initialLeagueLeaders(league: LeagueDefinition): LeaguePlayerStat[] {
  return league.teams.flatMap((team) => team.squad.map((player) => ({ ...player, goals: 0, assists: 0, appearances: 0 })));
}

function addResultToRecord(record: TeamSeasonRecord, goalsFor: number, goalsAgainst: number) {
  const result = goalsFor > goalsAgainst ? "V" : goalsFor === goalsAgainst ? "E" : "D";
  return {
    ...record,
    played: record.played + 1,
    wins: record.wins + (result === "V" ? 1 : 0),
    draws: record.draws + (result === "E" ? 1 : 0),
    losses: record.losses + (result === "D" ? 1 : 0),
    goalsFor: record.goalsFor + goalsFor,
    goalsAgainst: record.goalsAgainst + goalsAgainst,
    points: record.points + (result === "V" ? 3 : result === "E" ? 1 : 0),
    form: [result, ...record.form].slice(0, 5),
  };
}

export function simulateFullRound(
  career: CareerState,
  userResult: { clubGoals: number; opponentGoals: number; opponentId: string; goals: number; assists: number },
) {
  const league = getCareerLeague(career);
  const validTeamIds = new Set(league.teams.map((team) => team.id));
  const existingTable = career.leagueTable.length && career.leagueTable.every((record) => validTeamIds.has(record.teamId))
    ? career.leagueTable
    : league.teams.map((team) => emptySeasonRecord(team.id));
  const records = new Map(existingTable.map((record) => [record.teamId, { ...record, form: [...record.form] }]));
  const leaderSource = career.leagueLeaders.length ? career.leagueLeaders : initialLeagueLeaders(league);
  const leaders = new Map(leaderSource.filter((player) => validTeamIds.has(player.teamId)).map((player) => [player.id, { ...player }]));
  const careerPlayerId = `career-player-${career.id}`;
  if (!leaders.has(careerPlayerId)) {
    const nationality = COUNTRIES.find((country) => country.name === career.nationality);
    leaders.set(careerPlayerId, {
      id: careerPlayerId,
      name: career.name,
      position: career.position === "Zagueiro" ? "ZAG" : career.position === "Lateral" ? "LD" : career.position === "Meia" ? "MEI" : career.position === "Ponta" ? "PE" : "ATA",
      overall: getOverall(career),
      teamId: career.clubId,
      teamName: career.clubName,
      nationalityId: nationality?.id ?? career.countryId,
      nationality: career.nationality,
      goals: 0,
      assists: 0,
      appearances: 0,
    });
  }

  const results: RoundMatchResult[] = [];
  const pairs = getRoundPairings(league.teams, career.seasonRound);
  const roundRng = makeRng(hashText(`round:${career.careerSeed}:${career.season}:${career.leagueId}:${career.seasonRound}`));

  function creditTeam(team: Team, goals: number, forcedGoals = 0, forcedAssists = 0) {
    const squad = team.squad.filter((player) => player.position !== "GOL");
    const careerPlayer = leaders.get(careerPlayerId);
    if (team.id === career.clubId && careerPlayer) {
      careerPlayer.goals += forcedGoals;
      careerPlayer.assists += forcedAssists;
      careerPlayer.appearances += 1;
    }
    for (const player of team.squad) {
      const stat = leaders.get(player.id);
      if (stat) stat.appearances += 1;
    }
    const remainingGoals = Math.max(0, goals - forcedGoals);
    for (let goal = 0; goal < remainingGoals; goal += 1) {
      const scorer = squad[Math.floor(roundRng() * squad.length)];
      const scorerStat = leaders.get(scorer.id);
      if (scorerStat) scorerStat.goals += 1;
      if (roundRng() < .72) {
        const possible = squad.filter((player) => player.id !== scorer.id);
        const assister = possible[Math.floor(roundRng() * possible.length)];
        const assisterStat = leaders.get(assister.id);
        if (assisterStat) assisterStat.assists += 1;
      }
    }
  }

  for (const [home, away] of pairs) {
    const isCareerMatch = home.id === career.clubId || away.id === career.clubId;
    let homeGoals: number;
    let awayGoals: number;
    if (isCareerMatch) {
      const careerAtHome = home.id === career.clubId;
      homeGoals = careerAtHome ? userResult.clubGoals : userResult.opponentGoals;
      awayGoals = careerAtHome ? userResult.opponentGoals : userResult.clubGoals;
      creditTeam(home, homeGoals, careerAtHome ? userResult.goals : 0, careerAtHome ? userResult.assists : 0);
      creditTeam(away, awayGoals, careerAtHome ? 0 : userResult.goals, careerAtHome ? 0 : userResult.assists);
    } else {
      const strengthGap = (home.strength - away.strength) / 18;
      homeGoals = samplePoisson(roundRng, clamp(1.28 + strengthGap * .34, .45, 2.15));
      awayGoals = samplePoisson(roundRng, clamp(1.08 - strengthGap * .3, .4, 1.95));
      creditTeam(home, homeGoals);
      creditTeam(away, awayGoals);
    }
    records.set(home.id, addResultToRecord(records.get(home.id) ?? emptySeasonRecord(home.id), homeGoals, awayGoals));
    records.set(away.id, addResultToRecord(records.get(away.id) ?? emptySeasonRecord(away.id), awayGoals, homeGoals));
    results.push({ homeId: home.id, homeName: home.name, awayId: away.id, awayName: away.name, homeGoals, awayGoals });
  }

  return {
    leagueTable: [...records.values()],
    leagueLeaders: [...leaders.values()],
    lastRoundResults: results,
  };
}

export function generateStandings(career: CareerState): StandingRow[] {
  const league = getCareerLeague(career);
  const recordMap = new Map(career.leagueTable.map((record) => [record.teamId, record]));
  if (career.leagueTable.length) {
    return league.teams
      .map((team) => {
        const record = recordMap.get(team.id) ?? emptySeasonRecord(team.id);
        return {
          position: 0,
          team,
          played: record.played,
          wins: record.wins,
          draws: record.draws,
          losses: record.losses,
          goalsFor: record.goalsFor,
          goalsAgainst: record.goalsAgainst,
          goalDifference: record.goalsFor - record.goalsAgainst,
          points: record.points,
          form: record.form,
          isPlayerTeam: team.id === career.clubId,
        };
      })
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
      .map((row, index) => ({ ...row, position: index + 1 }));
  }
  const rng = makeRng(hashText(`table:${career.careerSeed}:${career.season}:${career.seasonMatches}:${career.leagueId}`));
  const played = Math.min(league.format.rounds, career.seasonMatches);
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

export function getClubLeaders(career: CareerState) {
  const league = getCareerLeague(career);
  const stats = career.leagueLeaders.length ? career.leagueLeaders : initialLeagueLeaders(league);
  return league.teams.map((team) => {
    const players = stats.filter((player) => player.teamId === team.id);
    return {
      team,
      scorer: players.slice().sort((a, b) => b.goals - a.goals || b.overall - a.overall)[0],
      assister: players.slice().sort((a, b) => b.assists - a.assists || b.overall - a.overall)[0],
    };
  });
}

export function getWorldRanking(career: CareerState) {
  const nationality = COUNTRIES.find((country) => country.name === career.nationality);
  const position: WorldPlayerState["position"] = career.position === "Zagueiro"
    ? "ZAG"
    : career.position === "Lateral"
      ? "LD"
      : career.position === "Meia"
        ? "MEI"
        : career.position === "Ponta"
          ? "PE"
          : "ATA";
  const careerPlayer: WorldPlayerState = {
    id: `career-player-${career.id}`,
    name: career.name,
    position,
    overall: getOverall(career),
    teamId: career.clubId,
    teamName: career.clubName,
    nationalityId: nationality?.id ?? career.countryId,
    nationality: career.nationality,
    age: career.age,
    potential: Math.min(99, getOverall(career) + Math.max(2, 27 - career.age)),
    countryId: nationality?.id ?? career.countryId,
    status: "Ativo",
  };
  return [
    ...career.worldPlayers.filter((player) => player.status === "Ativo"),
    careerPlayer,
  ].sort((a, b) => b.overall - a.overall || b.potential - a.potential);
}

function getCareerSquadRole(overall: number, teamStrength: number): CareerSquadRole {
  const gap = overall - teamStrength;
  if (gap >= 5) return "Estrela";
  if (gap >= 0) return "Titular";
  if (gap >= -4) return "Rotação";
  return "Projeto";
}

export function getCareerTransferOffers(career: CareerState): CareerTransferOffer[] {
  const overall = getOverall(career);
  const consequenceModifiers = getConsequenceModifiers(career);
  const cycle = Math.floor(Math.max(0, career.seasonRound - 1) / 4);
  const profileLevel = overall
    + (career.reputation + consequenceModifiers.reputation - 30) / 12
    + (career.rating - 6.8) * 2.2
    + Math.min(4, career.matches / 18)
    + consequenceModifiers.transferInterest / 8;
  const candidates = TEAMS
    .filter((team) => team.id !== career.clubId)
    .map((team) => {
      const league = getLeagueDefinition(team.countryId, team.division);
      const seed = hashText(`career-market:${career.careerSeed}:${career.season}:${cycle}:${team.id}`);
      const requiredReputation = clamp(Math.round((team.strength - 56) * 1.45 - Math.max(0, overall - team.strength) * .7), 10, 88);
      const requiredRating = team.strength >= 84 ? 7.5 : team.strength >= 79 ? 7.2 : team.strength >= 73 ? 6.9 : 6.5;
      const requiredMatches = team.division === 1 ? 6 : 3;
      const interest = clamp(Math.round(
        60
        + (overall - team.strength) * 2.4
        + (career.reputation - requiredReputation) * .55
        + (career.rating - requiredRating) * 11
        + Math.min(8, career.matches / 5)
        + consequenceModifiers.transferInterest
        + consequenceModifiers.reputation * .5
        + (seed % 13) - 6,
      ), 18, 98);
      const role = getCareerSquadRole(overall, team.strength);
      const available = career.matches >= requiredMatches
        && career.reputation >= requiredReputation
        && career.rating >= requiredRating
        && interest >= 58;
      const requirement = career.matches < requiredMatches
        ? `${requiredMatches} partidas profissionais`
        : career.reputation < requiredReputation
          ? `reputação ${requiredReputation}`
          : career.rating < requiredRating
            ? `nota média ${requiredRating.toFixed(1)}`
            : interest < 58
              ? "mais boas atuações"
              : "proposta pronta";
      const salaryBase = getSalary(team.countryId, team.division, Math.max(career.reputation, requiredReputation));
      const salary = Math.round(Math.max(
        salaryBase * (.9 + Math.max(0, team.strength - 60) / 72),
        available ? career.salary * (team.strength >= career.clubStrength ? 1.08 : .92) : salaryBase,
      ) / 100) * 100;
      const transferFee = Math.round(Math.max(
        career.marketValue * (.82 + Math.max(0, team.strength - career.clubStrength) / 55),
        overall * overall * 5_800,
      ) / 100_000) * 100_000;
      const contractLength = role === "Projeto" ? 5 : role === "Estrela" ? 3 : 4;
      const score = 240
        - Math.abs(team.strength - profileLevel) * 9
        + (team.division === 1 ? 16 : 0)
        + (team.countryId !== career.countryId ? 7 : 0)
        + consequenceModifiers.transferInterest
        + seed % 47;
      return {
        score,
        offer: {
          id: `offer-${career.season}-${cycle}-${team.id}`,
          generatedSeason: career.season,
          generatedRound: career.seasonRound,
          teamId: team.id,
          teamName: team.name,
          teamShort: team.short,
          teamColor: team.color,
          teamStrength: team.strength,
          countryId: team.countryId,
          countryName: team.country,
          division: team.division,
          leagueId: league.id,
          leagueName: league.name,
          interest,
          transferFee,
          salary,
          signingBonus: Math.round(salary * (role === "Estrela" ? 3 : role === "Titular" ? 2 : 1.2) / 1_000) * 1_000,
          contractUntilSeason: career.season + contractLength,
          releaseClause: Math.round(transferFee * (role === "Projeto" ? 2.6 : 2.1) / 100_000) * 100_000,
          role,
          available,
          requirement,
        } satisfies CareerTransferOffer,
      };
    })
    .sort((a, b) => b.score - a.score);

  const selected: typeof candidates = [];
  const addCandidate = (candidate: (typeof candidates)[number] | undefined) => {
    if (candidate && !selected.some((item) => item.offer.teamId === candidate.offer.teamId)) selected.push(candidate);
  };
  candidates.filter((candidate) => candidate.offer.available).slice(0, 3).forEach(addCandidate);
  addCandidate(candidates.find((candidate) => candidate.offer.countryId !== career.countryId && candidate.offer.available));
  addCandidate(candidates.find((candidate) => !candidate.offer.available && candidate.offer.teamStrength > profileLevel));
  candidates.forEach((candidate) => {
    if (selected.length < 5) addCandidate(candidate);
  });

  return selected
    .slice(0, 5)
    .map((candidate) => candidate.offer)
    .sort((a, b) => Number(b.available) - Number(a.available) || b.interest - a.interest);
}

export function getContractRenewal(career: CareerState): ContractRenewal {
  const overall = getOverall(career);
  const role = getCareerSquadRole(overall, career.clubStrength);
  const consequenceModifiers = getConsequenceModifiers(career);
  const effectiveTrust = clamp(career.coachTrust + consequenceModifiers.coachTrust, 0, 100);
  const available = career.matches >= 3 && effectiveTrust >= 52;
  const salaryBase = getSalary(career.countryId, career.division, career.reputation);
  const salary = Math.round(Math.max(career.salary * 1.08, salaryBase * (1 + Math.max(0, career.clubStrength - 65) / 80)) / 100) * 100;
  return {
    available,
    salary,
    signingBonus: Math.round(salary * 1.5 / 1_000) * 1_000,
    contractUntilSeason: career.season + (role === "Projeto" ? 4 : role === "Estrela" ? 2 : 3),
    releaseClause: Math.round(Math.max(career.marketValue * 2.5, overall * overall * 16_000) / 100_000) * 100_000,
    role,
    requirement: career.matches < 3 ? "complete 3 partidas" : effectiveTrust < 52 ? "confiança do treinador 52" : "renovação disponível",
  };
}

export function completeCareerTransfer(career: CareerState, offer: CareerTransferOffer, arrivalSeason: number) {
  const destination = TEAMS.find((team) => team.id === offer.teamId);
  const destinationCountry = getCountry(offer.countryId);
  const previousCountry = getCountry(career.countryId);
  const sameCountry = career.countryId === offer.countryId;
  const sameLanguage = previousCountry.language === destinationCountry.language;
  const record: CareerTransferRecord = {
    id: `career-move-${arrivalSeason}-${career.clubId}-${offer.teamId}`,
    season: arrivalSeason,
    fromTeamName: career.clubName,
    toTeamName: offer.teamName,
    fromCountryId: career.countryId,
    toCountryId: offer.countryId,
    fee: offer.transferFee,
    salary: offer.salary,
    role: offer.role,
  };
  const worldTransfer: WorldTransfer = {
    id: `career-transfer-${arrivalSeason}-${career.id}-${offer.teamId}`,
    season: arrivalSeason,
    playerId: `career-player-${career.id}`,
    playerName: career.name,
    age: career.age + 1,
    overall: getOverall(career),
    fromTeamId: career.clubId,
    fromTeamName: career.clubName,
    toTeamId: offer.teamId,
    toTeamName: offer.teamName,
    fromCountryId: career.countryId,
    toCountryId: offer.countryId,
    fee: offer.transferFee,
  };
  return {
    careerPatch: {
      countryId: offer.countryId,
      countryName: offer.countryName,
      division: offer.division,
      leagueId: offer.leagueId,
      leagueName: offer.leagueName,
      clubId: offer.teamId,
      clubName: offer.teamName,
      clubShort: offer.teamShort,
      clubColor: offer.teamColor,
      clubStrength: destination?.strength ?? offer.teamStrength,
      salary: offer.salary,
      bankBalance: career.bankBalance + offer.signingBonus,
      monthlyExpenses: destinationCountry.costOfLiving,
      housing: "Hotel do clube",
      language: destinationCountry.language,
      languageLevel: sameLanguage ? Math.max(career.languageLevel, 80) : 18,
      adaptation: sameCountry ? career.adaptation : 42,
      activeConsequences: sameCountry
        ? career.activeConsequences
        : [{
          id: `adaptacao-${arrivalSeason}-${offer.teamId}`,
          key: "adaptacao-novo-pais",
          source: "Transferência internacional",
          title: "Adaptação ao novo país",
          description: `Idioma, moradia e distância da família afetam a rotina no ${offer.countryName}.`,
          tone: "mixed" as const,
          createdMatch: career.matches,
          remainingMatches: 6,
          totalMatches: 6,
          effects: { performance: -3, fatigue: 5, morale: -2, transferInterest: 2 },
          resolutionEvent: "adaptacao-cultural",
          resolutionText: "O primeiro ciclo de adaptação internacional foi concluído.",
        }, ...career.activeConsequences.filter((consequence) => consequence.key !== "adaptacao-novo-pais")],
      coachTrust: offer.role === "Estrela" ? 72 : offer.role === "Titular" ? 60 : offer.role === "Rotação" ? 48 : 38,
      contractMatches: getLeagueDefinition(offer.countryId, offer.division).format.rounds,
      contractUntilSeason: offer.contractUntilSeason,
      contractRole: offer.role,
      releaseClause: offer.releaseClause,
      pendingTransfer: null,
      careerTransferHistory: [record, ...career.careerTransferHistory].slice(0, 20),
      lifeEventHistory: [`Chegou ao ${offer.teamName} em uma transferência de ${offer.countryName}.`, ...career.lifeEventHistory].slice(0, 30),
      lastSeasonSummary: `${career.lastSeasonSummary} · transferido para o ${offer.teamName}`,
    } satisfies Partial<CareerState>,
    worldTransfer,
  };
}

function createRegeneratedPlayer(retired: WorldPlayerState, season: number, index: number): WorldPlayerState {
  const pool = NAME_POOLS[retired.countryId];
  const seed = hashText(`regen:${season}:${retired.id}:${index}`);
  const first = pool.first[seed % pool.first.length];
  const last = pool.last[Math.floor(seed / 13) % pool.last.length];
  const overall = 55 + (Math.floor(seed / 31) % 15);
  return {
    ...retired,
    id: `regen-${season}-${retired.id}`,
    name: `${first} ${last}`,
    age: 17,
    overall,
    potential: Math.min(95, overall + 10 + (Math.floor(seed / 101) % 12)),
    status: "Ativo",
  };
}

export function advanceWorldSeason(career: CareerState, finalPosition: number, outcome: string) {
  if (career.worldLastUpdatedSeason >= career.season) {
    return {
      worldPlayers: career.worldPlayers,
      worldTransfers: career.worldTransfers,
      worldHistory: career.worldHistory,
      seasonArchive: career.seasonArchive,
      worldLastUpdatedSeason: career.worldLastUpdatedSeason,
    };
  }

  const sourcePlayers = career.worldPlayers.length
    ? career.worldPlayers
    : createInitialWorldPlayers(career.careerSeed, career.season);
  const retiredNames: string[] = [];
  let generatedProspects = 0;
  let players = sourcePlayers.map((player, index) => {
    const age = player.age + 1;
    const seed = hashText(`evolution:${career.careerSeed}:${career.season}:${player.id}`);
    const retirement = age >= 39 || (age >= 35 && seed % 100 < 32);
    if (retirement) {
      retiredNames.push(player.name);
      generatedProspects += 1;
      return createRegeneratedPlayer(player, career.season + 1, index);
    }
    const development = age <= 22
      ? 1 + (seed % 3 === 0 ? 1 : 0)
      : age <= 26
        ? (seed % 3 === 0 ? 1 : 0)
        : age <= 29
          ? (seed % 5 === 0 ? 1 : 0)
          : age <= 32
            ? (seed % 3 === 0 ? -1 : 0)
            : -(1 + (seed % 4 === 0 ? 1 : 0));
    return {
      ...player,
      age,
      overall: Math.max(48, Math.min(player.potential, player.overall + development)),
    };
  });

  const teamById = new Map(WORLD_TEAMS.map((team) => [team.id, team]));
  const transferCandidates = players
    .filter((player) => player.status === "Ativo" && player.age <= 32)
    .map((player) => ({
      player,
      score: player.overall * 100 + player.potential * 8 + (hashText(`market:${career.season}:${player.id}`) % 1000),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(36, players.length));
  const transfers: WorldTransfer[] = [];
  const transferByPlayer = new Map<string, Team>();

  for (const [index, candidate] of transferCandidates.entries()) {
    const player = candidate.player;
    const currentTeam = teamById.get(player.teamId);
    if (!currentTeam) continue;
    const moveSeed = hashText(`destination:${career.careerSeed}:${career.season}:${player.id}`);
    const preferDomestic = moveSeed % 100 < 52;
    const minimumClubStrength = player.overall >= 87 ? 81 : player.overall >= 83 ? 78 : player.overall >= 79 ? 74 : 0;
    const eligibleDestinations = WORLD_TEAMS.filter((team) => team.id !== currentTeam.id && team.strength >= minimumClubStrength);
    const domesticDestinations = eligibleDestinations.filter((team) => team.countryId === currentTeam.countryId);
    const destinationPool = preferDomestic && domesticDestinations.length
      ? domesticDestinations
      : eligibleDestinations;
    const destination = destinationPool[(Math.floor(moveSeed / 101) + index * 7) % destinationPool.length];
    if (!destination) continue;
    const ageFactor = player.age <= 23 ? 1.28 : player.age >= 30 ? .68 : 1;
    const fee = Math.round(Math.max(900_000, player.overall * player.overall * 9_500 * ageFactor) / 100_000) * 100_000;
    transferByPlayer.set(player.id, destination);
    transfers.push({
      id: `transfer-${career.season}-${player.id}`,
      season: career.season,
      playerId: player.id,
      playerName: player.name,
      age: player.age,
      overall: player.overall,
      fromTeamId: currentTeam.id,
      fromTeamName: currentTeam.name,
      toTeamId: destination.id,
      toTeamName: destination.name,
      fromCountryId: currentTeam.countryId,
      toCountryId: destination.countryId,
      fee,
    });
  }

  players = players.map((player) => {
    const destination = transferByPlayer.get(player.id);
    return destination ? { ...player, teamId: destination.id, teamName: destination.name } : player;
  });

  const standings = generateStandings(career);
  const champions: WorldChampion[] = COUNTRIES.map((country) => {
    const league = country.leagues[0];
    const simulatedChampion = league.teams
      .map((team) => ({
        team,
        score: team.strength * 100 + (hashText(`champion:${career.careerSeed}:${career.season}:${team.id}`) % 1800),
      }))
      .sort((a, b) => b.score - a.score)[0].team;
    const actualChampion = career.countryId === country.id && career.division === 1
      ? standings[0]?.team ?? simulatedChampion
      : simulatedChampion;
    return {
      countryId: country.id,
      countryName: country.name,
      leagueName: league.name,
      teamId: actualChampion.id,
      teamName: actualChampion.name,
    };
  });
  const playerOfYear = players
    .map((player) => ({
      player,
      score: player.overall * 100 + (hashText(`award:${career.season}:${player.id}`) % 900),
    }))
    .sort((a, b) => b.score - a.score)[0].player;
  const biggestTransfer = transfers.slice().sort((a, b) => b.fee - a.fee)[0];
  const leagueScorers = career.leagueLeaders.slice().sort((a, b) => b.goals - a.goals || b.overall - a.overall);
  const leagueAssisters = career.leagueLeaders.slice().sort((a, b) => b.assists - a.assists || b.overall - a.overall);
  const champion = standings[0]?.team.name ?? career.clubName;
  const archive: CareerSeasonArchive = {
    season: career.season,
    countryName: career.countryName,
    leagueName: career.leagueName,
    clubName: career.clubName,
    position: finalPosition,
    champion,
    topScorer: leagueScorers[0]?.name ?? "Sem registro",
    topScorerGoals: leagueScorers[0]?.goals ?? 0,
    topAssister: leagueAssisters[0]?.name ?? "Sem registro",
    topAssisterAssists: leagueAssisters[0]?.assists ?? 0,
    playerGoals: leagueScorers.find((player) => player.id === `career-player-${career.id}`)?.goals ?? 0,
    playerAssists: leagueAssisters.find((player) => player.id === `career-player-${career.id}`)?.assists ?? 0,
    playerRating: career.rating,
    outcome,
  };
  const seasonRecord: WorldSeasonRecord = {
    season: career.season,
    champions,
    playerOfYear: playerOfYear.name,
    playerOfYearClub: playerOfYear.teamName,
    biggestTransfer: biggestTransfer?.playerName ?? "Janela sem grandes movimentos",
    biggestTransferFee: biggestTransfer?.fee ?? 0,
    retirements: retiredNames.slice(0, 8),
    generatedProspects,
  };

  return {
    worldPlayers: players,
    worldTransfers: [...transfers.sort((a, b) => b.fee - a.fee), ...career.worldTransfers].slice(0, 180),
    worldHistory: [seasonRecord, ...career.worldHistory].slice(0, 12),
    seasonArchive: [archive, ...career.seasonArchive].slice(0, 20),
    worldLastUpdatedSeason: career.season,
  };
}

export function buildCareerNews(career: CareerState, fixture: Fixture): CareerNews[] {
  const table = generateStandings(career);
  const playerPosition = table.find((row) => row.isPlayerTeam)?.position ?? 1;
  const marketTeam = WORLD_TEAMS[(career.matches + career.careerSeed) % WORLD_TEAMS.length];
  const latestTransfer = career.worldTransfers[0];
  const careerOffer = getCareerTransferOffers(career).find((offer) => offer.available);
  const opponentStar = fixture.opponent.stars[fixture.seed % fixture.opponent.stars.length];
  const rivalryMeetings = career.matchHistory.filter((match) => match.opponentId === fixture.opponent.id);
  const leadingConsequence = career.activeConsequences[0];
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
      title: career.pendingTransfer
        ? `Acordo com o ${career.pendingTransfer.teamName} confirmado`
        : careerOffer
          ? `${careerOffer.teamName} prepara proposta`
          : latestTransfer ? `${latestTransfer.playerName} muda de clube` : `${marketTeam.name} envia observador`,
      text: career.pendingTransfer
        ? `A transferência será concluída ao fim da temporada. O contrato promete função de ${career.pendingTransfer.role} e salário de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(career.pendingTransfer.salary)} por mês.`
        : careerOffer
          ? `O projeto oferece função de ${careerOffer.role}, interesse de ${careerOffer.interest}% e vínculo até ${careerOffer.contractUntilSeason}.`
          : latestTransfer
        ? `${latestTransfer.fromTeamName} negocia o atleta com o ${latestTransfer.toTeamName} por ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(latestTransfer.fee)}.`
        : `O clube acompanha ${career.name}. Reputação ${career.reputation} e nota média ${career.rating.toFixed(1)} pesam no relatório.`,
    },
    {
      id: `league-${career.matches}`,
      category: "liga",
      title: `${opponentStar} é a ameaça da rodada`,
      text: `A comissão destaca a movimentação do principal nome do ${fixture.opponent.name}.`,
    },
    {
      id: `personal-${career.matches}`,
      category: "pessoal",
      title: career.suspensionMatches
        ? `${career.name} cumpre suspensão`
        : career.injuryMatchesRemaining
          ? `Departamento médico projeta retorno em ${career.injuryMatchesRemaining} jogo(s)`
          : leadingConsequence
            ? `${leadingConsequence.title} ainda repercute`
          : rivalryMeetings.length >= 2
            ? `Confronto com o ${fixture.opponent.name} ganha clima de rivalidade`
            : "Comissão prepara briefing individual",
      text: career.suspensionMatches
        ? `A equipe terá de adaptar a função de ${career.position} enquanto o atleta fica fora por ${career.suspensionMatches} rodada(s).`
        : career.injuryMatchesRemaining
          ? `${career.injuryStatus}. Energia, tratamento e risco serão reavaliados antes do retorno.`
          : leadingConsequence
            ? `${leadingConsequence.description} O efeito permanece por ${leadingConsequence.remainingMatches} partida(s).`
          : rivalryMeetings.length >= 2
            ? `${rivalryMeetings.length} encontros anteriores fazem o adversário ajustar o plano especificamente para ${career.name}.`
            : `O próximo relatório cruzará posição, forma, fadiga e o estilo tático do adversário.`,
    },
  ];
}

function normalizeWorldPlayers(players: WorldPlayerState[], previousSaveVersion: number) {
  const teamById = new Map(WORLD_TEAMS.map((team) => [team.id, team]));
  return players.map((player) => {
    const team = teamById.get(player.teamId);
    const nationalityId = player.nationalityId ?? player.countryId ?? team?.countryId ?? "BR";
    const balancedOverall = previousSaveVersion < 5 && team
      ? Math.min(player.overall, team.strength + 5)
      : player.overall;
    return {
      ...player,
      countryId: player.countryId ?? nationalityId,
      nationalityId,
      nationality: player.nationality ?? COUNTRY_META[nationalityId].name,
      overall: balancedOverall,
      potential: Math.max(balancedOverall, player.potential),
    };
  });
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
  const rawWorldPlayers = input?.worldPlayers?.length
    ? input.worldPlayers
    : createInitialWorldPlayers(careerSeed, input?.season ?? 2026);
  const worldPlayers = normalizeWorldPlayers(rawWorldPlayers, input?.saveVersion ?? 0);
  return {
    saveVersion: 8,
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
    car: input?.car ?? "Transporte do clube",
    foodPlan: input?.foodPlan ?? "Refeições do clube",
    privateTraining: input?.privateTraining ?? "Nenhum",
    investments: input?.investments ?? 0,
    debt: input?.debt ?? 0,
    retirementFund: input?.retirementFund ?? 0,
    sponsorship: input?.sponsorship ?? "Sem patrocinador",
    socialFollowers: input?.socialFollowers ?? input?.fans ?? 1280,
    socialReputation: input?.socialReputation ?? 48,
    relationshipStatus: input?.relationshipStatus ?? "Solteiro",
    partnerName: input?.partnerName ?? "",
    children: input?.children ?? 0,
    familyBond: input?.familyBond ?? 70,
    squadRelations: input?.squadRelations ?? 65,
    discipline: input?.discipline ?? 82,
    injuryStatus: input?.injuryStatus ?? "Apto",
    injuryRisk: input?.injuryRisk ?? 12,
    injuryMatchesRemaining: input?.injuryMatchesRemaining ?? ((input?.injuryStatus ?? "Apto").includes("moderada") ? 2 : 0),
    yellowCards: input?.yellowCards ?? 0,
    redCards: input?.redCards ?? 0,
    suspensionMatches: input?.suspensionMatches ?? 0,
    socialProject: input?.socialProject ?? "Nenhum",
    pendingLifeEvent: input?.pendingLifeEvent ?? "primeira-entrevista",
    queuedLifeEvents: input?.queuedLifeEvents ?? [],
    lifeEventHistory: input?.lifeEventHistory ?? [],
    lifeFlags: input?.lifeFlags ?? [],
    personality: {
      professionalism: input?.personality?.professionalism ?? clamp(((input?.discipline ?? 82) - 70) * 2, -100, 100),
      loyalty: input?.personality?.loyalty ?? (origin === "Clube de bairro" || origin === "Projeto social" ? 24 : 8),
      mediaStyle: input?.personality?.mediaStyle ?? (archetype === "Velocista" ? 12 : -4),
      teamwork: input?.personality?.teamwork ?? (archetype === "Operário" || archetype === "Maestro" ? 20 : 4),
      ambition: input?.personality?.ambition ?? (input?.difficulty === "Lenda" ? 28 : 14),
    },
    activeConsequences: (input?.activeConsequences ?? []).map((consequence) => ({
      ...consequence,
      remainingMatches: Math.max(1, consequence.remainingMatches ?? 1),
      totalMatches: Math.max(consequence.remainingMatches ?? 1, consequence.totalMatches ?? consequence.remainingMatches ?? 1),
      effects: consequence.effects ?? {},
      resolutionEvent: consequence.resolutionEvent ?? "",
      resolutionText: consequence.resolutionText ?? consequence.description,
    })),
    consequenceHistory: (input?.consequenceHistory ?? []).slice(0, 40),
    individualAwards: input?.individualAwards ?? [],
    historicalRecords: input?.historicalRecords ?? [],
    futurePath: input?.futurePath ?? "Indefinido",
    contractMatches: input?.contractMatches ?? league.format.rounds,
    contractUntilSeason: input?.contractUntilSeason ?? (input?.season ?? 2026) + 2,
    contractRole: input?.contractRole ?? ((input?.rating ?? 6.8) >= 7.4 ? "Titular" : "Rotação"),
    releaseClause: input?.releaseClause ?? Math.round((input?.marketValue ?? league.salaryBase * 22) * 2.5 / 100_000) * 100_000,
    pendingTransfer: input?.pendingTransfer ?? null,
    careerTransferHistory: input?.careerTransferHistory ?? [],
    matchHistory: (input?.matchHistory ?? []).map((match) => ({ ...match, approach: match.approach ?? "Equilibrado", consequenceImpact: match.consequenceImpact ?? [] })),
    promotions: input?.promotions ?? 0,
    relegations: input?.relegations ?? 0,
    lastSeasonSummary: input?.lastSeasonSummary ?? "Primeira temporada em andamento",
    leagueTable: input?.leagueTable ?? [],
    leagueLeaders: input?.leagueLeaders ?? [],
    lastRoundResults: input?.lastRoundResults ?? [],
    worldPlayers,
    worldTransfers: input?.worldTransfers ?? [],
    worldHistory: input?.worldHistory ?? [],
    seasonArchive: input?.seasonArchive ?? [],
    worldLastUpdatedSeason: input?.worldLastUpdatedSeason ?? (input?.season ?? 2026) - 1,
    attributes: input?.attributes ?? createInitialAttributes(archetype, position),
    inbox: input?.inbox ?? [],
    trophies: input?.trophies ?? [],
    createdAt: input?.createdAt ?? now,
    updatedAt: input?.updatedAt ?? now,
  };
}
