let dataArray = [];
let input;

function preload() {
  data = loadJSON("data/combined-data.json");
}

function setup() {
  let canvas = createCanvas(400, 400);
  noCanvas();
  canvas.parent("canvas-container");

  // Daten aus JSON-Objekt in Array umwandeln und sortieren
  dataArray = Object.values(data);
  dataArray = sortDataArray(dataArray);
  console.log("sorted Array", dataArray);

  // Initial alle Daten anzeigen (keine Filterung)
  filteredArray = dataArray;
  appendItems();

  // Sucheingabefeld erstellen und Event-Listener hinzufügen
  input = createInput();
  input.parent("panel");
  input.input(handleFilter);
}

function draw() {
  background(220);
}

function appendItems() {
  const container = document.querySelector(".contentContainer");

  // Alle vorhandenen Elemente entfernen vor dem Neuaufbau
  container.innerHTML = "";

  // Gefilterte Daten als HTML-Elemente hinzufügen
  for (let i = 0; i < filteredArray.length; i++) {
    let item = filteredArray[i];
    let newDiv = createDiv();
    newDiv.parent(container);
    newDiv.html(`
      <h3>${item["Indicator English"] || "No Title"}</h3>
      <p><strong>Community:</strong> ${item["Community"] || "N/A"}</p>
      <p><strong>Dimension:</strong> ${item["Dimension 1"] || "N/A"}</p>
      <p><strong>Subcategory:</strong> ${item["Subcat 1 name"] || "N/A"}</p>
    `);
    newDiv.class("item");
  }
}

function handleFilter() {
  let query = input.value().toLowerCase().trim();

  if (query === "") {
    // Leere Eingabe: alle Daten anzeigen
    filteredArray = dataArray;
  } else {
    // Suchbegriff in einzelne Wörter aufteilen
    let queryWords = query.split(/\s+/);

    // Nur Einträge behalten, die ALLE Suchbegriffe enthalten (Reihenfolge egal)
    filteredArray = dataArray.filter((item) => {
      let indicator = (item["Indicator English"] || "").toLowerCase();
      return queryWords.every((word) => indicator.includes(word));
    });
  }

  // Gefilterte Ergebnisse anzeigen
  appendItems();
}

function sortDataArray(arr) {
  // Daten hierarchisch sortieren: Community > Dimension > Subcategory
  return [...arr].sort((a, b) => {
    let communityA = a["Community"] || "";
    let communityB = b["Community"] || "";
    let dimensionA = a["Dimension 1"] || "";
    let dimensionB = b["Dimension 1"] || "";
    let subCatA = a["Subcat 1 name"] || "";
    let subCatB = b["Subcat 1 name"] || "";

    // Alphabetische Vergleiche für mehrstufige Sortierung
    let communityComparison = communityA.localeCompare(communityB);
    let dimensionComparison = dimensionA.localeCompare(dimensionB);
    let subCatComparison = subCatA.localeCompare(subCatB);

    // Hierarchische Sortierung: erst Community, dann Dimension, dann Subcategory
    if (communityComparison === 0) {
      if (dimensionComparison === 0) {
        return subCatComparison;
      }
      return dimensionComparison;
    }
    return communityComparison;
  });
}
