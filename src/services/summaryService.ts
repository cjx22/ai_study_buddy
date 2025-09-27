import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateSummary(text: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Summarize text clearly and concisely.",
        },
        {
          role: "user",
          content: `Summarize the following text in 3–5 sentences:\n\n${text}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "No summary generated.";
  } catch (err) {
    console.error("⚠️ Summary failed:", err);
    return "Summary could not be generated.";
  }
}
