export async function generateQuiz(text: string) {
  try {
  // Estimate number of questions: 1 per 200 words, minimum 2
  const numQuestions = Math.max(2, Math.round(text.split(/\s+/).length / 200));
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a quiz generator. Always respond ONLY with a valid JSON array of objects, no explanations, no markdown, no extra text. Each object must have: question, options (array), correctAnswer. All questions must be unique and cover different facts or concepts from the text.`,
          },
          {
            role: "user",
            content: `Read the following text and generate exactly ${numQuestions} unique multiple-choice questions. Each question must be different and cover a different fact or concept from the text. Respond ONLY with a valid JSON array of objects, each with keys: question, options, correctAnswer. Do NOT include any explanations, markdown, or extra text. Format: [ { question: string, options: string[], correctAnswer: string }, ... ]. Text: """${text}"""`,
          },
        ],
        temperature: 0.7,
        max_tokens: 400 * numQuestions,
      }),
    }); 

    if (response.ok) {
      const data = await response.json();
      let raw = data.choices?.[0]?.message?.content || "";
      // Extract JSON array from triple backticks if present
      const match = raw.match(/```json[\s\S]*?(\[[\s\S]*\])[\s\S]*?```|```[\s\S]*?(\[[\s\S]*\])[\s\S]*?```|(\[[\s\S]*\])/);
      let jsonStr = match?.[1] || match?.[2] || match?.[3] || raw;
      try {
        return JSON.parse(jsonStr);
      } catch (err) {
        console.warn("⚠️ OpenAI response not valid JSON:", raw);
        return [{
          question: "OpenAI returned invalid JSON",
          options: [raw],
          correctAnswer: "Retry",
        }];
      }
    } else {
      console.warn("⚠️ OpenAI request failed:", response.status, response.statusText);
      return [{
        question: "OpenAI request failed",
        options: ["Retry"],
        correctAnswer: "Retry",
      }];
    }
  } catch (err) {
    console.warn("⚠️ OpenAI not available:", err);
    return [{
      question: "OpenAI server not available or API key missing.",
      options: ["Retry"],
      correctAnswer: "Retry",
    }];
  }
}
