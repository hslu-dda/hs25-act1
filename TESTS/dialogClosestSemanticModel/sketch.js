let rawData; // das komplette JSON als Objekt
let data; //Daten als Array
let embeddings; // Array der Embeddings, parallel zu den Indikatoren
let indicators; // Texte

let currentIndex = 0; // Start-Indikator
let visited = [];

function preload() {
  // embeddings.json: [{text: "Jobs ...", embedding: [0.01, ...]}, ...]
  rawData = loadJSON("embeddings.json"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");
  textSize(16);

  data= Object.values(rawData);
  // Extrahiere Arrays
  indicators = data.map(d => d["Indicator English"]);
  embeddings = data.map(d => d.embedding);

  currentIndex = floor(random(indicators.length));

  visited.push(currentIndex);
}

function draw() {
  background(255);

  text("Aktueller Indikator:", 20, 40);
  text(indicators[currentIndex], 20, 70, width-40);

  text("Nächster Vorschlag:", 20, 140);
  let next = findNextClosest(currentIndex);
  if (next !== null) {
    text(indicators[next], 20, 170, width-40);
  }
}

// Taste: neuen nächsten Indikator wählen
function keyPressed() {
  let next = findNextClosest(currentIndex);
  if (next !== null) {
    currentIndex = next;
    visited.push(currentIndex);
  }
}

// Cosine Similarity
function cosineSim(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Finde nächsten noch nicht besuchten Indikator
function findNextClosest(index) {
  let bestSim = -1;
  let bestIdx = null;
  for (let i = 0; i < embeddings.length; i++) {
    if (i === index || visited.includes(i)) continue;
    let sim = cosineSim(embeddings[index], embeddings[i]);
    if (sim > bestSim) {
      bestSim = sim;
      bestIdx = i;
    }
  }
  return bestIdx;
}
