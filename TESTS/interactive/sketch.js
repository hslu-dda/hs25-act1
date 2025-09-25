let cnv;

let data = {};
let dataP5Way;
let dataArray = [];
let filteredArray = [];

let interactiveSquares = [];

let input;

const dimensionColors = {
  "Economic Activity & Livelihoods": "#FF6B6B",
  "Dealing with the Past": "#4ECDC4",
  "Culture & Society": "#45B7D1",
  "Rights & Dignity": "#96CEB4",
  Security: "#FFEAA7",
  "Armed Actors": "#DDA0DD",
  null: "#C0C0C0",
};

function preload() {
  data = loadJSON("data/combined-data.json");
}

function setup() {
  console.log(data);
  dataArray = Object.values(data);
  dataArray = sortDataArray(dataArray);
  filteredArray = dataArray; // initially no filter

  console.log("sorted Array", dataArray);
  cnv = createCanvas(windowWidth / 2, 5000);
  cnv.parent("p5Wrapper");

  // Create a text input field
  input = createInput();
  input.parent("controls");

  // Listen for typing
  input.input(handleFilterIE);

  makeInteractiveElement();
}

function draw() {
  background(255);

  // Recalculate positions for visible elements
  let posX = 0;
  let posY = 0;
  let lastCommunity = "";
  let lastDimension = "";

  for (let square of interactiveSquares) {
    if (square.isVisible) {
      let community = square.community;
      let dimension = square.dimension;

      // Check if we need to add dimension header
      if (dimension !== lastDimension) {
        if (lastDimension !== "") {
          // Don't add space before first dimension
          posY += 20;
        }
        posX = 0;
        fill(0);
        noStroke();
        text(dimension, posX, posY + 15); // +15 for better text positioning
        posY += 20;
      }

      // Check if we need to add community header
      if (community !== lastCommunity && community !== "") {
        posY += 20;
        posX = 0;
        fill(0);
        text(community, posX, posY + 15);
        posY += 20;
      }

      // Update square position
      square.x = posX;
      square.y = posY;
      square.bounds = { x: posX, y: posY, w: square.w, h: square.h }; // Update bounds for hit detection

      // Draw the square
      square.update().draw();

      posX += 20;
      if (posX > width - 20) {
        // Leave some margin
        posX = 0;
        posY += 20;
      }

      lastCommunity = community;
      lastDimension = dimension;
    }
  }
}

function makeInteractiveElement() {
  let posX = 0;
  let posY = 0;
  let lastCommunity = filteredArray[0]["Community"] || "";
  let lastDimension = filteredArray[0]["Dimension 1"] || "";
  for (let i = 0; i < filteredArray.length; i++) {
    let item = filteredArray[i];
    let community = item["Community"] || "";
    let dimension = item["Dimension 1"] || "";

    if (dimension !== lastDimension) {
      posY += 20;
      posX = 0;
      text(dimension, posX, posY);
      posY += 20;
    }

    if (community !== lastCommunity) {
      posY += 20;
      posX = 0;
      text(community, posX, posY);
      posY += 20;
      text(dimension, posX, posY);
    }

    let square = interactiveRect(posX, posY, 20, 20, `square_${i}`);
    square.setColor(color(dimensionColors[dimension] || "#000000"));
    square.setClickCallback((shape) => {
      if (shape.getIsActive()) {
        // Remove the div by finding it with the myid attribute
        let divToRemove = select(`[myid="${item["#"] || "unknown"}"]`);
        if (divToRemove) {
          divToRemove.elt.remove(); // Use native DOM remove
          console.log("Removing div:", divToRemove);
        }
      } else {
        displayIndicator(item);
      }
      shape.setIsActive(!shape.getIsActive()); // Make it stay highlighted
    });

    // Store additional data for filtering and positioning
    square.dataItem = item;
    square.id = item["#"] || `square_${i}`;
    square.community = community;
    square.dimension = dimension;
    square.originalIndex = i;
    square.isVisible = true; // initially all visible

    interactiveSquares.push(square);

    fill(dimensionColors[dimension] || "#000000");
    rect(posX, posY, 20, 20);

    posX += 20;
    if (posX > width) {
      posX = 0;
      posY += 20;
    }
    lastCommunity = community;
    lastDimension = dimension;
  }
}

function displayIndicator(item) {
  let wrapper = select("#indicatorWrapper"); // Changed from ".indicatorWrapper" to "#indicatorWrapper"

  // First remove all existing divs from the wrapper
  // wrapper.html(""); // This clears all content inside indicatorWrapper

  // Create a new div and parent it to the WRAPPER (not panel)
  let newDiv = createDiv();
  newDiv.parent(wrapper); // Changed from panel to wrapper

  // Set the HTML content
  newDiv.html(`
        <h2>${item["Indicator English"] || "No Title"}</h2>
        <p><strong>Community:</strong> ${item["Community"] || "N/A"}</p>
        <p><strong>Dimension:</strong> ${item["Dimension 1"] || "N/A"}</p>
        <p><strong>Subcategory:</strong> ${item["Subcat 1 name"] || "N/A"}</p>
     
    `);
  newDiv.attribute("myid", `${item["#"] || "unknown"}`);
  // Optional: add a CSS class or styling
  newDiv.class("indicator-item");

  return newDiv; // Return the div reference if needed
}

function handleFilter() {
  let query = input.value().toLowerCase();
  if (query === "") {
    filteredArray = dataArray; // reset
  } else {
    filteredArray = dataArray.filter((item) => {
      let indicator = item["Indicator English"] || "";
      return indicator.toLowerCase().includes(query);
    });
  }
}

function handleFilterIE() {
  let query = input.value().toLowerCase();
  console.log("Filtering with query:", interactiveSquares, query);
  if (query === "") {
    // Show all items when query is empty
    interactiveSquares.forEach((item) => {
      item.isVisible = true;
    });
  } else {
    // Set visibility based on filter criteria
    interactiveSquares.forEach((item) => {
      let indicator = item.dataItem["Indicator English"] || "";
      item.isVisible = indicator.toLowerCase().includes(query);
    });
  }
}

function sortDataArray(arr) {
  return [...arr].sort((a, b) => {
    let communityA = a["Community"] || "";
    let communityB = b["Community"] || "";

    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";

    let subCatA = a["Subcat 1 name"] || "";
    let subCatB = b["Subcat 1 name"] || "";

    let communityComparison = communityA.localeCompare(communityB);
    let dimensionComparison = dimensionA.localeCompare(dimensionB);
    let subCatComparison = subCatA.localeCompare(subCatB);

    if (communityComparison === 0) {
      if (dimensionComparison === 0) {
        return subCatComparison;
      }
      return dimensionComparison;
    }
    return communityComparison;
  });
}
