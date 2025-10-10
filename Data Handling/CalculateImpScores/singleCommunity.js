let data;
let community = "blagajLT";

function preload() {
  // Lädt die JSON-Datei bevor das Programm startet
  data = loadJSON("data/combined-data_masterfile.json");
}

function setup() {
  createCanvas(400, 400);

  // Wandelt das JSON-Objekt in ein Array um, damit wir es durchlaufen können
  data = Object.values(data);
  console.log("Loaded data:", data);

  // Filtert die Daten: Nur Einträge wo Community gleich "blagajLT" ist
  const filteredData = data.filter((item) => item.Community === "blagajLT");

  // Zählt wie viele Indikatoren wir haben
  let totalIndicators = filteredData.length;

  // Berechnet die Gesamtzahl aller Votes
  // reduce() nimmt alle T-Werte und addiert sie zusammen
  // sum ist der bisherige Gesamtwert, item.T der aktuelle Wert
  // Die 0 am Ende ist der Startwert
  const totalVotes = filteredData.reduce((sum, item) => sum + item.T, 0);

  console.log(filteredData, totalIndicators, totalVotes);

  // Berechnet für jeden Eintrag den "Importance Score"
  for (item of filteredData) {
    // Formel: (T * Anzahl Indikatoren) / Gesamtzahl Votes
    const impScore = parseFloat(((item.T * totalIndicators) / totalVotes).toFixed(6));
    console.log(item["Imp score"], impScore);
  }

  // ===== TEIL 2: Berechnung der Code-Summen =====

  // Zwei leere Objekte um Daten zu sammeln:
  // codeSums speichert die Summe aller T-Werte pro Code
  // codeCounts speichert wie oft jeder Code vorkommt
  const codeSums = {};
  const codeCounts = {};

  // Durchläuft alle gefilterten Daten
  filteredData.forEach((item) => {
    const code1 = item["Code 1 "];
    const code2 = item["Code 2"];

    // Prüft ob Code 1 eine gültige Zahl größer als 0 ist
    if (typeof code1 === "number" && code1 > 0) {
      // Addiert T-Wert zur Summe dieses Codes
      // Falls der Code noch nicht existiert, starte bei 0
      codeSums[code1] = (codeSums[code1] || 0) + item.T;

      // Zählt wie oft dieser Code vorkommt
      codeCounts[code1] = (codeCounts[code1] || 0) + 1;
    }

    // Das Gleiche für Code 2
    if (typeof code2 === "number" && code2 > 0) {
      codeSums[code2] = (codeSums[code2] || 0) + item.T;
      codeCounts[code2] = (codeCounts[code2] || 0) + 1;
    }
  });

  console.log("Code sums:", codeSums);
  console.log("Code counts:", codeCounts);

  // ===== TEIL 3: Berechnung des finalen Scores =====

  filteredData.forEach((item) => {
    const code1Value = item["Code 1 "];

    // Holt die vorher berechneten Werte aus den Objekten
    const sumVotesInCode1 = codeSums[code1Value];
    const countIndicatorsWithCode1 = codeCounts[code1Value];

    // Berechnet den finalen Score
    // Formel: T / (Summe aller Votes in diesem Code) / (Anzahl Indikatoren mit diesem Code / Gesamtzahl Indikatoren)
    const score = item.T / sumVotesInCode1 / (countIndicatorsWithCode1 / filteredData.length);

    console.log(`Item #${item["#"]}: ${score.toFixed(6)}`, item["Imp-Cat1"]);
  });
}

function draw() {
  background(220);
}
