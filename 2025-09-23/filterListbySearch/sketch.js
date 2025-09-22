let searchList;
let rawData;
let rows;

let currentDataset = "zalikLT";//Auszug Community

let cellHeight = 24;//Zeilenhöhe
let fontSize = 16;

function preload() {
  rawData = loadJSON("../../data/mostar-augmented.json");
}

function setup() {
  rows = Object.values(rawData).filter(r => r.Community === currentDataset);
  //ausrechnen, wie hoch die canvas sein muss, damit alle Daten Platz haben
  createCanvas(windowWidth, rows.length * cellHeight);
  
  /*-----TODOS -----*/
  //----canvas in einem DOM Element positionieren

  //---- Array searchList zusammenstellen, das durchsucht wird

  //------Input Formular Element kreieren, Eingabe User Suchbegriff, Event onInput verknüpfen
 

  textAlign(LEFT, TOP);
  fill(0,0,255);
  textSize(fontSize);

  renderList(searchList);//zum Start alle Indikatoren darstellen
}



function renderList(suggestions) {
  background(255, 150);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    /*-----TODOS -----*/
    //nur Indikatoren anzeigen, die den Suchbegriff beinhalten
    push();
    translate(100, i * cellHeight);
    text(row["Indicator English"], 0, 0);
   

    pop();
  }
}

function onInput() {
  let query = input.value().toLowerCase();//Suchbegriff auf Kleinschreibung umwandeln
  /*-----TODOS -----*/
  // ------- Filter anwenden
  

  // renderList neu aufrufen mit den Suchresultaten
}
