let dataAsync = {};

const dimensionColors = {
  "Economic Activity & Livelihoods": "#FF6B6B",
  "Dealing with the Past": "#4ECDC4",
  "Culture & Society": "#45B7D1",
  "Rights & Dignity": "#96CEB4",
  Security: "#FFEAA7",
  "Armed Actors": "#DDA0DD",
  null: "#C0C0C0",
};

// const dimensionColors = {
//   "Economic Activity & Livelihoods": "#2d0a0a",
//   "Dealing with the Past": "#722f2f",
//   "Culture & Society": "#c44569",
//   "Rights & Dignity": "#e056fd",
//   Security: "#9c27b0",
//   "Armed Actors": "#7b1fa2",
//   null: "#a6a6a6",
// };

// Alternative blue palette (more vibrant):
const locationColorsVibrant = {
  blagajLT: "#0D47A1", // Deep Blue
  blagajP: "#1976D2", // Blue
  bulivarCernicaLT: "#2196F3", // Light Blue
  bulivarCernicaP: "#42A5F5", // Medium Light Blue
  podhumLT: "#64B5F6", // Sky Blue
  podhumP: "#90CAF9", // Light Sky Blue
  zalikLT: "#BBDEFB", // Pale Sky Blue
  zalikP: "#E3F2FD", // Very Pale Blue
};

function preload() {
  dataAsync = loadD3JSON("data/mostar-combined.json");
}

function setup() {
  console.log(dataAsync);
  //  let blagajLT = dataAsync.filter((obj) => obj.location === "blagajLT");
  const blagajLT = dataAsync.filter((d) => d["location"] === "blagajLT");

  console.log("Filtered blagajLT:", blagajLT);

  const sortedByDimension = [...dataAsync].sort((a, b) => {
    const dimA = a["Dimension 1"] || "";
    const dimB = b["Dimension 1"] || "";
    return dimA.localeCompare(dimB);
  });

  const sortedByLocation = [...dataAsync].sort((a, b) => {
    const locA = a.location || "";
    const locB = b.location || "";
    return locA.localeCompare(locB);
  });

  const sortedByLocationThenDimension = [...dataAsync].sort((a, b) => {
    const locA = a.location || "";
    const locB = b.location || "";
    const dimA = a["Dimension 1"] || "";
    const dimB = b["Dimension 1"] || "";

    // First sort by location
    const locationComparison = locA.localeCompare(locB);

    // If locations are the same, sort by dimension
    if (locationComparison === 0) {
      return dimA.localeCompare(dimB);
    }

    return locationComparison;
  });

  const sortedByConcept = [...dataAsync].sort((a, b) => {
    const conceptA = a.Concept || "";
    const conceptB = b.Concept || "";
    return conceptA.localeCompare(conceptB);
  });

  const uniqueLocations = [...new Set(dataAsync.map((item) => item.location))];
  const uniqueConcepts = [...new Set(dataAsync.map((item) => item.Concept))];
  const uniqueDimensions = [...new Set(dataAsync.map((item) => item["Dimension 1"]))];

  console.log("Unique locations:", uniqueLocations);
  console.log("Unique concepts:", uniqueConcepts);
  console.log("Unique dimensions:", uniqueDimensions);

  createCanvas(windowWidth, windowHeight);
  let padding = 20;
  let rWidth = 10;
  let x = 20;
  let y = 20;
  textSize(10);
  let currentDimension = sortedByLocationThenDimension[0]["Dimension 1"] || "null";
  let currentLocation = sortedByLocationThenDimension[0]["location"] || "null";
  text(currentLocation, 10, y);
  text(currentDimension, padding, y + textAscent() + textDescent());
  y += textAscent() + textDescent();

  for (let d = 0; d < sortedByLocationThenDimension.length; d++) {
    currentDimension = sortedByLocationThenDimension[d]["Dimension 1"] || "null";
    currentConcept = sortedByLocationThenDimension[d]["Concept"] || "null";
    currentLocation = sortedByLocationThenDimension[d]["location"] || "null";

    // Check for changes from previous item
    if (d > 0) {
      const prevDimension = sortedByLocationThenDimension[d - 1]["Dimension 1"] || "null";
      const prevLocation = sortedByLocationThenDimension[d - 1]["location"] || "null";
      noStroke();

      // Add spacing if location changes (50px)
      if (currentLocation !== prevLocation) {
        x = padding;
        y += rWidth * 5;
        push();
        translate(x, y);
        text(currentLocation, -padding + 10, 0);

        y += textDescent() + textAscent();
        noStroke();
        text(currentDimension, 0, textDescent() + textAscent());
        pop();
        y += textDescent();
      }
      // Add spacing if dimension changes but location hasn't (10px)
      else if (currentDimension !== prevDimension) {
        x = padding;
        y += rWidth + textAscent() + textDescent();
        push();
        translate(x, y);
        text(currentDimension, 0, 0);
        pop();
        y += textDescent();
      }
    }

    push();
    translate(x + 10, y);
    fill(dimensionColors[currentDimension]);
    rect(20, 0, rWidth, rWidth);
    fill(0);

    //text(d, 30, 10);
    pop();

    x += rWidth + 2;
    if (x > width - rWidth) {
      x = padding;
      y += rWidth + 2;
    }
  }
}

function draw() {
  //background(220);
}
