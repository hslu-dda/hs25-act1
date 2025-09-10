/*
1. Grundstruktur
Dimensionen (6 Stück) → wie „Gravitationszentren“ oder Kraftfelder im Raum (2D oder 3D).
Indikatoren (~300) → sind Nodes, die von zwei Zentren (ihren Dimensionen) „angezogen“ werden.
Stärke des Knotens (Größe, Farbe) = Summe der Votes .

2. Darstellung
Jeder Indikator wird als Kreis, der von 2 Dimensionen „gepullt“ wird → Position ergibt sich durch die Balance.

3. Interaktivität
Hover / Klick: Zeigt Indikator-Text + Votes Male/Female/Youth.
*/
let datasets = {};
let currentDataset = "Blagaj-LT";
let dropdown;

let dimensions = [
  "Culture & Society",
  "Security",
  "Rights & Dignity",
  "Armed Actors",
  "Dealing with the Past",
  "Economic Activity & Livelihoods"
];

let dimCenters = [];
let indicators = [];

let hoveredIndicator = null;


/**
 * Lädt alle Datensätze (CSV als String-Array wegen Semicolon-Trennung) in das Objekt `datasets`.
 * 
 * @global {Object} datasets - Objekt, das Key = Dataset-Name und Value = Array der CSV-Zeilen enthält.
 */
function preload() {

  datasets["Blagaj-LT"] = loadStrings("../data/indicators-dimensions-blagajLT.csv");
  datasets["Blagaj-P"] = loadStrings("../data/indicators-dimensions-blagajP.csv");
  datasets["Podhum-LT"] = loadStrings("../data/indicators-dimensions-podhumLT.csv");
  datasets["Podhum-P"] = loadStrings("../data/indicators-dimensions-podhumP.csv");
  datasets["Bulivar-Cernica-LT"] = loadStrings("../data/indicators-dimensions-bulivarCernicaLT.csv");
  datasets["Bulivar-Cernica-P"] = loadStrings("../data/indicators-dimensions-bulivarCernicaP.csv");
  datasets["Zalik-LT"] = loadStrings("../data/indicators-dimensions-ZalikLT.csv");
  datasets["Zalik-P"] = loadStrings("../data/indicators-dimensions-ZalikP.csv");
}

/**
 * Initialisiert Canvas, Dimensionen (als Kreispunkte) und Dropdown zum Wechseln von Datasets.
 * 
 * @global {Array} dimCenters - Enthält die Positionen der Dimensionen im Kreis
 * @global {Array} indicators - Enthält alle Indikatoren des aktuellen Datasets
 * @global {Object} datasets - Alle geladenen Rohdaten
 * @global {String} currentDataset - Der aktuell gewählte Datensatz
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");

  // Dimensionen kreisförmig platzieren
  for (let d = 0; d < dimensions.length; d++) {
    let angle = TWO_PI * d / dimensions.length;
    dimCenters.push({
      name: dimensions[d],
      x: width / 2 + cos(angle) * 300,
      y: height / 2 + sin(angle) * 300
    });
  }


  prepareData();


  // Dropdown erstellen
  dropdown = createSelect();
  dropdown.position(10, 10);
  // Alle Keys aus dem Objekt holen und als Option einfügen
  Object.keys(datasets).forEach(key => {
    dropdown.option(key);
  });
  dropdown.selected(currentDataset);
  dropdown.changed(() => {
    currentDataset = dropdown.value();
    prepareData();

  });




}

/**
 * p5.js draw-Loop. Aktualisiert Positionen der Indikatoren (Kraftfeld-Layout),
 * zeichnet Dimensionen, Indikatoren und ruft die InfoBox bei Hover auf.
 * 
 * @global {Array} dimCenters - Positionen der Dimensionen
 * @global {Array} indicators - Liste aller Indikatoren mit Position, Velocity, Acceleration
 * @global {Object|null} hoveredIndicator - aktuell gehighlighteter Indikator oder null
 */
