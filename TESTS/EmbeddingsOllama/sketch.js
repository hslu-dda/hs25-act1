// ==============================================
// HOW TO USE THIS PROGRAM:
// ==============================================
// 1. Make sure Ollama is running on your computer
// 2. Run this sketch
// 3. Press 'E' to get embeddings for all data
// 4. Press 'S' to save the data with embeddings
// ==============================================

let data; // Will hold our JSON data

function preload() {
  // Load our JSON file with all the data
  data = loadJSON("data/combined-data_masterfile.json");
}

function setup() {
  createCanvas(400, 400);
  // Convert data object to an array so we can loop through it
  data = Object.values(data);
  // Print to console to see what we loaded
  console.log("Loaded data:", data);
}

function draw() {
  background(220); // Light gray background
}

// ==============================================
// GET EMBEDDING FOR ONE TEXT
// An "embedding" is a list of numbers that represents
// the meaning of text. Similar texts have similar numbers.
// ==============================================

async function getEmbedding(text) {
  try {
    // Send text to the local AI server (Ollama)
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "all-minilm", // The AI model we're using
        prompt: text, // The text to convert to numbers
      }),
    });
    // Check if the request worked
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    // Get the result and return the embedding
    const result = await response.json();
    return result.embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

// ==============================================
// GET EMBEDDINGS FOR ALL DATA ITEMS
// Goes through each item in our data and gets
// an embedding for its text
// ==============================================

async function addEmbeddingsToData() {
  console.log("Getting embeddings for all data items...");

  // Loop through each item in the data array
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    // Skip items that don't have text
    if (!item["Indicator English"] || item["Indicator English"].trim() === "") {
      console.warn(`Skipping item ${i} (no text found)`);
      continue;
    }

    try {
      // Get the embedding (list of numbers) for this text
      const embedding = await getEmbedding(item["Indicator English"]);
      // Save the embedding directly to this data item
      item.embedding = embedding;
      console.log(`✓ Added embedding to item ${i}`);
    } catch (error) {
      console.error(`✗ Error on item ${i}:`, error);
    }
  }
  console.log("✅ All embeddings added to data:", data);
}

// ==============================================
// KEY PRESSED - Runs when user presses a key
// ==============================================

async function keyPressed() {
  // Press 'E' to get embeddings for all data
  if (key === "e" || key === "E") {
    await addEmbeddingsToData();
  }

  // Press 'S' to save the data with embeddings to a file
  if (key === "s" || key === "S") {
    saveJSON(data, "data_with_embeddings.json");
    console.log("💾 Data saved to data_with_embeddings.json");
  }
}
