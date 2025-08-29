// Heatmap-Skizze für Indikatoren × Dimensionen
// Jeder Indikator gehört zu zwei Dimensionen (z. B. „Integration and acceptance“ → Culture & Society und Rights & Dignity). (Spalte S, T )
// Die Votes (z. B. Male: 1, Female: 1, Youth: 3) beziehen sich auf den Indikator insgesamt, nicht separat pro Dimension.

let datasets = {};
let currentDataset = "Blagaj-LT";
let dropdown;

let dimensions = ["Culture & Society", "Security", "Rights & Dignity", "Armed Actors", "Dealing with the Past", "Economic Activity & Livelihoods"];
let indicators = [];     // Array von Daten-Objekten {name:s, male: n, female: n, youth: n, total:n,  dim: [n, n]}
let hoveredIndicator = null;
let maxTotal = 0;
let colorMin, colorMax;

let layoutBorder = 50;
let cellW, cellH;
let beschriftungBreite = 180;



function preload() {
  //loadStrings weil .csv semicolon als Trennzeichen hat
  //table = loadStrings("../data/indicators-dimensions-blagajLT.csv");
  datasets["Blagaj-LT"] = loadStrings("../data/indicators-dimensions-blagajLT.csv");
  datasets["Blagaj-P"] = loadStrings("../data/indicators-dimensions-blagajP.csv");
  datasets["Podhum-LT"] = loadStrings("../data/indicators-dimensions-podhumLT.csv");
  datasets["Podhum-P"] = loadStrings("../data/indicators-dimensions-podhumP.csv"); 
  datasets["Bulivar-Cernica-LT"] = loadStrings("../data/indicators-dimensions-bulivarCernicaLT.csv");
  datasets["Bulivar-Cernica-P"] = loadStrings("../data/indicators-dimensions-bulivarCernicaP.csv");
  datasets["Zalik-LT"] = loadStrings("../data/indicators-dimensions-ZalikLT.csv");
  datasets["Zalik-P"] = loadStrings("../data/indicators-dimensions-ZalikP.csv");
}


function setup() {
  createCanvas(windowWidth, windowHeight * 2);

  prepareData();
  prepareLayout();

  // Dropdown erstellen
  dropdown = createSelect();
  dropdown.position(layoutBorder, 10);
  // Alle Keys aus dem Objekt holen und als Option einfügen
  Object.keys(datasets).forEach(key => {
    dropdown.option(key);
  });
  dropdown.selected(currentDataset);
  dropdown.changed(() => {
    currentDataset = dropdown.value();
    prepareData();
    prepareLayout();
  });



  colorMin = color(0, 100, 255, 200);
  colorMax = color(255, 100, 10, 200);




}

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

function prepareData() {
  maxTotal = 0;
  indicators = [];
  let table = datasets[currentDataset];
  //Daten aufbereiten
  for (let i = 1; i < table.length; i++) {
    let cols = table[i].split(";");
    let name = cols[0];
    let male = int(cols[3]) > 0 ? int(cols[3]) : 0;
    let female = int(cols[4]) > 0 ? int(cols[4]) : 0;
    let youth = int(cols[5]) > 0 ? int(cols[5]) : 0;
    let total = int(cols[6]) > 0 ? int(cols[6]) : 0;
    let d1Name = cols[7];
    let d2Name = cols[8];

    //maximales Total Zustimmung über alle Indikatoren
    if (total > maxTotal) {
      maxTotal = total;
    }

    //Dimensionen als index im dimensions Array 
    let d1 = -1;
    let d2 = -1;

    if (d1Name != '') {
      d1 = dimensions.indexOf(d1Name);
    }
    if (d2Name != '') {
      d2 = dimensions.indexOf(d2Name);
    }


    // indicators mit Dimensionen
    indicators.push({
      name: name,
      male: male,
      female: female,
      youth: youth,
      total: total,
      dim: [d1, d2]
    });

  }
}

function prepareLayout() {
  //layout
  cellW = (width - 2 * layoutBorder - beschriftungBreite) / dimensions.length;
  cellH = (height - 2 * layoutBorder) / indicators.length;
}

function drawHeatmap() {
  hoveredIndicator = null;

  // Heatmap zeichnen
  for (let i = 0; i < indicators.length; i++) {
    // Label für Indikator (Y-Achse)
    textAlign(RIGHT, CENTER);
    textSize(10);
    fill(0);
    text(indicators[i].name.substring(0, 30) + " ... ", beschriftungBreite, i * cellH + cellH / 2);


    for (let d = 0; d < dimensions.length; d++) {
      // Nur dann einfärben, wenn diese Dimension zum Indikator gehört
      if (indicators[i].dim.includes(d)) {
        noStroke();
        //Hover auf eingefärbten Zellen checken 
        if (mouseX > beschriftungBreite + layoutBorder + d * cellW && mouseX < beschriftungBreite + layoutBorder + (d + 1) * cellW && mouseY > layoutBorder + i * cellH && mouseY < layoutBorder + (i + 1) * cellH) {
          hoveredIndicator = indicators[i];
          fill(0, 220);
        } else {
          let l = map(indicators[i].total, 0, maxTotal, 0, 1); // 0–maxTotal Stimmen → Farbskala
          let c = lerpColor(colorMin, colorMax, l)
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
    text("Male: " + ind.male, mouseX + 15, mouseY + lines * 15);
    text("Female: " + ind.female, mouseX + 15, mouseY + (lines + 1) * 15);
    text("Youth: " + ind.youth, mouseX + 15, mouseY + (lines + 2) * 15);
    text("Total: " + ind.total, mouseX + 15, mouseY + + (lines + 3) * 15);
    pop();
  }
}
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
