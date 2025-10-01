import "dotenv/config";
import fs from "fs/promises";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


async function createEmbeddingsFromFile() {
    // 1. Indikatoren-JSON laden
    // Achtung: Die Datei "combined-data.json" muss vorher ins gleiche Verzeichnis kopiert werden
    const file = await fs.readFile("combined-data.json", "utf-8");
    const rawData = JSON.parse(file);
    const rows = Object.values(rawData);

    // 2. Nur die Texte von "Indicator English" extrahieren
    const texts = rows.map(r => r["Indicator English"]);

    // 2. Embeddings erzeugen
    const response = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: texts
    });

    // 4. Embeddings wieder in die Objekte einsetzen
    const enriched = rows.map((row, i) => ({
        ...row,
        embedding: response.data[i].embedding
    }));

    // 4. JSON abspeichern für später (z. B. für p5.js)
    await fs.writeFile("embeddings.json", JSON.stringify(enriched, null, 2));

    
}

createEmbeddingsFromFile();
