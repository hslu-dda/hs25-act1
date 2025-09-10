/**
 * Heatmap-Skizze für Indikatoren × Dimensionen
 * Jeder Indikator gehört zu zwei Dimensionen (Spalten S, T im Original Excel).
 * Die Importance Scores (M, F, Y, T) beziehen sich auf den Indikator insgesamt,
 * nicht separat pro Dimension.
 */

let rawData; // das komplette JSON

let currentDataset = "blagajLT";
let currentGroup = "total";

let dropdown, groupdropdown;
let groups = { "T": "total", "M": "male", "F": "female", "Y": "youth" };


let dimensions = ["Culture & Society", "Security", "Rights & Dignity", "Armed Actors", "Dealing with the Past", "Economic Activity & Livelihoods"];

let hoveredIndicator = null;
let currentMax = 0;
let colorMin, colorMax;

let layoutBorder = 50;
let cellW, cellH;
let beschriftungBreite = 180;


/**
 * Lädt alle Datensets aus einem JSON
 * loadJSON gibt ein Objekt zurück rawData
 */
function preload() {

  //loadJSON gibt ein Objekt zurück
  rawData = loadJSON("../data/combined-data.json");

}

/**
 * Initialisiert das Canvas, filtert die Daten, rechnet die Zellbreiten und baut das Dropdown-Menü.
 */
function setup() {
  createCanvas(windowWidth, windowHeight * 2);

  prepareLayout();
  // Dropdown Datensets erstellen
  dropdown = createSelect();
  dropdown.position(layoutBorder, 10);
  let rows = Object.values(rawData);

  // Alle Locations extrahieren ["blagajLT", "blagajLT", "blagajP", "blagajP", "zalikLT", ...]
  // Ein Set ist in JavaScript eine Datenstruktur, die nur eindeutige Werte speichert
  let locations = [...new Set(rows.map(r => r.Community))];
  //Dropdown options kreieren
  locations.forEach(loc => dropdown.option(loc));
  dropdown.selected(currentDataset);
  dropdown.changed(() => {
    currentDataset = dropdown.value();
    prepareLayout();
  });


  //Dropdown soziale Gruppen
  groupdropdown = createSelect();
  groupdropdown.position(layoutBorder + 200, 10);
  Object.keys(groups).forEach(key => {
    groupdropdown.option(groups[key]);
  });
  groupdropdown.selected(currentGroup);
  groupdropdown.changed(() => {
    currentGroup = groupdropdown.value();
    //console.log(currentGroup)
    
  });


  colorMin = color(0, 100, 255, 200);
  colorMax = color(255, 100, 10, 200);




}

/**
 * Hauptzeichenschleife von p5.js
 * Zeichnet die Achsen, Heatmap und ggf. Infobox für Hover.
 */
function draw() {
  background(255);



  push();
  translate(layoutBorder, layoutBorder);

  // Labels für Dimensionen (X-Achse)
  fill(0);
  noStroke();
  textAlign(CENTER, BOTTOM);
  textSize(12);
  for (let d = 0; d < dimensions.length; d++) {
    text(dimensions[d], beschriftungBreite + d * cellW + cellW / 2, 0);
  }

  drawHeatmap()
  pop();

  drawInfoBox();
}

/**
 * Gibt die Maximum Importance Scores des aktuellen Sets – gefiltert nach Locatoin und sozialer Gruppe – zurück.
 * Filtert direkt aus rawData.
 *
 * @return {Array<Object>} Array von Indikatoren
 */
function getCurrentIndicators() {
  let rows = Object.values(rawData).filter(r => r.Community === currentDataset);

  // maximale Werte für aktuelle Gruppe berechnen
  currentMax = 0;
  rows.forEach(r => {
    let val = groupValue(r, currentGroup);
     if (val > currentMax) currentMax = val;
  });

  return rows;
}

/**
 * Holt den Importance Score einer sozialen Gruppe aus einem Indikator.
 *
 * @param {Object} row - Ein Datensatz/Indikator
 * @param {string} group - "male" | "female" | "youth" | "total"
 * @return {number} Stimmenanzahl
 */
