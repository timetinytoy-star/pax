const https = require('https');
const fs = require('fs');

const file = fs.createWriteStream("public/10m.geojson");
https.get("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson", function(response) {
  response.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download complete.");
  });
});
