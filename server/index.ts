import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

// 👇 pull types like this instead of named import
import type { Request, Response } from "express";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Hugging Face API key
const hfApiKey = process.env.HF_API_KEY;
if (!hfApiKey) {
  throw new Error("⚠️ HF_API_KEY is not defined in your .env file");
}
const hf = new HfInference(hfApiKey);

// --- Health check route
app.get("/", (_: Request, res: Response) => {
  res.json({ status: "Backend is running 🚀" });
});

// --- Semantic text splitter
app.post("/api/split-text", async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    // Step 1: Split into sentences
    const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);

    if (sentences.length < 2) {
      return res.json({ chunks: [text] });
    }

    // Step 2: Get embeddings
    const embeddings = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: sentences,
    });

    if (!Array.isArray(embeddings) || !Array.isArray(embeddings[0])) {
      throw new Error("Embeddings response not in expected format");
    }

    // Step 3: Group sentences into chunks
    const chunks: string[] = [];
    let buffer = sentences[0];

    for (let i = 1; i < sentences.length; i++) {
      const prevEmbedding = Array.isArray(embeddings[i - 1]) && (embeddings[i - 1] as any[]).every((x) => typeof x === "number") ? (embeddings[i - 1] as number[]) : undefined;
      const currEmbedding = Array.isArray(embeddings[i]) && (embeddings[i] as any[]).every((x) => typeof x === "number") ? (embeddings[i] as number[]) : undefined;

      if (!prevEmbedding || !currEmbedding) {
        chunks.push(buffer);
        buffer = sentences[i];
        continue;
      }

      const sim = cosineSimilarity(prevEmbedding, currEmbedding);

      if (sim > 0.7) {
        buffer += " " + sentences[i];
      } else {
        chunks.push(buffer);
        buffer = sentences[i];
      }
    }
    chunks.push(buffer);

    res.json({ chunks });
  } catch (err) {
    console.error("❌ Split failed:", err);
    res.status(500).json({ error: "Failed to split text" });
  }
});

// --- Cosine similarity helper
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  const dot = vecA.reduce((sum, val, i) => sum + val * (vecB[i] ?? 0), 0);
  const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
