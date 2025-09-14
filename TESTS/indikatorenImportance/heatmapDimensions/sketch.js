/**
 * Heatmap-Skizze für Indikatoren × Dimensionen
 * Jeder Indikator gehört zu zwei Dimensionen (Spalten S, T im Original Excel).
 * Importance Scores werden pro Kategorie (Imp_Cat1,Imp_Cat2) auf die beiden Dimensionen übertragen
 */

let rawData; // das komplette JSON

let currentDataset = "zalikLT";
let currentGroup = "total";

let dropdown;


let dimensions = new Set();
let hoveredIndicator = null;
let currentMax = 0;
let colorMin, colorMax;

let layoutBorder = 50;
let cellW, cellH;
let beschriftungBreite = 180;

let codesHierarchy;

/**
 * Lädt alle Datensets aus einem JSON
 * loadJSON gibt ein Objekt zurück rawData
 */
function preload() {

  //loadJSON gibt ein Objekt zurück
  rawData = loadJSON("../data/combined-data.json");
  codesHierarchy = loadJSON("../data/tree_combined.json")
}

/**
 * Initialisiert das Canvas, filtert die Daten, rechnet die Zellbreiten und baut das Dropdown-Menü.
 */
function setup() {
  createCanvas(windowWidth, windowHeight * 2);
  //console.log(codesHierarchy)
  //Dimensionen 
  for (let key of Object.entries(codesHierarchy)) {
    dimensions.add(key[0]);

  }

  dimensions = [...dimensions];

  //console.log(dimensions)
  prepareLayout();
  // Dropdown Datensets erstellen
  dropdown = createSelect();
  dropdown.position(layoutBorder, 10);

  let rows = Object.values(rawData);
  //maximales Gewicht der Importances Scores im aktuellen Datensatz auf Kategorie bezogen
  let cat1Max = Math.max(...rows.map(r => r["Imp-Cat1"]));
  let cat2Max = Math.max(...rows.map(r => r["Imp-Cat2"]));
  currentMax = Math.max(cat1Max, cat2Max);

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

  //noLoop()
}




/**
 * Berechnet den Importance-Wert für eine Dimension, basierend auf den beiden Kategorien eines Indikators.
 * Nutzt Imp_Cat1 und Imp_Cat2, wenn vorhanden.
 *
 * @param {Object} row - Eine Zeile aus dem Datensatz (enthält Code_1, Code_2, Imp_Cat1, Imp_Cat2 usw.)
 * @param {Objekt} Dimensionen
 * @return {Object} Objekt mit Dimension(en) und deren Importance Score
 */
function scores(row, dimensions) {
  // Rohwerte für Kategorien holen
  const val1 = float(row["Imp-Cat1"]) || 0;
  const val2 = float(row["Imp-Cat2"]) || 0;



  // Dimensionen bestimmen
  const d1 = findDimensionForCode(row.Code_1);
  const d2 = findDimensionForCode(row.Code_2);
  //console.log("from groupValue"+ d1, d2)

  if (dimensions.d1 && dimensions.d2) {
    if (dimensions.d1.localeCompare(dimensions.d2) == 0) {
      // beide Kategorien gehören zur gleichen Dimension
      const avg = (val1 + val2) / 2 || 0; // fallback: wenn Cat-Werte fehlen, nimm Indicator-Wert
      return { "d1": avg.toFixed(2), "d2": avg.toFixed(2) };
    } else {
      // zwei verschiedene Dimensionen → jeder bekommt seinen Cat-Wert
      return { "d1": val1.toFixed(2), "d2": val2.toFixed(2) };
    }
  }

  // Fallback: falls nur eine Dimension gefunden wird
  if (d1) return { "d1": val1.toFixed(2) || 0 };
  if (d2) return { "d2": val2.toFixed(2) || 0 };

  // wenn gar nichts passt, gib den Indicator-Wert zurück
  return { "unknown": 0 };
}


