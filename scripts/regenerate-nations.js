import fs from 'fs';

function generate() {
  const data = JSON.parse(fs.readFileSync('public/world-admin1.json', 'utf8'));
  const geoms = data.objects.ne_10m_admin_1_states_provinces.geometries;
  
  const generatedNations = {};
  const generatedTerritories = {};
  
  // Custom logic for ID mapping to be safe for objects
  const normalize = (str) => {
    if (!str) return 'unknown';
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  };

  const colors = [
    '#f11218', '#406802', '#7c22e3', '#19950e', '#48852c', '#b40b4f', '#bd7e3b', '#b53ce2', '#c0d94e',
    '#e2a728', '#2e817c', '#ae2138', '#571891', '#1f7e9b', '#9b8e1f', '#813f28'
  ];
  let colorIndex = 0;

  geoms.forEach(g => {
    const admin = g.properties.admin;
    const name = g.properties.name;
    const provId = g.properties.provId; // admin_name

    const nationId = normalize(admin);

    if (!generatedNations[nationId]) {
      generatedNations[nationId] = {
        id: nationId,
        mapName: admin,
        name: admin,
        isPlayer: false,
        gold: 300,
        manpower: 2000,
        army: 500,
        economy: 50,
        stability: 70,
        relations: {},
        atWarWith: [],
        allies: [],
        alliance: null,
        color: colors[colorIndex % colors.length],
        labs: 0,
        technologies: [],
        researchQueue: [],
        economyHistory: [50]
      };
      colorIndex++;
    }

    generatedTerritories[provId] = {
      owner: nationId,
      originalOwner: nationId
    };
  });

  const output = "export const GENERATED_NATIONS = " + JSON.stringify(generatedNations, null, 2) + ";\n\nexport const GENERATED_TERRITORIES = " + JSON.stringify(generatedTerritories, null, 2) + ";\n";
  
  fs.writeFileSync('src/game/generated_nations.ts', output, 'utf8');
  console.log('Regenerated src/game/generated_nations.ts with ' + Object.keys(generatedNations).length + ' nations and ' + Object.keys(generatedTerritories).length + ' territories.');
}

generate();
