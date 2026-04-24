const fs = require('fs');
const topo = JSON.parse(fs.readFileSync('public/world-admin1-topo.json'));
const key = Object.keys(topo.objects)[0];
const geometries = topo.objects[key].geometries;
geometries.forEach(g => {
  const admin = g.properties.admin || g.properties.ADMIN;
  const name = g.properties.name || g.properties.NAME;
  g.properties = { admin, name };
});
fs.writeFileSync('public/world-admin1-clean.json', JSON.stringify(topo));
console.log('Done!');
