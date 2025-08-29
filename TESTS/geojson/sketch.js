let mostarMap; // GeoJSON-Daten
let streetsMap;
let bounds; // {minLat, maxLat, minLon, maxLon}


function preload() {
  // GeoJSON  laden 
  mostarMap = loadJSON("data/boundary-polygon-lvl6.geojson");
  streetsMap = loadJSON("data/mostar_streets.geojson")
}

function setup() {

  // Bounding Box aus GeoJSON berechnen, minimale lon und lat, maximale lon und lat Angaben
  bounds = getGeoBounds(mostarMap);

  let deltaLon = bounds.maxLon - bounds.minLon;
  let deltaLat = bounds.maxLat - bounds.minLat;
  let ratio = deltaLon / deltaLat;

  // Höhe fix, Breite automatisch proportional
  let targetHeight = windowHeight;
  let targetWidth = targetHeight * ratio;

  createCanvas(targetWidth, targetHeight);

  noLoop();
}

function draw() {
  background(22,39,47);

  stroke(255);
  strokeWeight(1);
  fill(35,53,63);
  // 1. Alle Features aus dem GeoJSON Mostar Shape durchgehen
  for (let feature of mostarMap.features) {
    let coordinates = feature.geometry.coordinates;

    // Es gibt verschiedene Typen: Polygon und MultiPolygon
    if (feature.geometry.type === "Polygon") {
      drawPolygon(coordinates);
    } else if (feature.geometry.type === "MultiPolygon") {
      for (let polygon of coordinates) {
        drawPolygon(polygon);
      }
    }
  }

  //2. Strassen zeichnen 
  stroke(167, 190, 200);
  strokeWeight(1);
  noFill();
  for (let feature of streetsMap.features) {
    let coords = feature.geometry.coordinates;
    if (feature.geometry.type === "LineString") {
      drawLineString(coords);
    } else if (feature.geometry.type === "MultiLineString") {
      for (let line of coords) {
        drawLineString(line);
      }
    }
  }
}

function drawPolygon(polygon) {
  
  beginShape();
  for (let coord of polygon[0]) {
    // GeoJSON ist [lon, lat], wir müssen das für Canvas umrechnen
    let lon = coord[0];
    let lat = coord[1];

    // Simple "Projection": Längen- und Breitengrade flach auf Canvas mappen
    let x = map(lon, bounds.minLon, bounds.maxLon, 0, width);
    let y = map(lat, bounds.maxLat, bounds.minLat, 0, height);

    vertex(x, y);

  }
  endShape(CLOSE);
}


function drawLineString(line) {
  beginShape();
  for (let coord of line) {
    let [lon, lat] = coord;
    let x = map(lon, bounds.minLon, bounds.maxLon, 0, width);
    let y = map(lat, bounds.maxLat, bounds.minLat, 0, height);
    vertex(x, y);
  }
  endShape();
}

// Hilfsfunktion: Bounding Box berechnen
function getGeoBounds(geojson) {
  let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;

  for (let feature of geojson.features) {
    let coords = feature.geometry.coordinates;

    if (feature.geometry.type === "Polygon") {
      updateBounds(coords);
    } else if (feature.geometry.type === "MultiPolygon") {
      for (let poly of coords) {
        updateBounds(poly);
      }
    }
  }

  function updateBounds(polygon) {
    for (let coord of polygon[0]) {
      let lon = coord[0];
      let lat = coord[1];

      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  return { minLat, maxLat, minLon, maxLon };
}