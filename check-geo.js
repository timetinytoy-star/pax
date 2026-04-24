import fs from 'fs';

try {
  const data = JSON.parse(fs.readFileSync('public/world-admin1.json', 'utf8'));
  const geom = data.objects.ne_50m_admin_1_states_provinces.geometries[0];
  console.log('Available properties in topojson:');
  console.log(Object.keys(geom.properties));
} catch (e) {
  console.error(e);
}
