// Globale Variablen für Daten
let dataAsync = {}; // Objekt für asynchron geladene Daten
let dataArray = []; // Array für alle kombinierten Daten
let sortedDataArray; // Array für sortierte Daten

// Dateipfade für CSV-Dateien
const files = {
  bijeliBrijegLT: "singleCSV/Bijeli_Brijeg_LT.csv",
  bijeliBrijegP: "singleCSV/Bijeli_Brijeg_P.csv",
  blagajLT: "singleCSV/Blagaj_LT.csv",
  blagajP: "singleCSV/Blagaj_P.csv",
  cernicaLT: "singleCSV/Cernica_LT.csv",
  cernicaP: "singleCSV/Cernica_P.csv",
  cimLT: "singleCSV/Cim_LT.csv",
  cimP: "singleCSV/Cim_P.csv",
  podhumLT: "singleCSV/Podhum_LT.csv",
  podhumP: "singleCSV/Podhum_P.csv",
  potociLT: "singleCSV/Potoci_LT.csv",
  potociP: "singleCSV/Potoci_P.csv",
  zalikLT: "singleCSV/Zalik_LT.csv",
  zalikP: "singleCSV/Zalik_P.csv",
};

// Funktion die vor setup() ausgeführt wird - lädt alle CSV-Dateien
function preload() {
  // Gehe durch alle Dateien und lade sie
  Object.keys(files).forEach((key) => {
    const value = files[key];
    console.log(`Name: ${key}, Pfad: ${value}`);
    // Lade CSV-Datei mit der d3 library
    dataAsync[key] = loadD3CSV(`${files[key]}`, ";");
  });
}

function setup() {
  console.log(dataAsync);
  // Verbinde alle Daten aus verschiedenen Communities zu einem Array
  // Füge jedem Datenobjekt die Community als zusätzliches Feld hinzu
  dataArray = Object.keys(dataAsync).flatMap((community) =>
    dataAsync[community].map((obj) => ({
      ...obj, // Kopiere alle existierenden Eigenschaften
      Community: community, // Füge Community-Name hinzu
    }))
  );
  console.log("Verbundene Daten:", dataArray);

  const keyReplacements = [
    ["Total", "T"],
    ["Indicator_Eng", "Indicator English"],
    ["Focus_Group", "Focus Group"],
  ];

  dataArray.forEach((item) => {
    // Loop through each replacement pair
    keyReplacements.forEach(([oldKey, newKey]) => {
      if (oldKey in item) {
        item[newKey] = item[oldKey];
        delete item[oldKey];
      }
    });
  });

  console.log("Bereinigte Daten:", dataArray);

  // Sortiere die Daten
  sortedDataArray = sortData(dataArray);
  console.log("Sortierte Daten:", sortedDataArray);

  // Erstelle Canvas für die Visualisierung
  createCanvas(5000, 1000);
}

// Zeichenfunktion - wird kontinuierlich ausgeführt
function draw() {
  background(220); // Hellgrauer Hintergrund

  // Variablen für das Layout
  let previousDimension = null;
  let previousSubcategory = null;
  let previousCommunity = "";
  let x = 20; // X-Position
  let y = 20; // Y-Position
  let rectx = 20; // X-Position für Rechtecke

  textSize(10); // Textgröße festlegen

  // Gehe durch alle sortierten Daten
  for (let item of sortedDataArray) {
    // Neue Community? -> Neue Spalte beginnen
    if (item["Community"] !== previousCommunity) {
      y = 20; // Y-Position zurücksetzen
      line(x - 10, 0, x - 10, height); // Trennlinie zeichnen
      text(item["Community"], x, y); // Community-Name schreiben
      previousCommunity = item["Community"];
      y += 20;
    }

    // Neue Dimension? -> Neuen Abschnitt beginnen
    const currentDimension = item["Dimension 1"] ?? "";
    if (currentDimension !== previousDimension) {
      if (previousDimension !== null) {
        x += 80;
        y = 40;
      }

      // Schreibe Dimension-Namen vertikal
      push();
      translate(x, y);
      rotate(-PI / 2);
      let textLength = textWidth(currentDimension);
      text(currentDimension, -textLength, 0);
      pop();

      previousDimension = currentDimension;
      previousSubcategory = null;
      x += 5;
      y += 20;
    }

    // Neue Subkategorie?
    if (item["Subcat 1 name"] !== previousSubcategory) {
      text(item["Subcat 1 name"], x, y);
      previousSubcategory = item["Subcat 1 name"];
      y += 10;
      rectx = x;
    }

    // Zeichne kleines Rechteck für jeden Datenpunkt
    rect(rectx, y - 20, 10, 10);
    rectx += 10;
  }

  noLoop(); // Stoppe das kontinuierliche Zeichnen
}

// Funktion zum Sortieren der Daten
function sortData(inputData) {
  // Erstelle Kopie des Arrays und sortiere sie
  return [...inputData].sort((a, b) => {
    // Extrahiere Vergleichswerte (mit Fallback auf leeren String)
    let locationA = a["Community"] || "";
    let locationB = b["Community"] || "";
    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";
    let subdimensionA = a["Subcat 1 name"] || "";
    let subdimensionB = b["Subcat 1 name"] || "";

    // Vergleiche die Werte alphabetisch
    let locationComparison = locationA.localeCompare(locationB);
    let dimComparison = dimensionA.localeCompare(dimensionB);
    let subdimComparison = subdimensionA.localeCompare(subdimensionB);

    // Sortierreihenfolge: Erst Location, dann Dimension, dann Subdimension
    if (locationComparison === 0) {
      // Gleiche Location?
      if (dimComparison === 0) {
        // Gleiche Dimension?
        return subdimComparison; // Sortiere nach Subdimension
      }
      return dimComparison; // Sortiere nach Dimension
    }
    return locationComparison; // Sortiere nach Location
  });
}

function keyPressed() {
  // Speichere Daten als JSON-Datei wenn 's' gedrückt wird
  if (key === "s") {
    saveJSON(dataArray, "combined-data.json");
  }
}
