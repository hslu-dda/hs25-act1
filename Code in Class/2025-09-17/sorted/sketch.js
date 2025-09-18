let data = {};
let dataP5Way;
let dataArray = [];

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
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
