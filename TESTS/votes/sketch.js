// Globale Variable für die geladenen Daten
let data = {};

// Farben für verschiedene Dimensionen
const dimensionColors = {
  "Economic Activity & Livelihoods": "#FF6B6B",
  "Dealing with the Past": "#4ECDC4",
  "Culture & Society": "#45B7D1",
  "Rights & Dignity": "#96CEB4",
  Security: "#FFEAA7",
  "Armed Actors": "#DDA0DD",
  null: "#C0C0C0",
};

// Einstellungen für das Layout
let padding = 20; // Abstand zu den Rändern
let rectWidth = 15; // Breite der Rechtecke
let rectHeight = 15; // Höhe der Rechtecke
let spacing = 2; // Abstand zwischen Rechtecken
let textHeight = 12; // Höhe des Texts

// Funktion die vor setup() ausgeführt wird - lädt die JSON-Datei
function preload() {
  data = loadD3JSON("data/combined-data.json");
  console.log("Daten werden geladen...");
}

// Hauptinitialisierung - wird einmal am Anfang ausgeführt
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255); // Weißer Hintergrund

  console.log("Daten geladen:", data);

  // Sortiere Daten nach Total-Werten (absteigend)
  let sortedData = sortDataByT(data);
  console.log("Sortierte Daten:", sortedData);

  // Zeichne die Visualisierung
  drawVisualization(sortedData);
}

// Funktion zum alphabetischen Sortieren der Daten
function sortData(inputData) {
  // Erstelle Kopie des Arrays und sortiere sie
  return [...inputData].sort((a, b) => {
    // Extrahiere Vergleichswerte (mit Fallback auf leeren String)
    let communityA = a["Community"] || "";
    let communityB = b["Community"] || "";
    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";
    let subdimensionA = a["Subcat 1 name"] || "";
    let subdimensionB = b["Subcat 1 name"] || "";

    // Vergleiche die Werte alphabetisch
    let communityComparison = communityA.localeCompare(communityB);
    let dimComparison = dimensionA.localeCompare(dimensionB);
    let subdimComparison = subdimensionA.localeCompare(subdimensionB);

    // Sortierreihenfolge: Erst Community, dann Dimension, dann Subdimension
    if (communityComparison === 0) {
      // Gleiche Community?
      if (dimComparison === 0) {
        // Gleiche Dimension?
        return subdimComparison; // Sortiere nach Subdimension
      }
      return dimComparison; // Sortiere nach Dimension
    }
    return communityComparison; // Sortiere nach Community
  });
}

// Funktion zum Sortieren nach Total-Werten (größte Werte zuerst)
function sortDataByT(inputData) {
  return [...inputData].sort((a, b) => {
    let communityA = a["Community"] || "";
    let communityB = b["Community"] || "";
    let totalA = a["Total"] || a["T"] || a["t"] || 0;
    let totalB = b["Total"] || b["T"] || b["t"] || 0;
    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";

    // Sortiere erst nach Community
    let communityComparison = communityA.localeCompare(communityB);
    if (communityComparison !== 0) {
      return communityComparison;
    }

    // Wenn Communities gleich sind, sortiere nach Total-Werten (absteigend)
    if (totalA !== totalB) {
      return totalB - totalA; // Größere Zahlen zuerst
    }

    // Wenn auch Total-Werte gleich sind, sortiere nach Dimension
    return dimensionA.localeCompare(dimensionB);
  });
}

// Hauptfunktion zum Zeichnen der Visualisierung
function drawVisualization(sortedData) {
  let x = padding; // Startposition X
  let y = padding; // Startposition Y
  textSize(10);

  let currentCommunity = "";
  let currentDimension = "";

  // Gehe durch alle sortierten Daten
  for (let i = 0; i < sortedData.length; i++) {
    let item = sortedData[i];
    let community = item["Community"] || "unknown";
    let dimension = item["Dimension 1"] || "null";

    // Prüfe ob neue Sektion nötig ist
    let needsNewCommunity = community !== currentCommunity;
    let needsNewDimension = dimension !== currentDimension && community === currentCommunity;

    // Neue Community-Sektion beginnen
    if (needsNewCommunity) {
      x = padding; // Zurück zum linken Rand
      y += rectHeight * 3; // Extra Platz zwischen Communities

      // Zeichne Community-Label
      fill(0); // Schwarzer Text
      text(community, x, y);
      y += textHeight + 5;

      // Zeichne Dimension-Label
      text(dimension, x, y);
      y += 5;

      currentCommunity = community;
      currentDimension = dimension;
    }
    // Neue Dimension-Sektion (gleiche Community)
    else if (needsNewDimension) {
      // Aktualisiere nur die aktuelle Dimension
      // (keine visuelle Trennung in diesem Layout)
      currentDimension = dimension;
    }

    // Hole Total-Wert und berechne Transparenz
    let tValue = item["Total"] || item["T"] || item["t"] || 0;
    let alpha = map(tValue, 0, 20, 0, 255); // Mappe Wert zu Transparenz (0-255)

    // Hole Grundfarbe und wende Transparenz an
    let baseColor = dimensionColors[dimension];
    fill(red(baseColor), green(baseColor), blue(baseColor), alpha);

    // Zeichne das Daten-Rechteck
    rect(x, y, rectWidth, rectHeight);

    // Zeichne Total-Wert als Text auf dem Rechteck
    push(); // Speichere aktuelle Einstellungen
    fill(0); // Schwarzer Text
    textSize(8);
    text(tValue, x, y + 8);
    pop(); // Stelle ursprüngliche Einstellungen wieder her

    // Bewege zur nächsten Position
    x += rectWidth + spacing;

    // Neue Zeile wenn bestimmte Breite erreicht
    if (x > 500) {
      x = padding;
      y += rectHeight + spacing;
    }
  }

  // Zeichne die Legende
  drawLegend();
}

// Funktion zum Zeichnen der Legende
function drawLegend() {
  let legendX = width - 200; // Position rechts im Canvas
  let legendY = 50;

  // Legende-Titel
  fill(0); // Schwarzer Text
  textSize(12);
  text("Legende:", legendX, legendY);
  legendY += 20;

  textSize(10);

  // Zeichne Farbquadrate und Labels für jede Dimension
  let dimensionNames = Object.keys(dimensionColors);
  for (let i = 0; i < dimensionNames.length; i++) {
    let dimension = dimensionNames[i];

    // Überspringe null-Einträge in der Legende
    if (dimension === "null") continue;

    // Zeichne Farbquadrat
    fill(dimensionColors[dimension]);
    rect(legendX, legendY, rectWidth, rectHeight);

    // Zeichne Label
    fill(0); // Schwarzer Text
    text(dimension, legendX + rectWidth + 10, legendY + rectHeight);
    legendY += rectHeight + 5;
  }
}

// Hilfsfunktion um eindeutige Werte einer Eigenschaft zu finden
function getUniqueValues(data, property) {
  return [...new Set(data.map((item) => item[property]))];
}

// Funktion um Informationen über die Daten in der Konsole auszugeben
function logDataInfo() {
  let uniqueCommunities = getUniqueValues(data, "Community");
  let uniqueConcepts = getUniqueValues(data, "Concept");
  let uniqueDimensions = getUniqueValues(data, "Dimension 1");

  console.log("Eindeutige Communities:", uniqueCommunities);
  console.log("Eindeutige Konzepte:", uniqueConcepts);
  console.log("Eindeutige Dimensionen:", uniqueDimensions);
}

// Zeichenfunktion - wird kontinuierlich ausgeführt
function draw() {
  // Keine Animation nötig - alles wird in setup() gezeichnet
}
