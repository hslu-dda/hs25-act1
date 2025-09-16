let rawData;

let dimensionSelect;
let currentDataset = "All";

function preload() {
  rawData = loadJSON("../../data/auszug-data.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let rows = Object.values(rawData); //
  let dimensions = [...new Set(rows.map(r => r["Dimension 1"]))];


  dimensionSelect = createSelect();
  dimensionSelect.position(10, 10);
  dimensionSelect.option("All");
  for (let i = 0; i < dimensions.length; i++) {
    dimensionSelect.option(dimensions[i]);
  }
  dimensionSelect.selected("All");

  dimensionSelect.changed(() => {
    currentDataset = dimensionSelect.value();
    drawTable();
  });




  //console.log(Object.entries(rawData));
  /*
  * `Object.keys(obj)` – gibt ein Array mit den keys zurück.
  * `Object.values(obj)` – gibt ein Array mit den values zurück.
  * `Object.entries(obj)` – gibt ein Array mit den [key, value] Paaren zurück.

  */


  //Filtern nach Location
  //Kurze Schreibweise
  let filtered = rows.filter(r => r.Community === "zalikLT");
  //console.log(filtered);

  //Lange Schreibweise
  /*
  let filtered = rows.filter(function(r) {
    return r.Community === "zalikLT";
  });
  */

  //Bloss gewisse Spalten auslesen
  //Kurze Schreibweise
  let selected = rows.map(r => r["Dimension 1"]);// r.Dimension 1 geht nicht, wegen dem Leerzeichen
  //console.log(selected);

  // Lange Schreibweise
  /*
  let selected = rows.map(function(r) {
    return r["Dimension 1"];
  });
  console.log(selected);
  */


  // Sortieren, z.Bsp. nach Dimension 1, Dimension 2
  //Kurze Schreibweise
  //let sorted = rows.sort((a, b) => a["Dimension 1"].localeCompare(b["Dimension 1"]));

  //console.log(sorted)
  // lange Schreibweise

  let sorted = rows.sort(function (a, b) {
    return b["Dimension 1"].localeCompare(a["Dimension 1"]);
  });

  //Eindeutige Werte extrahieren
  /*let unique = [...new Set(rows.map(r => r["Dimension 1"]))];
  console.log(unique);*/

  // Kombination als String speichern
  let unique = [...new Set(rows.map(r => `${r["Dimension 1"]}|${r["Dimension 2"]}`))];

  // Falls du die wieder als Objekte haben willst:
  unique = unique.map(str => {
    let [dim1, dim2] = str.split("|");
    return { dim1, dim2 };
  });

  console.log(unique);

  /* let sorted = rows.sort((a, b) => {
     // Erstes Kriterium: Dimension 1
     let cmp = a["Dimension 1"].localeCompare(b["Dimension 1"]);
     if (cmp !== 0  || a["Dimension 2"] ==null || b["Dimension 2"] == null || a["Dimension 2"] ==0 || b["Dimension 2"] == 0) {
       return cmp; // Wenn ungleich oder keine zweite Dimension, dieses Ergebnis zurückgeben
 
     }
     
     // Zweites Kriterium: Dimension 2
    return a["Dimension 2"].localeCompare(b["Dimension 2"]);
   });
 
   sorted.map(r => console.log(r["Dimension 1"], r["Dimension 2"]));
 
   */


  //Maximum Importance Score

  // mit Spread Operator in JavaScript → einzelne Werte ausbreiten

  const max = Math.max(...rows.map(r => r["Imp score"] || 0));
  //console.log("Max Importance Score: " + max);

  // Minimum Importance Score
  const min = Math.min(...rows.map(r => r["Imp score"] || Infinity));
  //console.log("Min Importance Score: " + min);

  drawTable();
}

let border = 10;//Rand um das ganze

function drawTable() {
  background(255)
  const colorMin = color(0, 100, 255, 200);
  const colorMax = color(255, 100, 10, 200);

  textAlign(LEFT, TOP);

  let rows = Object.values(rawData);
  //Filter nach Locations 
  let filtered;
  if (currentDataset !== "All") {
    filtered = rows.filter(function (r) {
      return r["Dimension 1"] === currentDataset;
    });
  } else {
    filtered = rows;
  }


  const max = Math.max(...filtered.map(r => r["Imp score"] || 0));
  //console.log("Max Importance Score: " + max);

  // Minimum Importance Score
  const min = Math.min(...filtered.map(r => r["Imp score"] || Infinity));



  let cellHeight = (height - 2 * border - 48) / rows.length;

  //Table Header 
  textSize(16)
  text("Indikator", border, border);
  text("Imp. Score", width / 2, border);
  text("Imp. Score Men", width / 2 + 100, border, 90);
  text("Imp. Score Women", width / 2 + 200, border, 90);
  text("Imp. Score Youth", width / 2 + 300, border, 90);

  textSize(12);
  noStroke();
  for (let i = 0; i < rows.length; i++) {

    if (filtered.includes(rows[i])) {
      push();
      translate(border, (i + 2) * cellHeight + border);
      fill(0)
      text(rows[i]["Indicator English"], 0, 0, width / 2 - 10);

      //Importance Score 
      push();
      translate(width / 2, 0);
      let score = float(rows[i]["Imp score"]);
      let val = map(score, min, max, 0, 1);
      let farbe = lerpColor(colorMin, colorMax, val);
      fill(farbe);
      rect(0, 0, cellHeight - 2, cellHeight - 2);
      fill(0)
      text(score.toFixed(2), 0, 0);

      //Importance Score Men
      push();
      translate(100, 0);
      score = float(rows[i]["Imp-M"]);
      val = map(score, min, max, 0, 1);
      farbe = lerpColor(colorMin, colorMax, val);
      fill(farbe);
      rect(0, 0, cellHeight - 2, cellHeight - 2);
      fill(0)
      text(score.toFixed(2), 0, 0);

      //Importance Score Women
      push();
      translate(100, 0);
      score = float(rows[i]["Imp-F"]);
      val = map(score, min, max, 0, 1);
      farbe = lerpColor(colorMin, colorMax, val);
      fill(farbe);
      rect(0, 0, cellHeight - 2, cellHeight - 2);
      fill(0)
      text(score.toFixed(2), 0, 0);

      //Importance Score Youth
      push();
      translate(100, 0);
      score = float(rows[i]["Imp-Y"]);
      val = map(score, min, max, 0, 1);
      farbe = lerpColor(colorMin, colorMax, val);
      fill(farbe);
      rect(0, 0, cellHeight - 2, cellHeight - 2);
      fill(0)
      text(score.toFixed(2), 0, 0);

      pop();
      pop();
      pop();
      pop()
      pop();

    }
  }

}