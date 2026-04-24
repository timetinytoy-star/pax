import { GENERATED_NATIONS, GENERATED_TERRITORIES } from './generated_nations';

export type MilitaryDetails = {
  infantry: number;
  armored: number;
  airForce: number;
  navy: number;
};

export type GlobalSummary = {
  turn: number;
  summary: string;
};

export type Nation = {
  id: string;
  mapName: string;
  name: string;
  isPlayer: boolean;
  gold: number;
  manpower: number;
  army: number;
  economy: number;
  stability: number;
  relations: Record<string, number>;
  atWarWith: string[];
  allies: string[];
  alliance: string | null;
  color: string;
  labs: number;
  technologies: string[];
  researchQueue: string[];
  economyHistory: number[];
  militaryDetails?: MilitaryDetails;
  intel?: Record<string, any>;
};

export type City = {
  id: string;
  name: string;
  nationId: string; // Original nation
  ownerId: string; // Current owner
  coordinates: [number, number]; // [longitude, latitude]
  isResource?: boolean; // New flag for resource locations
};

export type WarReport = {
  id: string;
  turn: number;
  title: string;
  description: string;
  tacticalAnalysis: string;
  casualties: Record<string, number>;
  conqueredTerritories: string[];
  conqueredCities: string[];
};

export type GameState = {
  turn: number;
  nations: Record<string, Nation>;
  cities: Record<string, City>;
  playerNationId: string;
  logs: string[];
  territories: Record<string, { owner: string; originalOwner: string }>; // GeoJSON name -> Owners
  chatHistories: Record<string, { role: 'user' | 'model', text: string }[]>;
  unreadMessages: Record<string, boolean>;
  allianceChat: { role: 'user' | 'model', text: string, nationId: string }[];
  warReports: WarReport[];
  globalSummaries: GlobalSummary[];
  playerPolicy?: 'aggressive' | 'defensive' | 'isolationist' | 'balanced';
};

