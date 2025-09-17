let rawData; // das komplette JSON
let currentDataset = "zalikLT";//Auszug Community
let currentMax, currentMin; //max und min Importance Score im Auszug

let importanceSlider;
let importanceThreshold = 0;//Schwellenwert für Anzeige/Zoom der Indikatoren

let hoveredIndicator = null; //hover tracken

let border = 10;

/**
 * Lädt alle Datensets aus einem JSON
 * loadJSON gibt ein Objekt zurück rawData
 */
function preload() {

  //loadJSON gibt ein Objekt zurück
  rawData = loadJSON("../../data/combined-data.json");

}

function setup() {
  const cvn=createCanvas(windowWidth, windowHeight);
  cvn.parent("sketch")

  let rows = Object.values(rawData).filter(r => r.Community === currentDataset);
  //maximales udn minimales Gewicht der Importances Scores im aktuellen Datensatz 
  currentMax = Math.max(...rows.map(r => float(r["Imp score"])));
  currentMin = Math.min(...rows.map(r => float(r["Imp score"])));

  const avg = (currentMax - currentMin) / 2 + currentMin; //default value im slider -> Mittelwert


  //Slider kreieren 
  importanceSlider = createSlider(currentMin, currentMax, avg);
  importanceSlider.parent("slider");

}

function draw() {
  background(255);
  randomSeed(4);
  importanceThreshold = importanceSlider.value(); //Value aus dem Slider auswählen

  let rows = Object.values(rawData).filter(r => r.Community === currentDataset);

  for (let i = 0; i < rows.length; i++) {
    const importance = rows[i]["Imp score"].toFixed(3);//gerundet auf drei stellen nach komma
    if (importance >= importanceThreshold) {
      const size = map(importance, currentMin, currentMax, 2, 20);
      const xpos = random(width - 2 * border) + border;
      const ypos = random(height - 2 * border) + border;

      if (size > dist(mouseX, mouseY, xpos, ypos)) {
        hoveredIndicator = { "val": rows[i], "d": size, "center":{x:xpos, y:ypos} };
        fill(0);
      } else {
        fill(255);
      }
      ellipse(xpos, ypos, size, size)
    }

  }

  if (hoveredIndicator !== null) {
    drawInfoFenster(hoveredIndicator);
  }

}


/*--------pures JavaScript --------*/
/* Zugriff auf DOM */

function drawInfoFenster(indicator) {
  const fenster = document.getElementById("infofenster");
 
  //check, ob aktuelle mousepos noch im range liegt, falls nicht, fenster ausblenden 
  if (indicator.d > dist(mouseX, mouseY, indicator.center.x, indicator.center.y)) {
    const text = indicator.val["Indicator English"];
   

    fenster.querySelector("h2").innerHTML = text;

    //Zugriff auf CSS Styles des Elements
    if(indicator.center.x + 300 > width){
      indicator.center.x = width - 300;
    }
    
    if(indicator.center.y + fenster.clientHeight > height){
      indicator.center.y = height - fenster.clientHeight;
    }
    fenster.style.top = indicator.center.y + "px";
    fenster.style.left = indicator.center.x + "px";
    fenster.classList.add("visible");
  }else{
    fenster.classList.remove("visible");
  }

}