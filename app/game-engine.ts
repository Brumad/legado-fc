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

export type SquadPlayer = {
  id: string;
  name: string;
  position: "GOL" | "LD" | "ZAG" | "LE" | "VOL" | "MEI" | "PD" | "PE" | "ATA";
  overall: number;
  teamId: string;
  teamName: string;
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
  socialProject: string;
  pendingLifeEvent: string;
  lifeEventHistory: string[];
  lifeFlags: string[];
  individualAwards: string[];
  historicalRecords: string[];
  futurePath: string;
  contractMatches: number;
  promotions: number;
  relegations: number;
  lastSeasonSummary: string;
  leagueTable: TeamSeasonRecord[];
  leagueLeaders: LeaguePlayerStat[];
  lastRoundResults: RoundMatchResult[];
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
    };
  });
}

function makeTeams(countryId: CountryId, division: DivisionLevel, names: string[]) {
  const meta = COUNTRY_META[countryId];
  const baseStrength = division === 1 ? 77 : 66;
  return names.map((name, index): Team => {
    const [color, accent] = COLORS[index % COLORS.length];
    const strengthWave = ((index * 5 + hashText(name)) % 9) - 4;
    const id = `${countryId.toLowerCase()}-${division}-${slugify(name)}`;
    const strength = baseStrength + strengthWave;
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
  ];
  const kinds: MatchEvent["kind"][] = ["normal", "normal", "normal", "chance", "normal", "card"];
  return { minute, text: pick(rng, templates), kind: pick(rng, kinds) };
}

function momentTemplates(position: Position, rng: () => number, star: string, forcedKind?: MomentKind) {
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
  const kind = forcedKind ?? pick(rng, preferred[position]);
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

export function generateMatchPlan(career: CareerState, fixture = createFixture(career), showcase = false): MatchPlan {
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
  const momentCount = showcase ? 9 : 4 + Math.floor(rng() * 3);
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
    const showcaseKinds: MomentKind[] = ["pass", "dribble", "shot", "defense", "freeKick", "corner", "penalty", "counter", "aerial"];
    const template = momentTemplates(career.position, rng, pick(rng, fixture.opponent.stars), showcase ? showcaseKinds[index] : undefined);
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
    leaders.set(careerPlayerId, {
      id: careerPlayerId,
      name: career.name,
      position: career.position === "Zagueiro" ? "ZAG" : career.position === "Lateral" ? "LD" : career.position === "Meia" ? "MEI" : career.position === "Ponta" ? "PE" : "ATA",
      overall: getOverall(career),
      teamId: career.clubId,
      teamName: career.clubName,
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
    socialProject: input?.socialProject ?? "Nenhum",
    pendingLifeEvent: input?.pendingLifeEvent ?? "primeira-entrevista",
    lifeEventHistory: input?.lifeEventHistory ?? [],
    lifeFlags: input?.lifeFlags ?? [],
    individualAwards: input?.individualAwards ?? [],
    historicalRecords: input?.historicalRecords ?? [],
    futurePath: input?.futurePath ?? "Indefinido",
    contractMatches: input?.contractMatches ?? league.format.rounds,
    promotions: input?.promotions ?? 0,
    relegations: input?.relegations ?? 0,
    lastSeasonSummary: input?.lastSeasonSummary ?? "Primeira temporada em andamento",
    leagueTable: input?.leagueTable ?? [],
    leagueLeaders: input?.leagueLeaders ?? [],
    lastRoundResults: input?.lastRoundResults ?? [],
    attributes: input?.attributes ?? createInitialAttributes(archetype, position),
    inbox: input?.inbox ?? [],
    trophies: input?.trophies ?? [],
    createdAt: input?.createdAt ?? now,
    updatedAt: input?.updatedAt ?? now,
  };
}
