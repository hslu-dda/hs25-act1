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

// Farben für Sentiment-Darstellung
let redColor, greenColor;

// Machine Learning Modell für Sentiment-Analyse
let sentiment;

// Position für das nächste Rechteck
let posX = padding;
let posY = padding;

// Array für alle Datenobjekte mit Positionen
let dataObjects = [];

// Funktion die vor setup() ausgeführt wird - lädt Daten und ML-Modell
function preload() {
  // Lade JSON-Datei mit allen Daten
  data = loadD3JSON("data/mostar-combined.json");

  // Initialisiere das Sentiment-Analyse-Modell
  sentiment = ml5.sentiment("MovieReviews");
}

// Hauptinitialisierung - wird einmal am Anfang ausgeführt
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(100); // Dunkelgrauer Hintergrund

  console.log("Daten geladen:", data);

  // Zeige Informationen über die Daten an
  logDataInfo();

  // Definiere Farben für Sentiment-Darstellung
  redColor = color(210, 90, 70); // Rot für negatives Sentiment
  greenColor = color(100, 160, 100); // Grün für positives Sentiment

  // Gehe durch alle Daten und analysiere das Sentiment
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    let indicator = item["Indicator English"] || "unknown";
    // Starte Sentiment-Analyse für jeden Indikator
    getSentiment(indicator, i, item);
  }
}

// Zeichenfunktion - wird kontinuierlich ausgeführt
function draw() {
  // Zeichne alle Objekte aus dem dataObjects Array
  for (let object of dataObjects) {
    // Mische Farbe basierend auf Sentiment-Konfidenz
    let mappedColor = lerpColor(redColor, greenColor, object.confidence);
    fill(mappedColor);
    rect(object.pX, object.pY, rectWidth, rectHeight);
  }

  // Zeichne auch Objekte direkt aus den Daten
  for (let object of data) {
    let conf = object.confidence || 0;
    let mappedColor = lerpColor(redColor, greenColor, conf);
    fill(mappedColor);
    rect(object.pX, object.pY, rectWidth, rectHeight);
  }
}

// Funktion zum Sortieren der Daten
function sortData(inputData) {
  // Erstelle Kopie des Arrays und sortiere sie
  return [...inputData].sort((a, b) => {
    // Extrahiere Vergleichswerte (mit Fallback auf leeren String)
    let locationA = a["Community"] || "";
    let locationB = b["Community"] || "";
    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";
    let subdimensionA = a["Subcat 1 name"] || "";
    let subdimensionB = b["Subcat 1 name"] || "";

    // Vergleiche die Werte alphabetisch
    let locationComparison = locationA.localeCompare(locationB);
    let dimComparison = dimensionA.localeCompare(dimensionB);
    let subdimComparison = subdimensionA.localeCompare(subdimensionB);

    // Sortierreihenfolge: Erst Location, dann Dimension, dann Subdimension
    if (locationComparison === 0) {
      // Gleiche Location?
      if (dimComparison === 0) {
        // Gleiche Dimension?
        return subdimComparison; // Sortiere nach Subdimension
      }
      return dimComparison; // Sortiere nach Dimension
    }
    return locationComparison; // Sortiere nach Location
  });
}

// Hilfsfunktion um eindeutige Werte einer Eigenschaft zu finden
function getUniqueValues(data, property) {
  return [...new Set(data.map((item) => item[property]))];
}

// Funktion um Informationen über die Daten in der Konsole auszugeben
function logDataInfo() {
  let uniqueLocations = getUniqueValues(data, "location");
  let uniqueConcepts = getUniqueValues(data, "Concept");
  let uniqueDimensions = getUniqueValues(data, "Dimension 1");

  console.log("Eindeutige Locations:", uniqueLocations);
  console.log("Eindeutige Konzepte:", uniqueConcepts);
  console.log("Eindeutige Dimensionen:", uniqueDimensions);
}

// Funktion um Sentiment-Analyse für einen Text zu starten
function getSentiment(text, textId, originalItem) {
  sentiment.predict(text, (prediction) => {
    // Wenn Ergebnis fertig ist, rufe gotResult auf
    gotResult(prediction, textId, text, originalItem);
  });
}

// Callback-Funktion die aufgerufen wird wenn Sentiment-Analyse fertig ist
function gotResult(prediction, textId, originalText, originalItem) {
  // Prüfe ob neue Zeile nötig ist
  if (posX > width - padding - rectWidth) {
    posX = padding; // Zurück zum linken Rand
    posY += rectHeight + spacing; // Eine Zeile nach unten
  }

  // Speichere Sentiment-Score im ursprünglichen Datenobjekt
  originalItem.sentimentScore = prediction.confidence;

  // Erstelle neues Objekt mit Position und Sentiment-Daten
  const newObject = {
    prediction: prediction,
    confidence: prediction.confidence,
    pX: posX, // X-Position
    pY: posY, // Y-Position
  };

  // Bewege Position für nächstes Rechteck
  posX += rectWidth + spacing;

  // Füge Objekt zum Array hinzu
  dataObjects.push(newObject);
}

// Funktion die ausgeführt wird wenn eine Taste gedrückt wird
function keyPressed() {
  // Speichere Daten als JSON-Datei wenn 's' oder 'S' gedrückt wird
  if (key === "s" || key === "S") {
    saveJSON(data, "data.json");
  }
}
