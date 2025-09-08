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

function preload() {
  data = loadD3JSON("data/mostar-combined.json");
  console.log("yay");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  console.log("Data loaded:", data);

  // Sort data by location first, then by dimension
  let sortedData = sortDataByT(data);
  console.log("sorted data:", sortedData);

  // Draw the visualization
  drawVisualization(sortedData);
}

function sortData(inputData) {
  return [...inputData].sort((a, b) => {
    let locationA = a.location || "";
    let locationB = b.location || "";
    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";

    // Sort by location first
    let locationComparison = locationA.localeCompare(locationB);

    // If locations are the same, sort by dimension
    if (locationComparison === 0) {
      return dimensionA.localeCompare(dimensionB);
    }

    return locationComparison;
  });
}

function sortDataByT(inputData) {
  return [...inputData].sort((a, b) => {
    let locationA = a.location || "";
    let locationB = b.location || "";
    let totalA = a["Total"] || a["T"] || a["t"] || 0;
    let totalB = b["Total"] || b["T"] || b["t"] || 0;
    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";

    // Sort by location first
    let locationComparison = locationA.localeCompare(locationB);
    if (locationComparison !== 0) {
      return locationComparison;
    }

    // If locations are the same, sort by Total (descending numeric)
    if (totalA !== totalB) {
      return totalB - totalA; // Descending order (larger numbers first)
    }

    // If Total values are also the same, sort by Dimension 1
    return dimensionA.localeCompare(dimensionB);
  });
}

function drawVisualization(sortedData) {
  let x = padding;
  let y = padding;

  textSize(10);

  let currentLocation = "";
  let currentDimension = "";

  for (let i = 0; i < sortedData.length; i++) {
    let item = sortedData[i];
    let location = item.location || "unknown";
    let dimension = item["Dimension 1"] || "null";

    // Check if we need to start a new section
    let needsNewLocation = location !== currentLocation;
    let needsNewDimension = dimension !== currentDimension && location === currentLocation;

    // Start new location section
    if (needsNewLocation) {
      x = padding;
      y += rectHeight * 3; // Extra space between locations

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
      //x = padding;
      //y += rectHeight + textHeight; // Small space between dimensions

      // Draw dimension label
      fill(0);
      //text(dimension, x, y);
      // y += 5;

      currentDimension = dimension;
    }

    let tValue = item["Total"] || item["T"] || item["t"] || 0;
    let alpha = map(tValue, 0, 20, 0, 255); // Adjust this mapping as needed

    let rH = map(tValue, 0, 20, 0, 255); // Adjust this mapping as needed

    let baseColor = dimensionColors[dimension];
    fill(red(baseColor), green(baseColor), blue(baseColor), alpha);

    // Draw the data rectangle
    //fill(dimensionColors[dimension]);
    rect(x, y, rectWidth, rectHeight);
    push();
    fill(0);
    textSize(8);
    text(tValue, x, y + 8);
    pop();
    // Move to next position
    x += rectWidth + spacing;

    // Wrap to next line if needed
    if (x > 500) {
      //width - rectWidth - padding) {
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
