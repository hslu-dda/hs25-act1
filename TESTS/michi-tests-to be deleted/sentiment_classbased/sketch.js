let data = {};
let items = [];
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
  console.log("yay");
  // Initialize the sentiment analysis model
  sentiment = ml5.sentiment("MovieReviews");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(100);

  console.log("Data loaded:", data);

  // Sort data by location first, then by dimension
  let sortedData = sortDataByT(data);
  console.log("sorted data:", sortedData);
  logDataInfo();

  data = sortDataByT(data);

  redColor = color(210, 90, 70);
  greenColor = color(100, 160, 100);
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    let dataInstance = new Data(item);
    items.push(dataInstance);
    let indicator = item["Indicator English"] || "unknown";
    getSentiment(indicator, i, dataInstance); // Pass the Data instance
  }
}

function draw() {
  for (let item of items) {
    // Draw each item based on its sentiment
    let mappedColor = lerpColor(redColor, greenColor, item.sentiment.confidence);
    //fill(mappedColor);
    item.draw();
    // rect(item.pos, item.pY, rectWidth, rectHeight);
  }
  // No animation needed - everything drawn in setup
  // for (let object of dataObjects) {
  //   let mappedColor = lerpColor(redColor, greenColor, object.confidence);
  //   fill(mappedColor);
  //   rect(object.pX, object.pY, rectWidth, rectHeight);
  // }
  // for (let object of data) {
  //   let conf = object.confidence || 0;
  //   let mappedColor = lerpColor(redColor, greenColor, conf);
  //   fill(mappedColor);
  //   rect(object.pX, object.pY, rectWidth, rectHeight);
  // }
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

    // If locations are the same, sort by Total (descending numeric)
    if (totalA !== totalB) {
      return totalB - totalA; // Descending order (larger numbers first)
    }

    // Sort by location first
    let locationComparison = locationA.localeCompare(locationB);
    if (locationComparison !== 0) {
      return locationComparison;
    }

    // If Total values are also the same, sort by Dimension 1
    return dimensionA.localeCompare(dimensionB);
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

function getSentiment(text, textId, dataInstance) {
  sentiment.predict(text, (prediction) => {
    gotResult(prediction, textId, text, dataInstance); // Pass dataInstance
  });
}

function gotResult(prediction, textId, originalText, dataInstance) {
  dataInstance.setSentiment(prediction);
}
