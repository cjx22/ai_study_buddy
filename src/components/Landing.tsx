import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OpenAI from "openai";
import * as pdfjsLib from "pdfjs-dist";
import "./Landing.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function Landing() {
  const [text, setText] = useState("");
  // Removed unused loading state
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (text.trim() !== "") {
      navigate("/feed", { state: { content: text } });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;

  // Removed setLoading

    try {
      const buffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(buffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) =>
          "str" in item ? item.str : ""
        );
        const pageText = strings.join(" ");

        if (pageText.trim()) {
          extractedText += pageText + "\n\n";
        } else {
          // 👇 fallback to AI vision
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          // Removed unused context variable
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvas, viewport }).promise;
          const dataUrl = canvas.toDataURL("image/png");

          const openai = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
          });

          const resp = await openai.chat.completions.create({
            model: "gpt-4o-mini", // ✅ can handle images
            messages: [
              {
                role: "system",
                content:
                  "You are an OCR assistant. Extract ALL text you can see in this image of a PDF page. Keep it plain, no commentary.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Here is a PDF page image:" },
                  { type: "image_url", image_url: { url: dataUrl } },
                ],
              },
            ],
          });

          extractedText +=
            resp.choices[0]?.message?.content?.trim() ||
            "[AI could not extract text]";
        }
      }

  // Removed setLoading
      if (extractedText.trim()) {
        navigate("/feed", { state: { content: extractedText } });
      } else {
        alert("❌ Could not extract text from this PDF.");
      }
    } catch (err) {
      console.error("PDF extraction failed:", err);
  // Removed setLoading
    }
  };

  return (
    <div className="landing">
      <header className="hero">
        <h1>AI Study Buddy</h1>
        <p>Upload your notes or paste text to generate personalized quizzes.</p>

        <div className="input-container">
          <textarea
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button className="upload-btn" onClick={handleSubmit}>
            Start Learning
          </button>

          <label className="upload-btn">
            Upload PDF
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileUpload}
            />
          </label>
        </div>

  {/* Removed loading UI */}
      </header>
    </div>
  );
}

export default Landing;