/**
 * Berechnet die Layout-Parameter für Heatmap-Zellen.
 *
 * @return {void}
 */
function prepareLayout() {
  let rows = Object.values(rawData).filter(r => r.Community === currentDataset);
  cellW = (width - 2 * layoutBorder - beschriftungBreite) / dimensions.length;
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
  let rows = Object.values(rawData).filter(r => r.Community === currentDataset);
  currentMax = 3;//fix gesetzt
  // Heatmap zeichnen
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let name = row["Indicator English"];
    let d1 = findDimensionForCode(row.Code_1);

    let d2 = findDimensionForCode(row.Code_2);
    //console.log(d1,d2)
    //d1=String(row["Dimension 1"]).trim();
    //d2=String(row["Dimension 2"]).trim();
    let Impscores = scores(row, { "d1": d1, "d2": d2 });


    // Label für Indikator
    textAlign(RIGHT, CENTER);
    textSize(10);
    fill(0);
    text(name.substring(0, 30) + " ... ", beschriftungBreite, i * cellH + cellH / 2);

    // Alle Spalten
    for (let d = 0; d < dimensions.length; d++) {
      if ([d1, d2].includes(dimensions[d])) {
        let val = 0;
        if (d1 !== null && d1 == dimensions[d]) {
          val = Impscores.d1;

        }
        if (d2 !== null && d2 == dimensions[d]) {
          val = Impscores.d2;

        }

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
        fill(0)
        textAlign(LEFT, BOTTOM);
        text(val, beschriftungBreite + d * cellW, i * cellH + cellH)
      } else {
        noFill();
        stroke(230);
        rect(beschriftungBreite + d * cellW, i * cellH, cellW, cellH);
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
    text("Female: " + (int(ind.F) || 0) + " – Importance Sc. Female " + float(ind["Imp-F"]), mouseX + 15, mouseY + (lines + 1) * 15);
    text("Youth: " + (int(ind.Y) || 0) + " – Importance Sc. Youth " + float(ind["Imp-Y"]), mouseX + 15, mouseY + (lines + 2) * 15);
    text("Total: " + (int(ind.T) || 0) + " – Importance Sc. " + float(ind["Imp score"]), mouseX + 15, mouseY + + (lines + 3) * 15);
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

/**
 * Hilfsfunktion: findet Dimension aus Code_1, bzw. Code_2
 * um Schreibvarianten zu vermeiden wird die Info aus dem tree_combined.json gelesen
 *
 * @param {number}  1.2, 22.1 usw.
 * @return {string} Bezeichnung Dimension
 */
function findDimensionForCode(num) {
  for (const [dimensionName, categories] of Object.entries(codesHierarchy)) {

    for (const cat of categories) {

      if (float(normalizeNum(cat.Num)) === float(normalizeNum(num))) {
        return dimensionName; // Kategorie selbst passt
      }
      if (cat.children) {
        if (findInChildren(num, cat.children)) {
          return dimensionName; // irgendein Child passt → Dimension zurück
        }
      }
    }
  }
  return null;
}
/**
 * Normalisiert eine Code-Nummer wie " 1.5 ", "1,5" oder "\uFEFF1.5"
 * -> "1.5"
 */
function normalizeNum(x) {
  if (x === null || x === undefined) return null;
  // in String, trim, BOM entfernen, Komma->Punkt ersetzen
  return String(x)
    .replace(/\uFEFF/g, '')   // BOM entfernen
    .replace(/\u00A0/g, ' ')  // NBSP -> regular space
    .trim()
    .replace(',', '.');       // falls Dezimalkomma vorkommen
}

function findInChildren(num, children) {
  for (const child of children) {
    if (float(normalizeNum(child.Num)) === float(normalizeNum(num))) {
      return true;
    }
    if (child.children && findInChildren(num, child.children)) {
      return true;
    }
  }
  return false;
}