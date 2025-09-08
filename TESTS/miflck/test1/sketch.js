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
let rectWidth = 10;
let rectHeight = 10;
let spacing = 2;
let textHeight = 12;

function preload() {
  data = loadD3JSON("data/combined-data.json");
  console.log("yay");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  console.log("Data loaded:", data);

  // Sort data by location first, then by dimension
  let sortedData = sortData(data);
  console.log("sorted data:", sortedData);

  // Draw the visualization
  drawVisualization(sortedData);
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

// function sortData(inputData) {
//   return [...inputData].sort((a, b) => {
//     let locationA = a.location || "";
//     let locationB = b.location || "";
//     let dimensionA = a["Dimension 1"] || "";
//     let dimensionB = b["Dimension 1"] || "";

//     // Sort by location first
//     let locationComparison = locationA.localeCompare(locationB);

//     // If locations are the same, sort by dimension
//     if (locationComparison === 0) {
//       return dimensionA.localeCompare(dimensionB);
//     }

//     return locationComparison;
//   });
// }

function drawVisualization(sortedData) {
  let x = padding;
  let y = padding;

  textSize(10);

  let currentLocation = "";
  let currentDimension = "";

  for (let i = 0; i < sortedData.length; i++) {
    let item = sortedData[i];
    let location = item.Community || "unknown";
    let dimension = item["Dimension 1"] || "null";

    // Check if we need to start a new section
    let needsNewLocation = location !== currentLocation;
    let needsNewDimension = dimension !== currentDimension && location === currentLocation;

    // Start new location section
    if (needsNewLocation) {
      x = padding;
      y += rectHeight * 5; // Extra space between locations

      // Draw location label
      fill(0);
      text(location, x, y);
      y += textHeight + 5;

      // Draw dimension label
      text(dimension, x, y);
      y += 5;

      currentLocation = location;
      currentDimension = dimension;
    }
    // Start new dimension section (same location)
    else if (needsNewDimension) {
      x = padding;
      y += rectHeight + textHeight; // Small space between dimensions

      // Draw dimension label
      fill(0);
      text(dimension, x, y);
      y += 5;

      currentDimension = dimension;
    }

    // Draw the data rectangle
    fill(dimensionColors[dimension]);
    rect(x, y, rectWidth, rectHeight);

    // Move to next position
    x += rectWidth + spacing;

    // Wrap to next line if needed
    if (x > width - rectWidth - padding) {
      x = padding;
      y += rectHeight + spacing;
    }
  }

  // Draw legend
  drawLegend();
}

function drawLegend() {
  let legendX = width - 200;
  let legendY = 50;

  fill(0);
  textSize(12);
  text("Legend:", legendX, legendY);

  legendY += 20;
  textSize(10);

  // Draw color squares and labels for each dimension
  let dimensionNames = Object.keys(dimensionColors);

  for (let i = 0; i < dimensionNames.length; i++) {
    let dimension = dimensionNames[i];

    // Skip null entries in legend
    if (dimension === "null") continue;

    // Draw color square
    fill(dimensionColors[dimension]);
    rect(legendX, legendY, rectWidth, rectHeight);

    // Draw label
    fill(0);
    text(dimension, legendX + rectWidth + 10, legendY + rectHeight);

    legendY += rectHeight + 5;
  }
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

function draw() {
  // No animation needed - everything drawn in setup
}
