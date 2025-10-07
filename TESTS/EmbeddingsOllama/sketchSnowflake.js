// ==============================================
// SEARCH AND RETRIEVAL DEMO
// Using snowflake-arctic-embed model
// ==============================================

// ==============================================
// VARIABLES
// ==============================================

let documents = [
  "The cat sat on the mat and took a nap.",
  "Dogs are loyal and friendly pets that love to play.",
  "Python is a programming language used for data science.",
  "JavaScript is great for building interactive websites.",
  "Machine learning helps computers learn from data.",
  "The weather today is sunny and warm.",
  "Pizza is a delicious Italian food with cheese and toppings.",
  "Exercise is important for staying healthy and fit.",
  "Books are a great way to learn new things.",
  "Music can help you relax and feel better.",
];

let documentEmbeddings = []; // Store embeddings for all documents
let searchQuery = ""; // What the user is searching for
let searchResults = []; // The best matching documents
let isProcessing = false; // Are we currently getting embeddings?
let isSearching = false; // Are we currently searching?

// ==============================================
// SETUP
// ==============================================

function setup() {
  createCanvas(800, 600);
  textAlign(LEFT, TOP);

  console.log("📚 Documents loaded:", documents.length);
  console.log("Press 'E' to generate embeddings for all documents");
  console.log("Press 'S' to search (after embeddings are ready)");
}

// ==============================================
// DRAW - Show instructions and results
// ==============================================

function draw() {
  background(240);
  fill(0);
  textSize(16);

  // Title
  textSize(20);
  text("🔍 Search Demo with Snowflake Arctic Embed", 20, 20);

  // Instructions
  textSize(14);
  text("Press 'E' to generate document embeddings", 20, 60);
  text("Press 'S' to search after embeddings are ready", 20, 85);

  // Status
  textSize(16);
  if (isProcessing) {
    fill(255, 150, 0);
    text("⏳ Processing embeddings... check console", 20, 120);
  } else if (documentEmbeddings.length > 0) {
    fill(0, 150, 0);
    text(`✅ Ready! ${documentEmbeddings.length} documents embedded`, 20, 120);
  } else {
    fill(150, 0, 0);
    text("❌ Not ready - press 'E' first", 20, 120);
  }

  // Show search results if available
  if (searchResults.length > 0) {
    textSize(18);
    fill(0);
    text(`Search Query: "${searchQuery}"`, 20, 160);

    textSize(14);
    text("Top 3 Results:", 20, 190);

    let yPos = 220;
    for (let i = 0; i < searchResults.length; i++) {
      let result = searchResults[i];

      // Color code by relevance
      if (i === 0) fill(0, 120, 0); // Dark green - best match
      else if (i === 1) fill(0, 80, 0); // Medium green
      else fill(0, 50, 0); // Light green

      text(`${i + 1}. (Score: ${result.similarity.toFixed(3)})`, 40, yPos);
      fill(0);
      text(`   "${result.text}"`, 40, yPos + 20);

      yPos += 60;
    }
  }

  // Show document list at bottom
  textSize(12);
  fill(100);
  text("Available documents:", 20, 420);
  let yPos = 440;
  for (let i = 0; i < min(documents.length, 5); i++) {
    text(`• ${documents[i]}`, 40, yPos);
    yPos += 20;
  }
  if (documents.length > 5) {
    text(`... and ${documents.length - 5} more`, 40, yPos);
  }
}

// ==============================================
// GET EMBEDDING FOR ONE TEXT
// ==============================================

async function getEmbedding(text) {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "snowflake-arctic-embed", // Using snowflake model for search
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

// ==============================================
// GENERATE EMBEDDINGS FOR ALL DOCUMENTS
// This prepares our "database" for searching
// ==============================================

async function generateDocumentEmbeddings() {
  if (isProcessing) {
    console.log("⚠️ Already processing...");
    return;
  }

  isProcessing = true;
  documentEmbeddings = [];

  console.log("📊 Generating embeddings for all documents...");

  for (let i = 0; i < documents.length; i++) {
    try {
      console.log(`Processing document ${i + 1}/${documents.length}: "${documents[i]}"`);
      const embedding = await getEmbedding(documents[i]);
      documentEmbeddings.push({
        text: documents[i],
        embedding: embedding,
      });
      console.log(`✓ Document ${i + 1} embedded`);
    } catch (error) {
      console.error(`✗ Error on document ${i + 1}:`, error);
    }
  }

  isProcessing = false;
  console.log("✅ All embeddings generated!");
  console.log("You can now press 'S' to search");
}

// ==============================================
// CALCULATE COSINE SIMILARITY
// This measures how similar two embeddings are
// Higher score = more similar (0 to 1)
// ==============================================

function cosineSimilarity(vecA, vecB) {
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

  return dotProduct / (magnitudeA * magnitudeB);
}

// ==============================================
// SEARCH FUNCTION
// Find documents most similar to the query
// ==============================================

async function searchDocuments() {
  if (documentEmbeddings.length === 0) {
    console.log("❌ Please generate embeddings first (press 'E')");
    return;
  }

  if (isSearching) {
    console.log("⚠️ Already searching...");
    return;
  }

  // Get search query from user
  searchQuery = prompt("What are you looking for?", "programming languages");

  if (!searchQuery) {
    console.log("Search cancelled");
    return;
  }

  isSearching = true;
  console.log(`🔍 Searching for: "${searchQuery}"`);

  try {
    // Get embedding for the search query
    const queryEmbedding = await getEmbedding(searchQuery);

    // Calculate similarity with each document
    let results = [];
    for (let i = 0; i < documentEmbeddings.length; i++) {
      const docEmbed = documentEmbeddings[i];
      const similarity = cosineSimilarity(queryEmbedding, docEmbed.embedding);

      results.push({
        text: docEmbed.text,
        similarity: similarity,
      });
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    // Take top 3 results
    searchResults = results.slice(0, 3);

    console.log("📋 Top 3 Results:");
    for (let i = 0; i < searchResults.length; i++) {
      console.log(`${i + 1}. (${searchResults[i].similarity.toFixed(3)}) "${searchResults[i].text}"`);
    }
  } catch (error) {
    console.error("Error searching:", error);
  }

  isSearching = false;
}

// ==============================================
// KEY PRESSED
// ==============================================

async function keyPressed() {
  // Press 'E' to generate embeddings for all documents
  if (key === "e" || key === "E") {
    await generateDocumentEmbeddings();
  }

  // Press 'S' to search
  if (key === "s" || key === "S") {
    await searchDocuments();
  }
}

// ==============================================
// HOW TO USE THIS DEMO:
// ==============================================
// 1. Make sure Ollama is running with snowflake-arctic-embed
//    Run: ollama pull snowflake-arctic-embed
// 2. Run this sketch
// 3. Press 'E' to generate embeddings (takes 30-60 seconds)
// 4. Press 'S' to search
// 5. Type your search query (e.g., "pets", "programming", "food")
// 6. See the top 3 most relevant documents!
//
// Try different searches:
// - "animals" → should find cat and dog documents
// - "coding" → should find programming documents
// - "Italian food" → should find pizza
// - "staying fit" → should find exercise
// ==============================================
