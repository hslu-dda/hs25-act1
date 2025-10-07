let data; // Will hold our JSON data
let input;

let documentEmbeddings = [];
let searchResults = [];
let isSearching = false;

function preload() {
  // Load our JSON file with all the data
  data = loadJSON("data/data_with_embeddings_Snowflake.json");
}

function setup() {
  let canvas = createCanvas(500, 50);
  canvas.parent("canvasContainer");
  data = Object.values(data);
  console.log("Loaded data:", data);

  // Create input field
  input = createInput();
  input.parent("panel");
  input.attribute("placeholder", "write something about peace");

  // Listen for Enter key
  input.changed(handleSubmit);
}

function draw() {
  background(220);
  for (let i = 0; i < searchResults.length; i++) {}
}

function handleSubmit() {
  let value = input.value();
  searchDocuments(value);
}

function cosineSimilarity(vecA, vecB) {
  // Safety checks
  if (!vecA || !vecB) {
    console.error("One of the vectors is undefined");
    return 0;
  }

  if (vecA.length !== vecB.length) {
    console.error(`Vector length mismatch: vecA=${vecA.length}, vecB=${vecB.length}`);
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

async function getEmbedding(text) {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "snowflake-arctic-embed",
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Debug: see what the API actually returns
    console.log("API response:", result);

    // The embedding might be at result.embedding or result.embeddings[0] or just result
    if (result.embedding && Array.isArray(result.embedding)) {
      return result.embedding;
    } else if (result.embeddings && Array.isArray(result.embeddings)) {
      return result.embeddings[0];
    } else if (Array.isArray(result)) {
      return result;
    } else {
      console.error("Unexpected API response structure:", result);
      throw new Error("Could not find embedding in API response");
    }
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}
async function searchDocuments(searchQuery) {
  if (data.length === 0) {
    console.log("❌ No data loaded");
    return;
  }

  if (isSearching) {
    console.log("⚠️ Already searching...");
    return;
  }

  if (!searchQuery) {
    console.log("Search cancelled");
    return;
  }

  isSearching = true;
  console.log(`🔍 Searching for: "${searchQuery}"`);

  try {
    // Get embedding for the search query
    const queryEmbedding = await getEmbedding(searchQuery);

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      console.error("❌ Invalid embedding returned from getEmbedding");
      isSearching = false;
      return;
    }

    // Calculate similarity with each document
    let results = [];
    let skipped = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // Skip items without valid embeddings
      if (!item.embedding || !Array.isArray(item.embedding) || item.embedding.length === 0) {
        skipped++;
        continue;
      }

      const similarity = cosineSimilarity(queryEmbedding, item.embedding);

      // Only add if similarity calculation was successful (not 0 from error)
      if (similarity !== 0 || (similarity === 0 && item.embedding.length === queryEmbedding.length)) {
        results.push({
          indicator: item["Indicator English"],
          similarity: similarity,
          focusGroup: item["Focus Group"],
          focusGroup: item["Focus Group"],
          concept: item.Concept,
          community: item.Community,
          dimension1: item["Dimension 1"],
          subcat1: item["Subcat 1 name"],
        });
      }
    }

    if (skipped > 0) {
      console.log(`⚠️ Skipped ${skipped} items without embeddings`);
    }

    if (results.length === 0) {
      console.log("❌ No valid results found");
      isSearching = false;
      return;
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    // Take top 3 results
    searchResults = results.slice(0, 10);

    appendItems(searchResults);

    console.log("📋 Top 3 Results:");
    for (let i = 0; i < searchResults.length; i++) {
      console.log(`${i + 1}. (${searchResults[i].similarity.toFixed(3)}) "${searchResults[i].indicator}"`);
    }
  } catch (error) {
    console.error("Error searching:", error);
  }

  isSearching = false;
}

function appendItems(inputArray) {
  console.log("appendItems", inputArray);
  const container = select("#contentContainer");
  container.html("");
  for (item of inputArray) {
    let newDiv = createDiv();
    newDiv.parent(container);
    newDiv.class("item");

    newDiv.html(`
      <h3> ${item.indicator || "No Title"}</h3>
      <p>${item.community || "N/A"}</p>
      <p>${item.dimension1 || "N/A"}</p>
      <p>${item.subcat1 || "N/A"}</p>
      `);
  }
}
