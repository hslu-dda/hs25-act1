let searchList;
let rawData;
let rows;

let currentDataset = "zalikLT";//Auszug Community

let input; //Variable für das Formular Element
let cellHeight = 24;

function preload() {
  rawData = loadJSON("../data/mostar-augmented.json");
}

function setup() {
  rows = Object.values(rawData).filter(r => r.Community === currentDataset);
  //ausrechnen, wie hoch die canvas sein muss, damit alle Daten Platz haben
  const cvn = createCanvas(windowWidth, rows.length * cellHeight);
  
  //----canvas in einem DOM Element positionieren

  //----Array zusammenstellen, das durchsucht wird

  //------Input Formular Element kreieren
 

  textAlign(LEFT, TOP);
  fill(0,0,255);
  textSize(16);
  renderList(searchList);//zum Start alle darstellen
}



function renderList(suggestions) {
  background(255, 150);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    //---- todo anpassen, nur Indikatoren anzeigen, die den Suchbegriff beinhalten
    push();
    translate(100, i * cellHeight);
    text(row["Indicator English"], 0, 0);
   

    pop();
  }
}

function onInput() {
  let query = input.value().toLowerCase();//Suchbegriff auf Kleinschreibung umwandeln
  // ------- Filter anwenden
  

  // renderList neu aufrufen mit den Suchresultaten
}
