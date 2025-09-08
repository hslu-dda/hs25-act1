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
let rectWidth = 10; // Breite der Rechtecke
let rectHeight = 10; // Höhe der Rechtecke
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

  // Sortiere Daten erst nach Community, dann nach Dimension, dann nach Subdimension
  let sortedData = sortData(data);
  console.log("Sortierte Daten:", sortedData);

  // Zeichne die Visualisierung
  drawVisualization(sortedData);
}

// Funktion zum Sortieren der Daten
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
    let community = item.Community || "unknown";
    let dimension = item["Dimension 1"] || "null";

    // Prüfe ob neue Sektion nötig ist
    let needsNewCommunity = community !== currentCommunity;
    let needsNewDimension = dimension !== currentDimension && community === currentCommunity;

    // Neue Community-Sektion beginnen
    if (needsNewCommunity) {
      x = padding; // Zurück zum linken Rand
      y += rectHeight * 5; // Extra Platz zwischen Communities

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
      x = padding; // Zurück zum linken Rand
      y += rectHeight + textHeight; // Kleiner Platz zwischen Dimensionen

      // Zeichne Dimension-Label
      fill(0); // Schwarzer Text
      text(dimension, x, y);
      y += 5;

      currentDimension = dimension;
    }

    // Zeichne das Daten-Rechteck
    fill(dimensionColors[dimension]);
    rect(x, y, rectWidth, rectHeight);

    // Bewege zur nächsten Position
    x += rectWidth + spacing;

    // Neue Zeile wenn nötig
    if (x > width - rectWidth - padding) {
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