function groupValue(row, group) {
  switch (group) {
    case "male": return float(row["Imp-M"]) || 0;
    case "female": return float(row["Imp-F"]) || 0;
    case "youth": return float(row["Imp-Y"]) || 0;
    default: return float(row["Imp score"]) || 0;
  }
}

/**
 * Berechnet die Layout-Parameter für Heatmap-Zellen.
 *
 * @return {void}
 */
function prepareLayout() {

  cellW = (width - 2 * layoutBorder - beschriftungBreite) / dimensions.length;
  let rows = getCurrentIndicators();
  cellH = (height - 2 * layoutBorder) / rows.length;

}

/**
 * Zeichnet die Heatmap:
 * - Zeilen = Indikatoren
 * - Spalten = Dimensionen
 * - Zellen werden eingefärbt je nach total votes
 * - Hover wird erkannt und gespeichert
 *
 * @return {void}
 */
function drawHeatmap() {
  hoveredIndicator = null;
  let rows = getCurrentIndicators();
  //console.log(rows)
  // Heatmap zeichnen
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let name = row["Indicator English"];
    let d1 = dimensions.indexOf(row["Dimension 1"]);
    let d2 = dimensions.indexOf(row["Dimension 2"]);
    let val = groupValue(row, currentGroup);

   if (val > 0) {
      // Label für Indikator
      textAlign(RIGHT, CENTER);
      textSize(10);
      fill(0);
      text(name.substring(0, 30) + " ... ", beschriftungBreite, i * cellH + cellH / 2);

      // Alle Spalten
      for (let d = 0; d < dimensions.length; d++) {
        if ([d1, d2].includes(d)) {
          noStroke();
          if (mouseX > beschriftungBreite + layoutBorder + d * cellW &&
            mouseX < beschriftungBreite + layoutBorder + (d + 1) * cellW &&
            mouseY > layoutBorder + i * cellH &&
            mouseY < layoutBorder + (i + 1) * cellH) {
            hoveredIndicator = { row, val };
            fill(0, 220);
          } else {
            let l = map(val, 0, currentMax, 0, 1);
            let c = lerpColor(colorMin, colorMax, l);
            fill(c);
          }
          rect(beschriftungBreite + d * cellW, i * cellH, cellW, cellH);
        } else {
          noFill();
          stroke(230);
          rect(beschriftungBreite + d * cellW, i * cellH, cellW, cellH);
        }
      }
    }
 }
}

/**
 * Zeichnet eine Infobox mit Detailinfos über dem aktuell gehoverten Indikator.
 *
 * @return {void}
 */
function drawInfoBox() {
  // Hover-Info Box
  if (hoveredIndicator) {
    noStroke();
    let ind = hoveredIndicator.row;
    let lines = countLines(ind["Indicator English"], 250);
    fill(50, 220);
    rect(mouseX + 10, mouseY, 255, (4 + lines) * 15 + 5, 8);
    fill(255);
    textAlign(LEFT, TOP);
    textWrap(WORD);
    textSize(12);
    push();
    translate(0, 5);
    text(ind["Indicator English"], mouseX + 15, mouseY, 250);
    text("Male: " + (int(ind.M) || 0) + " – Importance Sc. Male " + float(ind["Imp-M"]), mouseX + 15, mouseY + lines * 15);
    text("Female: " + (int(ind.F) || 0)+ " – Importance Sc. Female " + float(ind["Imp-F"]), mouseX + 15, mouseY + (lines + 1) * 15);
    text("Youth: " + (int(ind.Y) || 0)+ " – Importance Sc. Youth " + float(ind["Imp-Y"]), mouseX + 15, mouseY + (lines + 2) * 15);
    text("Total: " + (int(ind.T) || 0)+ " – Importance Sc. " + float(ind["Imp score"]), mouseX + 15, mouseY + + (lines + 3) * 15);
    pop();
  }
}

/**
 * Hilfsfunktion: zählt, wie viele Zeilen ein Text nach Wort-Wrapping benötigt.
 *
 * @param {string} txt - Der Text, der geprüft wird.
 * @param {number} maxWidth - Maximale Breite in Pixeln pro Zeile.
 * @return {number} Anzahl Zeilen, die der Text benötigt.
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
