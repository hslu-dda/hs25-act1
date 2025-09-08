let data = {};

// Colors for different dimensions
const dimensionColors = {
  "Economic Activity & Livelihoods": "#FF6B6B",
  "Dealing with the Past": "#4ECDC4",
  "Culture & Society": "#45B7D1",
  "Rights & Dignity": "#96CEB4",
  Security: "#FFEAA7",
  "Armed Actors": "#DDA0DD",
  null: "#C0C0C0",
};

// Settings for layout
let padding = 20;
let rectWidth = 15;
let rectHeight = 15;
let spacing = 2;
let textHeight = 12;

let redColor, greenColor;

let sentiment;

let posX = padding,
  posY = padding;

let dataObjects = [];

function preload() {
  data = loadD3JSON("data/mostar-combined.json");
  // Initialize the sentiment analysis model
  sentiment = ml5.sentiment("MovieReviews");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(100);

  console.log("Data loaded:", data);

  // Sort data by location first, then by dimension
  //let sortedData = sortDataByT(data);
  // console.log("sorted data:", sortedData);
  logDataInfo();

  //data = sortDataByT(data);

  redColor = color(210, 90, 70);
  greenColor = color(100, 160, 100);

  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    let indicator = item["Indicator English"] || "unknown";
    getSentiment(indicator, i, item);
  }
}

function draw() {
  // No animation needed - everything drawn in setup
  for (let object of dataObjects) {
    let mappedColor = lerpColor(redColor, greenColor, object.confidence);
    fill(mappedColor);
    rect(object.pX, object.pY, rectWidth, rectHeight);
  }

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

function getUniqueValues(data, property) {
  return [...new Set(data.map((item) => item[property]))];
}

function logDataInfo() {
  let uniqueLocations = getUniqueValues(data, "location");
  let uniqueConcepts = getUniqueValues(data, "Concept");
  let uniqueDimensions = getUniqueValues(data, "Dimension 1");

  console.log("Unique locations:", uniqueLocations);
  console.log("Unique concepts:", uniqueConcepts);
  console.log("Unique dimensions:", uniqueDimensions);
}

function getSentiment(text, textId, originalItem) {
  sentiment.predict(text, (prediction) => {
    gotResult(prediction, textId, text, originalItem); // Pass originalItem here
  });
}

function gotResult(prediction, textId, originalText, originalItem) {
  //  console.log(`Result for "${originalText}" (ID: ${textId}):`, prediction.confidence);
  // Now you know exactly which text this result belongs to
  if (posX > width - padding - rectWidth) {
    posX = padding;
    posY += rectHeight + spacing;
  }

  originalItem.sentimentScore = prediction.confidence;

  const newObject = {
    prediction: prediction,
    confidence: prediction.confidence,
    pX: posX,
    pY: posY,
  };
  posX += rectWidth + spacing;

  dataObjects.push(newObject);
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveJSON(data, "data.json");
  }
}
