let searchList;
let rawData;
let rows;

let currentDataset = "zalikLT";//Auszug Community

let input;
let cellHeight = 24;

function preload() {
  rawData = loadJSON("../../data/mostar-augmented.json");
}

function setup() {
  rows = Object.values(rawData).filter(r => r.Community === currentDataset);
  const cvn = createCanvas(windowWidth, rows.length * cellHeight);
  cvn.parent("sketch");


  searchList = rows.map(r => r["Indicator English"]);

  input = createInput();
  input.parent("inputfield");
  input.input(onInput); // p5.js Methode, die auf input-Events reagiert und die Funktion onInput aufruft


  textAlign(LEFT, TOP);
  fill(0,0,255);
  textSize(16);
  renderList(searchList);//zum Start alle darstellen
}



function renderList(suggestions) {
  background(255, 150);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // prüfen, ob row im array suggestions existiert
    let exists = suggestions.includes(row["Indicator English"]);
    push();
    translate(100, i * cellHeight);
    if (exists) {
      // render "sichtbar"
      text(row["Indicator English"], 0, 0);
    }

    pop();
  }
}

function onInput() {
  let query = input.value().toLowerCase();
  // Filter anwenden
  let suggestions = searchList.filter(term =>
    term.toLowerCase().includes(query)
  );

  renderList(suggestions);
}
