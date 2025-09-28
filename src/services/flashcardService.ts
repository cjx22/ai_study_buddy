// src/services/flashcardService.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // for frontend
});

export async function generateFlashcards(text: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a flashcard generator. Only return valid JSON. No explanations, no markdown.",
        },
        {
          role: "user",
          content: `Read the following text and create 3 flashcards. Each flashcard should have 'front' (a question/prompt) and 'back' (the answer). 
Respond only with a JSON array of objects like this: 
[ { "front": "...", "back": "..." }, { "front": "...", "back": "..." } ].

Text: """${text}"""`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    let raw = response.choices[0]?.message?.content || "";
    const match = raw.match(/\[.*\]/s); // extract JSON array
    if (!match) return [];

    let cards;
    try {
      cards = JSON.parse(match[0]);
    } catch {
      return [];
    }

    // Validate structure
    if (
      Array.isArray(cards) &&
      cards.every(
        (c) =>
          typeof c === "object" &&
          typeof c.front === "string" &&
          typeof c.back === "string"
      )
    ) {
      return cards;
    }
    return [];
  } catch (err) {
    console.error("⚠️ Flashcard generation failed:", err);
    return [];
  }
}
