let dataAsync = {};
let dataArray = [];

const files = {
  blagajLT: "indicators-dimensions-blagajLT.csv",
  blagajP: "indicators-dimensions-blagajP.csv",
  bulivarCernicaLT: "indicators-dimensions-bulivarCernicaLT.csv",
  bulivarCernicaP: "indicators-dimensions-bulivarCernicaP.csv",
  podhumLT: "indicators-dimensions-podhumLT.csv",
  podhumP: "indicators-dimensions-podhumP.csv",
  zalikLT: "indicators-dimensions-ZalikLT.csv",
  zalikP: "indicators-dimensions-ZalikP.csv",
};

function preload() {
  //  dataAsync = loadD3CSV("data/indicators-dimensions-blagajLT.csv", ";");
  Object.keys(files).forEach((key) => {
    const value = files[key];
    console.log(`Name: ${key}, Path: ${value}`);
    dataAsync[key] = loadD3CSV(`data/${files[key]}`, ";");
  });
}

function setup() {
  console.log(dataAsync);
  dataArray = Object.keys(dataAsync).flatMap((location) =>
    dataAsync[location].map((obj) => ({
      ...obj,
      location: location,
    }))
  );
  console.log(dataArray);
  //saveJSON(dataArray, "combined-data.json");

  let blagajLT = dataArray.filter((obj) => obj.location === "blagajLT");
  console.log(blagajLT);

  createCanvas(400, 400);
}

function draw() {
  background(220);
}
