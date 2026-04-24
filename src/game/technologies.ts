export interface Technology {
  id: string;
  name: string;
  description: string;
  costGold: number;
  costLabs: number;
  prerequisites: string[];
  effect: string;
}

export const TECHNOLOGIES: Record<string, Technology> = {
  'tech_infantry_1': {
    id: 'tech_infantry_1',
    name: 'Modern Piyade Teçhizatı',
    description: 'Piyadelerin savaş gücünü ve hayatta kalma oranını artırır.',
    costGold: 200,
    costLabs: 1,
    prerequisites: [],
    effect: 'Ordu gücüne +500 kalıcı bonus.'
  },
  'tech_cyber_1': {
    id: 'tech_cyber_1',
    name: 'Siber Güvenlik Ağı',
    description: 'Düşman siber saldırılarını engeller ve istihbarat sağlar.',
    costGold: 300,
    costLabs: 1,
    prerequisites: [],
    effect: 'İstikrarı +5 artırır.'
  },
  'tech_drone_1': {
    id: 'tech_drone_1',
    name: 'Temel İHA Teknolojisi',
    description: 'Keşif ve hafif saldırı dronları üretimi.',
    costGold: 500,
    costLabs: 2,
    prerequisites: ['tech_infantry_1'],
    effect: 'Ordu gücüne +1000 kalıcı bonus.'
  },
  'tech_economy_1': {
    id: 'tech_economy_1',
    name: 'Dijital Ekonomi',
    description: 'Vergi toplama ve ticaret verimliliğini artırır.',
    costGold: 400,
    costLabs: 1,
    prerequisites: [],
    effect: 'Ekonomiye +20 kalıcı bonus.'
  },
  'tech_ai_1': {
    id: 'tech_ai_1',
    name: 'Yapay Zeka Destekli Lojistik',
    description: 'Orduların ve kaynakların daha hızlı taşınmasını sağlar.',
    costGold: 800,
    costLabs: 3,
    prerequisites: ['tech_cyber_1', 'tech_economy_1'],
    effect: 'Ekonomiye +30, Ordu gücüne +500 bonus.'
  },
  'tech_nuclear_1': {
    id: 'tech_nuclear_1',
    name: 'Nükleer Araştırma Programı',
    description: 'Nükleer enerji ve silahlanma için ilk adım.',
    costGold: 2000,
    costLabs: 5,
    prerequisites: ['tech_ai_1', 'tech_drone_1'],
    effect: 'Uluslararası saygınlık ve caydırıcılık (İstikrar +10, Ordu +2000).'
  },
  'tech_quantum_1': {
    id: 'tech_quantum_1',
    name: 'Kuantum Bilgisayarlar',
    description: 'Şifreleme ve siber savaşta devrim yaratır.',
    costGold: 1500,
    costLabs: 4,
    prerequisites: ['tech_cyber_1', 'tech_ai_1'],
    effect: 'İstikrar +15, Ekonomi +50.'
  },
  'tech_hypersonic_1': {
    id: 'tech_hypersonic_1',
    name: 'Hipersonik Füzeler',
    description: 'Durdurulamaz füze sistemleri geliştirilir.',
    costGold: 2500,
    costLabs: 6,
    prerequisites: ['tech_drone_1', 'tech_nuclear_1'],
    effect: 'Ordu gücüne +3000 kalıcı bonus.'
  },
  'tech_space_1': {
    id: 'tech_space_1',
    name: 'Askeri Uydu Ağı',
    description: 'Küresel gözetleme ve iletişim üstünlüğü sağlar.',
    costGold: 3000,
    costLabs: 5,
    prerequisites: ['tech_ai_1'],
    effect: 'Ordu +1500, İstikrar +10.'
  },
  'tech_genetics_1': {
    id: 'tech_genetics_1',
    name: 'Gelişmiş Genetik ve Tıp',
    description: 'Hastalıkları önler ve askerlerin dayanıklılığını artırır.',
    costGold: 1200,
    costLabs: 3,
    prerequisites: ['tech_economy_1'],
    effect: 'İstikrar +20, Ordu +500.'
  },
  'tech_espionage_1': {
    id: 'tech_espionage_1',
    name: 'Modern İstihbarat Ağı',
    description: 'Küresel casusluk faaliyetlerini kolaylaştırır.',
    costGold: 1000,
    costLabs: 2,
    prerequisites: ['tech_cyber_1'],
    effect: 'İstikrar +10, Casusluk operasyonlarında başarı şansı artar.'
  }
};
