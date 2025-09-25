let data = {};
let dataP5Way;
let dataArray = [];

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
  data = loadD3JSON("data/combined-data.json");
  dataP5Way = loadJSON("data/combined-data.json");
}

function setup() {
  console.log(data);
  console.log(dataP5Way);
  dataArray = Object.values(dataP5Way);

  dataArray.sort((a, b) => {
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

  console.log("sorted Array", dataArray);
  createCanvas(windowWidth, 5000);

  let posX = 0;
  let posY = 0;
  let lastCommunity = dataArray[0]["Community"] || "";
  let lastDimension = dataArray[0]["Dimension 1"] || "";

  for (let i = 0; i < dataArray.length; i++) {
    let item = dataArray[i];
    let community = item["Community"] || "";
    let dimension = item["Dimension 1"] || "";

    if (dimension !== lastDimension) {
      posY += 40;
      posX = 0;
      text(dimension, posX, posY);
      posY += 20;
    }

    if (community !== lastCommunity) {
      posY += 150;
      posX = 0;
      text(community, posX, posY);
      posY += 20;
      text(dimension, posX, posY);

      posY += 20;
    }
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
