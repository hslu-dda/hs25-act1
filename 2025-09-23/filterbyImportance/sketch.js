let rawData; // das komplette JSON
let currentDataset = "zalikLT";//Auszug Community 

let currentMax, currentMin; //max und min Importance Score im Auszug
let importanceSlider; //Variable Formular Element Slider
let importanceThreshold = 0;//Schwellenwert für Anzeige/Zoom der Indikatoren, wird über Slider gesteuert

let hoveredIndicator = null; //hover tracken -> Zusatzinfos anzeigen

let border = 10; //Rand um die Darstellung

/**
 * Lädt alle Datensets aus einem JSON
 * loadJSON gibt ein Objekt zurück rawData
 */
function preload() {
  rawData = loadJSON("../../data/combined-data.json");
}

function setup() {
  const cvn=createCanvas(windowWidth, windowHeight);
  // ---------- Canvas im DOM platzieren

  let rows = Object.values(rawData).filter(r => r.Community === currentDataset);
  
  //maximales und minimales Gewicht der Importances Scores im aktuellen Datensatz 
  currentMax = Math.max(...rows.map(r => float(r["Imp score"])));
  currentMin = Math.min(...rows.map(r => float(r["Imp score"])));

  const avg = (currentMax - currentMin) / 2 + currentMin; //default value im slider -> Mittelwert


  //------------Slider kreieren 
 

}

function draw() {
  background(255);
  //-----------Value aus dem Slider auswählen

  let rows = Object.values(rawData).filter(r => r.Community === currentDataset);

  for (let i = 0; i < rows.length; i++) {
    const importance = rows[i]["Imp score"].toFixed(3);//gerundet auf drei stellen nach komma
    


  }

 

}


/*--------pures JavaScript --------*/
/* -------Zugriff auf DOM ---------*/

function drawInfoFenster(indicator) {
 
 

}