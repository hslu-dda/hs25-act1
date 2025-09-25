let dataArray = [];
let filteredArray = [];

let rawData;
let inputField;

function preload() {
  rawData = loadJSON("data/combined-data.json");
}

function setup() {
  dataArray = Object.values(rawData);
  console.log(rawData);
  console.log(dataArray);
  filteredArray = dataArray;
  let canvas = createCanvas(400, 400);
  canvas.parent("canvasContainer");

  inputField = createInput();
  inputField.parent("panel");
  inputField.input(handleInput);

  appendItems();
}

function draw() {
  background(220);
}

function handleInput() {
  let query = inputField.value().toLowerCase();
  console.log(query);
  filteredArray = dataArray.filter((item) => {
    let indicator = item["Indicator English"] || "";
    return indicator.toLowerCase().includes(query);
  });

  appendItems();
}

function appendItems() {
  console.log("appendItems");
  const container = select("#contentContainer");
  container.html("");
  for (item of filteredArray) {
    let newDiv = createDiv();
    newDiv.parent(container);
    newDiv.class("item");

    newDiv.html(`
      <h3> ${item["Indicator English"] || "No Title"}</h3>
      <p>Community:${item["Community"] || "N/A"}</p>
      <p>Dimension:${item["Dimension 1"] || "N/A"}
      `);
  }
}