function draw() {
  background(20, 20, 30);

  // Zeichne Dimensionen
  for (let d of dimCenters) {
    fill(255);
    noStroke();
    ellipse(d.x, d.y, 40, 40);
    textAlign(CENTER);
    textSize(14);
    fill(200);
    text(d.name, d.x, d.y - 30);
  }

  hoveredIndicator = null;




  // Update + Zeichne Indikatoren
  for (let ind of indicators) {
    let totalVotes = ind.votes.total;
    let r = map(totalVotes, 0, 10, 5, 25);
    // Hover-Check
    if (dist(mouseX, mouseY, ind.pos.x, ind.pos.y) < r) {
      hoveredIndicator = ind;
      fill(255, 200, 100, 220);
    } else {
      fill(100, 180, 255, 150);
    }
    //hoveredIndicator nicht bewegen 
    if (ind !== hoveredIndicator) {
      ind.acc.mult(0);

      // --- Abstoßung zwischen Indikatoren ---
      for (let other of indicators) {
        if (other !== ind) {
          let dir = p5.Vector.sub(ind.pos, other.pos);
          let distSq = dir.magSq();
          let minDist = 80; // Mindestabstand in Pixel
          if (distSq < minDist * minDist && distSq > 0) {
            dir.normalize();
            let force = 0.07 / sqrt(distSq); // Stärke der Abstoßung
            dir.mult(force);
            ind.acc.add(dir);
          }
        }
      }

      // --- Anziehung zu Dimensionen ---
      let a, b;

      if (ind.dimA > -1) {
        a = dimCenters[ind.dimA];
      } else {
        a = { x: width / 2, y: height / 2 }
      }
      if (ind.dimB > -1) {
        b = dimCenters[ind.dimB];
      } else {
        b = { x: width / 2, y: height / 2 }
      }


      //console.log(a,b)
      let forceA = createVector(a.x - ind.pos.x, a.y - ind.pos.y).mult(0.001);
      let forceB = createVector(b.x - ind.pos.x, b.y - ind.pos.y).mult(0.001);
      ind.acc.add(forceA);
      ind.acc.add(forceB);


      ind.vel.add(ind.acc);
      ind.vel.limit(1);
      ind.pos.add(ind.vel);

    }





    noStroke();
    ellipse(ind.pos.x, ind.pos.y, r, r);


  }

  drawInfoBox();

}

/**
 * Bereitet das aktuell gewählte Dataset auf.
 * Wandelt die CSV-Zeilen in Indicator-Objekte mit Votes, Dimensionen und Startpositionen um.
 * 
 * @global {Array} indicators - Ergebnisliste der Indikatoren
 * @global {Object} datasets - Alle geladenen CSV-Daten
 * @global {String} currentDataset - Aktuell ausgewählter Datensatz
 */
function prepareData() {
  indicators = [];
  let table = datasets[currentDataset];

  for (let i = 1; i < table.length; i++) { // bei 1 beginnen, um Kopfzeile zu ignorieren
    let cols = table[i].split(";");
    //print(cols); // Array aller Spaltenwerte
    let name = cols[0];
    let male = int(cols[3]) > 0 ? int(cols[3]) : 0;
    let female = int(cols[4]) > 0 ? int(cols[4]) : 0;
    let youth = int(cols[5]) > 0 ? int(cols[5]) : 0;
    let total = int(cols[6]) > 0 ? int(cols[6]) : 0;
    let d1Name = cols[7];
    let d2Name = cols[8];

    let d1 = -1;
    let d2 = -1;

    if (d1Name != '') {
      d1 = dimensions.indexOf(d1Name);
    }
    if (d2Name != '') {
      d2 = dimensions.indexOf(d2Name);
    }

    indicators.push({
      name: name,
      votes: { male, female, youth, total },
      dimA: d1,
      dimB: d2,
      pos: createVector(random(width), random(height)),
      vel: createVector(0, 0),
      acc: createVector(0, 0)
    })



  }

}

/**
 * Zeichnet die Info-Box für den aktuell gehighlighteten Indikator.
 * Zeigt Name und Votes (M/F/Y/Total).
 * 
 * @global {Object|null} hoveredIndicator - der aktuell unter Maus befindliche Indikator
 */
function drawInfoBox() {
  // Hover-Info Box
  if (hoveredIndicator) {
    noStroke();
    let ind = hoveredIndicator;
    let lines = countLines(ind.name, 250);
    fill(50, 220);
    rect(mouseX + 10, mouseY, 255, (4 + lines) * 15 + 5, 8);
    fill(255);
    textAlign(LEFT, TOP);
    textWrap(WORD);
    textSize(12);
    push();
    translate(0, 5);
    text(ind.name, mouseX + 15, mouseY, 250);
    text("Male: " + ind.votes.male, mouseX + 15, mouseY + lines * 15);
    text("Female: " + ind.votes.female, mouseX + 15, mouseY + (lines + 1) * 15);
    text("Youth: " + ind.votes.youth, mouseX + 15, mouseY + (lines + 2) * 15);
    text("Total: " + ind.votes.total, mouseX + 15, mouseY + + (lines + 3) * 15);
    pop();
  }
}

/**
 * Hilfsfunktion: zählt die benötigten Zeilen für einen Text bei gegebener Maximalbreite.
 * 
 * @param {String} txt - der Text, der auf Zeilen geprüft werden soll
 * @param {Number} maxWidth - maximale Breite in Pixeln
 * @returns {Number} Anzahl der Zeilen
 */
function countLines(txt, maxWidth) {
  let words = splitTokens(txt, " ");
  let currentLine = "";
  let lines = 1;

  for (let i = 0; i < words.length; i++) {
    let testLine = currentLine + (currentLine === "" ? "" : " ") + words[i];
    let testWidth = textWidth(testLine);

    if (testWidth > maxWidth) {
      // Neue Zeile anfangen
      lines++;
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  return lines;
}
