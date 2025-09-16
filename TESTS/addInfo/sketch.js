let rawData; // das komplette JSON
let codesHierarchy;


/**
 * Lädt alle Datensets aus einem JSON
 * loadJSON gibt ein Objekt zurück rawData
 */
function preload() {

  //loadJSON gibt ein Objekt zurück
  rawData = loadJSON("../../data/combined-data.json");
  codesHierarchy = loadJSON("../../data/tree_combined.json")
}


function setup() {
  createCanvas(400, 400);

  let rows = Object.values(rawData);
  
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let d1 = findDimensionForCode(row["Code 1"]);
    let d2 = findDimensionForCode(row["Code 2"]);
    let Impscores = scores(row, { "d1": d1, "d2": d2 });

    row.Dim1 = d1;
    row.Dim2 = d2;
    row.Scores = Impscores;
    
  }

   console.log(rawData); // rawData ist jetzt angereichert

   saveJSON(rawData, 'mostar-augmented.json')
}


/**
 * Hilfsfunktion: findet Dimension aus Code 1, bzw. Code 2
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
  const d1 = findDimensionForCode(row["Code 1"]);
  const d2 = findDimensionForCode(row["Code 2"]);
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