const CUSTOM_NATIONS: Record<string, Nation> = {
  turkey: { id: 'turkey', mapName: 'Turkey', name: 'Türkiye', isPlayer: true, gold: 500, manpower: 5000, army: 2000, economy: 100, stability: 90, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#e41e26', labs: 0, technologies: [], researchQueue: [], economyHistory: [100] },
  usa: { id: 'usa', mapName: 'United States of America', name: 'Amerika Birleşik Devletleri', isPlayer: false, gold: 1000, manpower: 8000, army: 3000, economy: 200, stability: 85, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#3b82f6', labs: 0, technologies: [], researchQueue: [], economyHistory: [200] },
  russia: { id: 'russia', mapName: 'Russia', name: 'Rusya Federasyonu', isPlayer: false, gold: 800, manpower: 7000, army: 2800, economy: 150, stability: 75, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#ef4444', labs: 0, technologies: [], researchQueue: [], economyHistory: [150] },
  china: { id: 'china', mapName: 'China', name: 'Çin Halk Cumhuriyeti', isPlayer: false, gold: 900, manpower: 10000, army: 3500, economy: 180, stability: 80, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#dc2626', labs: 0, technologies: [], researchQueue: [], economyHistory: [180] },
  uk: { id: 'uk', mapName: 'United Kingdom', name: 'Birleşik Krallık', isPlayer: false, gold: 600, manpower: 4000, army: 1500, economy: 120, stability: 85, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#1e3a8a', labs: 0, technologies: [], researchQueue: [], economyHistory: [120] },
  france: { id: 'france', mapName: 'France', name: 'Fransa', isPlayer: false, gold: 550, manpower: 4500, army: 1600, economy: 110, stability: 80, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#2563eb', labs: 0, technologies: [], researchQueue: [], economyHistory: [110] },
  germany: { id: 'germany', mapName: 'Germany', name: 'Almanya', isPlayer: false, gold: 700, manpower: 5000, army: 1800, economy: 140, stability: 85, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#1f2937', labs: 0, technologies: [], researchQueue: [], economyHistory: [140] },
  japan: { id: 'japan', mapName: 'Japan', name: 'Japonya', isPlayer: false, gold: 650, manpower: 4000, army: 1400, economy: 130, stability: 90, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#be123c', labs: 0, technologies: [], researchQueue: [], economyHistory: [130] },
  india: { id: 'india', mapName: 'India', name: 'Hindistan', isPlayer: false, gold: 400, manpower: 12000, army: 2500, economy: 90, stability: 70, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#f97316', labs: 0, technologies: [], researchQueue: [], economyHistory: [90] },
  brazil: { id: 'brazil', mapName: 'Brazil', name: 'Brezilya', isPlayer: false, gold: 350, manpower: 6000, army: 1200, economy: 80, stability: 65, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#22c55e', labs: 0, technologies: [], researchQueue: [], economyHistory: [80] },
  italy: { id: 'italy', mapName: 'Italy', name: 'İtalya', isPlayer: false, gold: 450, manpower: 3500, army: 1100, economy: 95, stability: 75, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#16a34a', labs: 0, technologies: [], researchQueue: [], economyHistory: [95] },
  canada: { id: 'canada', mapName: 'Canada', name: 'Kanada', isPlayer: false, gold: 500, manpower: 2000, army: 800, economy: 100, stability: 90, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#f87171', labs: 0, technologies: [], researchQueue: [], economyHistory: [100] },
  australia: { id: 'australia', mapName: 'Australia', name: 'Avustralya', isPlayer: false, gold: 450, manpower: 1500, army: 700, economy: 90, stability: 90, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#0284c7', labs: 0, technologies: [], researchQueue: [], economyHistory: [90] },
  south_korea: { id: 'south_korea', mapName: 'South Korea', name: 'Güney Kore', isPlayer: false, gold: 550, manpower: 3000, army: 1500, economy: 110, stability: 85, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#3b82f6', labs: 0, technologies: [], researchQueue: [], economyHistory: [110] },
  north_korea: { id: 'north_korea', mapName: 'North Korea', name: 'Kuzey Kore', isPlayer: false, gold: 100, manpower: 4000, army: 2000, economy: 20, stability: 50, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#991b1b', labs: 0, technologies: [], researchQueue: [], economyHistory: [20] },
  iran: { id: 'iran', mapName: 'Iran', name: 'İran', isPlayer: false, gold: 300, manpower: 5000, army: 1800, economy: 60, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#15803d', labs: 0, technologies: [], researchQueue: [], economyHistory: [60] },
  saudi_arabia: { id: 'saudi_arabia', mapName: 'Saudi Arabia', name: 'Suudi Arabistan', isPlayer: false, gold: 800, manpower: 2500, army: 1000, economy: 150, stability: 75, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#166534', labs: 0, technologies: [], researchQueue: [], economyHistory: [150] },
  egypt: { id: 'egypt', mapName: 'Egypt', name: 'Mısır', isPlayer: false, gold: 200, manpower: 6000, army: 1200, economy: 50, stability: 65, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#b45309', labs: 0, technologies: [], researchQueue: [], economyHistory: [50] },
  israel: { id: 'israel', mapName: 'Israel', name: 'İsrail', isPlayer: false, gold: 400, manpower: 1000, army: 1500, economy: 80, stability: 80, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#60a5fa', labs: 0, technologies: [], researchQueue: [], economyHistory: [80] },
  greece: { id: 'greece', mapName: 'Greece', name: 'Yunanistan', isPlayer: false, gold: 250, manpower: 1500, army: 800, economy: 60, stability: 70, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#38bdf8', labs: 0, technologies: [], researchQueue: [], economyHistory: [60] },
  ukraine: { id: 'ukraine', mapName: 'Ukraine', name: 'Ukrayna', isPlayer: false, gold: 150, manpower: 3000, army: 1500, economy: 40, stability: 50, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#fcd34d', labs: 0, technologies: [], researchQueue: [], economyHistory: [40] },
  spain: { id: 'spain', mapName: 'Spain', name: 'İspanya', isPlayer: false, gold: 400, manpower: 3000, army: 1000, economy: 85, stability: 80, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#ea580c', labs: 0, technologies: [], researchQueue: [], economyHistory: [85] },
  mexico: { id: 'mexico', mapName: 'Mexico', name: 'Meksika', isPlayer: false, gold: 300, manpower: 7000, army: 1100, economy: 70, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#047857', labs: 0, technologies: [], researchQueue: [], economyHistory: [70] },
  argentina: { id: 'argentina', mapName: 'Argentina', name: 'Arjantin', isPlayer: false, gold: 250, manpower: 3500, army: 900, economy: 60, stability: 65, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#7dd3fc', labs: 0, technologies: [], researchQueue: [], economyHistory: [60] },
  south_africa: { id: 'south_africa', mapName: 'South Africa', name: 'Güney Afrika', isPlayer: false, gold: 200, manpower: 4000, army: 800, economy: 55, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#14b8a6', labs: 0, technologies: [], researchQueue: [], economyHistory: [55] },
  pakistan: { id: 'pakistan', mapName: 'Pakistan', name: 'Pakistan', isPlayer: false, gold: 150, manpower: 10000, army: 1800, economy: 40, stability: 55, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#065f46', labs: 0, technologies: [], researchQueue: [], economyHistory: [40] },
  indonesia: { id: 'indonesia', mapName: 'Indonesia', name: 'Endonezya', isPlayer: false, gold: 300, manpower: 11000, army: 1500, economy: 75, stability: 70, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#ef4444', labs: 0, technologies: [], researchQueue: [], economyHistory: [75] },
  nigeria: { id: 'nigeria', mapName: 'Nigeria', name: 'Nijerya', isPlayer: false, gold: 200, manpower: 8000, army: 1000, economy: 50, stability: 50, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#10b981', labs: 0, technologies: [], researchQueue: [], economyHistory: [50] },
  syria: { id: 'syria', mapName: 'Syria', name: 'Suriye', isPlayer: false, gold: 50, manpower: 1500, army: 800, economy: 10, stability: 30, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#4b5563', labs: 0, technologies: [], researchQueue: [], economyHistory: [10] },
  iraq: { id: 'iraq', mapName: 'Iraq', name: 'Irak', isPlayer: false, gold: 150, manpower: 2500, army: 1000, economy: 40, stability: 40, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#6b7280', labs: 0, technologies: [], researchQueue: [], economyHistory: [40] },
  sweden: { id: 'sweden', mapName: 'Sweden', name: 'İsveç', isPlayer: false, gold: 600, manpower: 1500, army: 900, economy: 120, stability: 95, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#fcd34d', labs: 0, technologies: [], researchQueue: [], economyHistory: [120] },
  poland: { id: 'poland', mapName: 'Poland', name: 'Polonya', isPlayer: false, gold: 400, manpower: 4000, army: 1800, economy: 90, stability: 80, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#ef4444', labs: 0, technologies: [], researchQueue: [], economyHistory: [90] },
  vietnam: { id: 'vietnam', mapName: 'Vietnam', name: 'Vietnam', isPlayer: false, gold: 250, manpower: 9000, army: 2000, economy: 65, stability: 70, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#dc2626', labs: 0, technologies: [], researchQueue: [], economyHistory: [65] },
  colombia: { id: 'colombia', mapName: 'Colombia', name: 'Kolombiya', isPlayer: false, gold: 200, manpower: 5000, army: 1200, economy: 55, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#facc15', labs: 0, technologies: [], researchQueue: [], economyHistory: [55] },
  chile: { id: 'chile', mapName: 'Chile', name: 'Şili', isPlayer: false, gold: 250, manpower: 2000, army: 800, economy: 60, stability: 75, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#ef4444', labs: 0, technologies: [], researchQueue: [], economyHistory: [60] },
  peru: { id: 'peru', mapName: 'Peru', name: 'Peru', isPlayer: false, gold: 180, manpower: 3000, army: 700, economy: 45, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#dc2626', labs: 0, technologies: [], researchQueue: [], economyHistory: [45] },
  venezuela: { id: 'venezuela', mapName: 'Venezuela', name: 'Venezuela', isPlayer: false, gold: 100, manpower: 2500, army: 1500, economy: 20, stability: 30, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#fcd34d', labs: 0, technologies: [], researchQueue: [], economyHistory: [20] },
  cuba: { id: 'cuba', mapName: 'Cuba', name: 'Küba', isPlayer: false, gold: 80, manpower: 1000, army: 900, economy: 25, stability: 65, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#1d4ed8', labs: 0, technologies: [], researchQueue: [], economyHistory: [25] },
  morocco: { id: 'morocco', mapName: 'Morocco', name: 'Fas', isPlayer: false, gold: 150, manpower: 3500, army: 1000, economy: 45, stability: 70, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#b91c1c', labs: 0, technologies: [], researchQueue: [], economyHistory: [45] },
  algeria: { id: 'algeria', mapName: 'Algeria', name: 'Cezayir', isPlayer: false, gold: 250, manpower: 4000, army: 1200, economy: 55, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#15803d', labs: 0, technologies: [], researchQueue: [], economyHistory: [55] },
  kenya: { id: 'kenya', mapName: 'Kenya', name: 'Kenya', isPlayer: false, gold: 120, manpower: 5000, army: 600, economy: 35, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#000000', labs: 0, technologies: [], researchQueue: [], economyHistory: [35] },
  ethiopia: { id: 'ethiopia', mapName: 'Ethiopia', name: 'Etiyopya', isPlayer: false, gold: 100, manpower: 12000, army: 800, economy: 30, stability: 50, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#16a34a', labs: 0, technologies: [], researchQueue: [], economyHistory: [30] },
  thailand: { id: 'thailand', mapName: 'Thailand', name: 'Tayland', isPlayer: false, gold: 300, manpower: 7000, army: 1300, economy: 70, stability: 65, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#1e3a8a', labs: 0, technologies: [], researchQueue: [], economyHistory: [70] },
  malaysia: { id: 'malaysia', mapName: 'Malaysia', name: 'Malezya', isPlayer: false, gold: 350, manpower: 3000, army: 900, economy: 80, stability: 75, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#facc15', labs: 0, technologies: [], researchQueue: [], economyHistory: [80] },
  philippines: { id: 'philippines', mapName: 'Philippines', name: 'Filipinler', isPlayer: false, gold: 200, manpower: 11000, army: 1000, economy: 60, stability: 60, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#0284c7', labs: 0, technologies: [], researchQueue: [], economyHistory: [60] },
  kazakhstan: { id: 'kazakhstan', mapName: 'Kazakhstan', name: 'Kazakistan', isPlayer: false, gold: 300, manpower: 2000, army: 800, economy: 65, stability: 75, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#38bdf8', labs: 0, technologies: [], researchQueue: [], economyHistory: [65] },
  norway: { id: 'norway', mapName: 'Norway', name: 'Norveç', isPlayer: false, gold: 500, manpower: 500, army: 400, economy: 110, stability: 95, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#dc2626', labs: 0, technologies: [], researchQueue: [], economyHistory: [110] },
  finland: { id: 'finland', mapName: 'Finland', name: 'Finlandiya', isPlayer: false, gold: 400, manpower: 600, army: 600, economy: 95, stability: 95, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#ffffff', labs: 0, technologies: [], researchQueue: [], economyHistory: [95] },
  netherlands: { id: 'netherlands', mapName: 'Netherlands', name: 'Hollanda', isPlayer: false, gold: 600, manpower: 1800, army: 700, economy: 130, stability: 90, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#f97316', labs: 0, technologies: [], researchQueue: [], economyHistory: [130] },
  switzerland: { id: 'switzerland', mapName: 'Switzerland', name: 'İsviçre', isPlayer: false, gold: 700, manpower: 900, army: 500, economy: 140, stability: 100, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#ef4444', labs: 0, technologies: [], researchQueue: [], economyHistory: [140] },
  romania: { id: 'romania', mapName: 'Romania', name: 'Romanya', isPlayer: false, gold: 250, manpower: 2000, army: 900, economy: 60, stability: 70, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#facc15', labs: 0, technologies: [], researchQueue: [], economyHistory: [60] },
  portugal: { id: 'portugal', mapName: 'Portugal', name: 'Portekiz', isPlayer: false, gold: 300, manpower: 1000, army: 600, economy: 70, stability: 85, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#16a34a', labs: 0, technologies: [], researchQueue: [], economyHistory: [70] },
  new_zealand: { id: 'new_zealand', mapName: 'New Zealand', name: 'Yeni Zelanda', isPlayer: false, gold: 350, manpower: 500, army: 300, economy: 80, stability: 95, relations: {}, atWarWith: [], allies: [], alliance: null, color: '#000000', labs: 0, technologies: [], researchQueue: [], economyHistory: [80] },
};

export const INITIAL_NATIONS: Record<string, Nation> = {
  ...((GENERATED_NATIONS as any) || {}),
  ...CUSTOM_NATIONS
};

export const INITIAL_CITIES: Record<string, City> = {
  'turkey_ankara': { id: 'turkey_ankara', name: 'Ankara', nationId: 'turkey', ownerId: 'turkey', coordinates: [32.8597, 39.9334] },
  'turkey_istanbul': { id: 'turkey_istanbul', name: 'İstanbul', nationId: 'turkey', ownerId: 'turkey', coordinates: [28.9784, 41.0082] },
  'turkey_izmir': { id: 'turkey_izmir', name: 'İzmir', nationId: 'turkey', ownerId: 'turkey', coordinates: [27.1428, 38.4237] },
  'turkey_antalya': { id: 'turkey_antalya', name: 'Antalya', nationId: 'turkey', ownerId: 'turkey', coordinates: [30.7133, 36.8969] },
  'turkey_adana': { id: 'turkey_adana', name: 'Adana', nationId: 'turkey', ownerId: 'turkey', coordinates: [35.3213, 37.0000] },
  'usa_dc': { id: 'usa_dc', name: 'Washington D.C.', nationId: 'usa', ownerId: 'usa', coordinates: [-77.0369, 38.9072] },
  'usa_ny': { id: 'usa_ny', name: 'New York', nationId: 'usa', ownerId: 'usa', coordinates: [-74.0060, 40.7128] },
  'usa_la': { id: 'usa_la', name: 'Los Angeles', nationId: 'usa', ownerId: 'usa', coordinates: [-118.2437, 34.0522] },
  'usa_chicago': { id: 'usa_chicago', name: 'Chicago', nationId: 'usa', ownerId: 'usa', coordinates: [-87.6298, 41.8781] },
  'usa_houston': { id: 'usa_houston', name: 'Houston', nationId: 'usa', ownerId: 'usa', coordinates: [-95.3698, 29.7604] },
  'russia_moscow': { id: 'russia_moscow', name: 'Moskova', nationId: 'russia', ownerId: 'russia', coordinates: [37.6173, 55.7558] },
  'russia_spb': { id: 'russia_spb', name: 'St. Petersburg', nationId: 'russia', ownerId: 'russia', coordinates: [30.3086, 59.9386] },
  'russia_vladivostok': { id: 'russia_vladivostok', name: 'Vladivostok', nationId: 'russia', ownerId: 'russia', coordinates: [131.8869, 43.1198] },
  'russia_yekaterinburg': { id: 'russia_yekaterinburg', name: 'Yekaterinburg', nationId: 'russia', ownerId: 'russia', coordinates: [60.6122, 56.8389] },
  'china_beijing': { id: 'china_beijing', name: 'Pekin', nationId: 'china', ownerId: 'china', coordinates: [116.4074, 39.9042] },
  'china_shanghai': { id: 'china_shanghai', name: 'Şanghay', nationId: 'china', ownerId: 'china', coordinates: [121.4737, 31.2304] },
  'china_guangzhou': { id: 'china_guangzhou', name: 'Guangzhou', nationId: 'china', ownerId: 'china', coordinates: [113.2644, 23.1291] },
  'uk_london': { id: 'uk_london', name: 'Londra', nationId: 'uk', ownerId: 'uk', coordinates: [-0.1276, 51.5074] },
  'uk_manchester': { id: 'uk_manchester', name: 'Manchester', nationId: 'uk', ownerId: 'uk', coordinates: [-2.2426, 53.4808] },
  'france_paris': { id: 'france_paris', name: 'Paris', nationId: 'france', ownerId: 'france', coordinates: [2.3522, 48.8566] },
  'france_marseille': { id: 'france_marseille', name: 'Marsilya', nationId: 'france', ownerId: 'france', coordinates: [5.3698, 43.2965] },
  'germany_berlin': { id: 'germany_berlin', name: 'Berlin', nationId: 'germany', ownerId: 'germany', coordinates: [13.4050, 52.5200] },
  'germany_munich': { id: 'germany_munich', name: 'Münih', nationId: 'germany', ownerId: 'germany', coordinates: [11.5820, 48.1351] },
  'japan_tokyo': { id: 'japan_tokyo', name: 'Tokyo', nationId: 'japan', ownerId: 'japan', coordinates: [139.6917, 35.6895] },
  'japan_osaka': { id: 'japan_osaka', name: 'Osaka', nationId: 'japan', ownerId: 'japan', coordinates: [135.5023, 34.6937] },
  'india_delhi': { id: 'india_delhi', name: 'Yeni Delhi', nationId: 'india', ownerId: 'india', coordinates: [77.2090, 28.6139] },
  'india_mumbai': { id: 'india_mumbai', name: 'Mumbai', nationId: 'india', ownerId: 'india', coordinates: [72.8777, 19.0760] },
  'brazil_brasilia': { id: 'brazil_brasilia', name: 'Brasília', nationId: 'brazil', ownerId: 'brazil', coordinates: [-47.9292, -15.7801] },
  'brazil_saopaulo': { id: 'brazil_saopaulo', name: 'São Paulo', nationId: 'brazil', ownerId: 'brazil', coordinates: [-46.6333, -23.5505] },
  'italy_rome': { id: 'italy_rome', name: 'Roma', nationId: 'italy', ownerId: 'italy', coordinates: [12.4964, 41.9028] },
  'italy_milan': { id: 'italy_milan', name: 'Milano', nationId: 'italy', ownerId: 'italy', coordinates: [9.1900, 45.4642] },
  'canada_ottawa': { id: 'canada_ottawa', name: 'Ottawa', nationId: 'canada', ownerId: 'canada', coordinates: [-75.6972, 45.4215] },
  'canada_toronto': { id: 'canada_toronto', name: 'Toronto', nationId: 'canada', ownerId: 'canada', coordinates: [-79.3832, 43.6532] },
  'australia_canberra': { id: 'australia_canberra', name: 'Canberra', nationId: 'australia', ownerId: 'australia', coordinates: [149.1300, -35.2809] },
  'australia_sydney': { id: 'australia_sydney', name: 'Sidney', nationId: 'australia', ownerId: 'australia', coordinates: [151.2093, -33.8688] },
  'south_korea_seoul': { id: 'south_korea_seoul', name: 'Seul', nationId: 'south_korea', ownerId: 'south_korea', coordinates: [126.9780, 37.5665] },
  'north_korea_pyongyang': { id: 'north_korea_pyongyang', name: 'Pyongyang', nationId: 'north_korea', ownerId: 'north_korea', coordinates: [125.7625, 39.0392] },
  'iran_tehran': { id: 'iran_tehran', name: 'Tahran', nationId: 'iran', ownerId: 'iran', coordinates: [51.3890, 35.6892] },
  'saudi_arabia_riyadh': { id: 'saudi_arabia_riyadh', name: 'Riyad', nationId: 'saudi_arabia', ownerId: 'saudi_arabia', coordinates: [46.7167, 24.6333] },
  'egypt_cairo': { id: 'egypt_cairo', name: 'Kahire', nationId: 'egypt', ownerId: 'egypt', coordinates: [31.2357, 30.0444] },
  'israel_jerusalem': { id: 'israel_jerusalem', name: 'Kudüs', nationId: 'israel', ownerId: 'israel', coordinates: [35.2137, 31.7683] },
  'israel_telaviv': { id: 'israel_telaviv', name: 'Tel Aviv', nationId: 'israel', ownerId: 'israel', coordinates: [34.7818, 32.0853] },
  'greece_athens': { id: 'greece_athens', name: 'Atina', nationId: 'greece', ownerId: 'greece', coordinates: [23.7275, 37.9838] },
  'ukraine_kyiv': { id: 'ukraine_kyiv', name: 'Kiev', nationId: 'ukraine', ownerId: 'ukraine', coordinates: [30.5234, 50.4501] },
  'spain_madrid': { id: 'spain_madrid', name: 'Madrid', nationId: 'spain', ownerId: 'spain', coordinates: [-3.7038, 40.4168] },
  'mexico_mexico_city': { id: 'mexico_mexico_city', name: 'Meksiko', nationId: 'mexico', ownerId: 'mexico', coordinates: [-99.1332, 19.4326] },
  'argentina_buenos_aires': { id: 'argentina_buenos_aires', name: 'Buenos Aires', nationId: 'argentina', ownerId: 'argentina', coordinates: [-58.3816, -34.6037] },
  'south_africa_pretoria': { id: 'south_africa_pretoria', name: 'Pretoria', nationId: 'south_africa', ownerId: 'south_africa', coordinates: [28.1881, -25.7479] },
  'pakistan_islamabad': { id: 'pakistan_islamabad', name: 'İslamabad', nationId: 'pakistan', ownerId: 'pakistan', coordinates: [73.0479, 33.6844] },
  'indonesia_jakarta': { id: 'indonesia_jakarta', name: 'Cakarta', nationId: 'indonesia', ownerId: 'indonesia', coordinates: [106.8229, -6.2088] },
  'nigeria_abuja': { id: 'nigeria_abuja', name: 'Abuja', nationId: 'nigeria', ownerId: 'nigeria', coordinates: [7.4951, 9.0579] },
  'syria_damascus': { id: 'syria_damascus', name: 'Şam', nationId: 'syria', ownerId: 'syria', coordinates: [36.2913, 33.5138] },
  'iraq_baghdad': { id: 'iraq_baghdad', name: 'Bağdat', nationId: 'iraq', ownerId: 'iraq', coordinates: [44.3615, 33.3152] },
  'sweden_stockholm': { id: 'sweden_stockholm', name: 'Stokholm', nationId: 'sweden', ownerId: 'sweden', coordinates: [18.0686, 59.3293] },
  'poland_warsaw': { id: 'poland_warsaw', name: 'Varşova', nationId: 'poland', ownerId: 'poland', coordinates: [21.0122, 52.2297] },
  'vietnam_hanoi': { id: 'vietnam_hanoi', name: 'Hanoi', nationId: 'vietnam', ownerId: 'vietnam', coordinates: [105.8342, 21.0278] },
  'vietnam_hcmc': { id: 'vietnam_hcmc', name: 'Ho Chi Minh', nationId: 'vietnam', ownerId: 'vietnam', coordinates: [106.6297, 10.8231] },
  'colombia_bogota': { id: 'colombia_bogota', name: 'Bogota', nationId: 'colombia', ownerId: 'colombia', coordinates: [-74.0721, 4.7110] },
  // Resources
  'saudi_arabia_ghawar': { id: 'saudi_arabia_ghawar', name: 'Ghawar Petrol Sahası', nationId: 'saudi_arabia', ownerId: 'saudi_arabia', coordinates: [49.5, 25.5], isResource: true },
  'russia_siberia': { id: 'russia_siberia', name: 'Sibirya Doğalgaz Tesisleri', nationId: 'russia', ownerId: 'russia', coordinates: [75.0, 60.0], isResource: true },
  'china_rare_earth': { id: 'china_rare_earth', name: 'Bayan Obo Madeni', nationId: 'china', ownerId: 'china', coordinates: [109.9, 41.7], isResource: true },
  'usa_permian': { id: 'usa_permian', name: 'Permian Havzası Petrolü', nationId: 'usa', ownerId: 'usa', coordinates: [-103.0, 31.8], isResource: true },
  'australia_iron': { id: 'australia_iron', name: 'Pilbara Demir Madeni', nationId: 'australia', ownerId: 'australia', coordinates: [119.0, -22.0], isResource: true },
  'brazil_amazon': { id: 'brazil_amazon', name: 'Amazon Biyosferi', nationId: 'brazil', ownerId: 'brazil', coordinates: [-60.0, -3.0], isResource: true }
};

const INITIAL_TERRITORIES: Record<string, { owner: string; originalOwner: string }> = {
  ...GENERATED_TERRITORIES
};

// Add fallback whole-country territories for nations not covered by province data
Object.values(INITIAL_NATIONS).forEach(nation => {
  if (!INITIAL_TERRITORIES[nation.mapName]) {
    INITIAL_TERRITORIES[nation.mapName] = {
      owner: nation.id,
      originalOwner: nation.id
    };
  }
});

export const INITIAL_STATE: GameState = {
  turn: 1,
  nations: INITIAL_NATIONS,
  cities: {},
  playerNationId: 'turkey',
  logs: ['Pax Historia: Modern Çağ\'a hoş geldiniz. Tüm dünya yapay zeka tarafından yönetiliyor. Haritadan bir ülkeye tıklayarak diplomasi yapabilirsiniz.'],
  territories: INITIAL_TERRITORIES,
  chatHistories: {},
  unreadMessages: {},
  allianceChat: [],
  warReports: [],
  globalSummaries: [],
};
