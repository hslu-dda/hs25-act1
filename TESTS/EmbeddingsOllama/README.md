# Setting Up Ollama for Text Embeddings

This guide will help you install Ollama and download the AI model needed for this project.

## What is Ollama?

Ollama is a tool that lets you run AI models locally on your computer. We'll use it to convert text into "embeddings" (lists of numbers that represent meaning).

---

## Step 1: Download and Install Ollama

### For Windows:
1. Go to [https://ollama.com/download](https://ollama.com/download)
2. Click the **Download for Windows** button
3. Run the installer (`.exe` file)
4. Follow the installation instructions

### For Mac:
1. Go to [https://ollama.com/download](https://ollama.com/download)
2. Click the **Download for macOS** button
3. Open the `.dmg` file and drag Ollama to your Applications folder
4. Open Ollama from Applications

### For Linux:
Open your terminal and run:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

## Step 2: Verify Ollama is Running

After installation, Ollama should start automatically.

**To check if it's running:**

1. Open your **Terminal** (Mac/Linux) or **Command Prompt** (Windows)
2. Type this command:
   ```bash
   ollama --version
   ```
3. You should see a version number (like `ollama version 0.1.29`)

---

## Step 3: Download the AI Model

We need an **embedding model** to convert text into numbers.

### Recommended Model: all-minilm (Default)

**In your terminal, run:**

```bash
ollama pull all-minilm
```

This will download the model. It might take a few minutes depending on your internet speed.

**You should see progress like this:**
```
pulling manifest
pulling 8934d96d3f08... 100% ▕████████████▏ 23 MB
pulling c71d239df917... 100% ▕████████████▏  103 B
verifying sha256 digest
success
```

### Alternative Models

Choose a different model based on your needs:

| Model | Size | Best For | Command |
|-------|------|----------|---------|
| **all-minilm** | ~23 MB | ✅ **Recommended** - Fast, small, good quality | `ollama pull all-minilm` |
| **nomic-embed-text** | ~274 MB | Better quality, longer texts (up to 8192 tokens) | `ollama pull nomic-embed-text` |
| **mxbai-embed-large** | ~669 MB | Highest quality, best accuracy | `ollama pull mxbai-embed-large` |
| **snowflake-arctic-embed** | ~669 MB | Great for search and retrieval tasks | `ollama pull snowflake-arctic-embed` |

**Which should you choose?**
- **Students/Beginners**: Use `all-minilm` (fastest, smallest)
- **Better results**: Use `nomic-embed-text` (good balance)
- **Best quality**: Use `mxbai-embed-large` (if you have time/space)

**Note:** If you use a different model, update the model name in `sketch.js`:
```javascript
body: JSON.stringify({
  model: "nomic-embed-text",  // Change this line
  prompt: text,
}),
```

---

## System Requirements

Before installing, make sure your computer meets these minimum requirements:

### RAM Requirements (for different model sizes):
- **3B models**: At least 8GB RAM
- **7B models**: At least 8GB RAM (16GB recommended)
- **13B models**: At least 16GB RAM
- **33B models**: At least 32GB RAM
- **70B models**: At least 64GB RAM

**For our embedding models:**
- `all-minilm` (23 MB): Works on any system with 4GB+ RAM
- `nomic-embed-text` (274 MB): Works on any system with 4GB+ RAM
- `mxbai-embed-large` (669 MB): Works on any system with 4GB+ RAM
- `snowflake-arctic-embed` (669 MB): Works on any system with 4GB+ RAM

**Good news!** The embedding models we use are much smaller than language models, so they run smoothly even on modest hardware.

### Other Requirements:
- **CPU**: Any modern processor with at least 4 cores
- **Disk Space**: At least 12GB free space
- **Operating System**: macOS 11+, Ubuntu 18.04+, or Windows 10+ (via WSL2)

---

## Step 4: Test the Model

Let's make sure everything works!

**Run this command in your terminal:**

```bash
ollama run all-minilm "Hello world"
```

If it works, you'll see a bunch of numbers (that's the embedding!). Something like:
```
[0.123, -0.456, 0.789, ...]
```

---

## Step 5: Make Sure Ollama API is Running

The p5.js sketch needs Ollama's API to be accessible at `http://localhost:11434`.

**Ollama's API runs automatically when Ollama is running.**

To verify it's working:
- Open your browser
- Go to: `http://localhost:11434`
- You should see a message: **"Ollama is running"**

---

## Step 6: Run Your p5.js Sketch

Now you're ready!

1. Open your p5.js sketch
2. Make sure `sketch.js` is in your project
3. Make sure your data file is at: `data/combined-data_masterfile.json`
4. Run the sketch
5. Press **'E'** to generate embeddings
6. Press **'S'** to save the results

---

## Troubleshooting

### Problem: "Connection refused" error
**Solution:** Make sure Ollama is running. Restart Ollama or run:
```bash
ollama serve
```

### Problem: Model not found
**Solution:** Make sure you pulled the model:
```bash
ollama pull all-minilm
```

### Problem: Very slow
**Solution:** The first time you use the model, it needs to load into memory. This can take 10-30 seconds. After that, it should be fast!

### Problem: Port 11434 is already in use
**Solution:** Another application is using that port. Either close that application or restart your computer.

---

## Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Ollama Model Library](https://ollama.com/library)
- [What are embeddings?](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)

---

## Quick Command Reference

```bash
# Check Ollama version
ollama --version

# List installed models
ollama list

# Pull a model
ollama pull all-minilm

# Remove a model (if needed)
ollama rm all-minilm

# Start Ollama server manually
ollama serve
```

---

**You're all set!** 🚀 If you have any issues, check the troubleshooting section or ask your instructor for help.