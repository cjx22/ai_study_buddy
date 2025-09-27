import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import "./Landing.css";

// NOTE: We don't need the 'TextItem' import anymore because the type guard handles it.

// Set the path to the pdf.js worker script (public folder for Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function Landing() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // This function handles the text from the textarea
  const handleSubmit = () => {
    if (text.trim() !== "") {
      navigate("/feed", { state: { content: text } });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setErrorMsg(null);
    console.log("1. File upload triggered.");
    if (!event.target.files) {
      setLoading(false);
      return;
    }
    const file = event.target.files[0];
    if (!file) {
      setLoading(false);
      return;
    }

    try {
      console.log("2. Reading file into buffer...");
      const buffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(buffer);

      console.log("3. Calling pdf.js to get document...");
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      console.log("4. PDF document loaded. Num pages:", pdf.numPages);

      let extractedText = "";
      let pagesWithNoText = 0;
      let ocrText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => ("str" in item ? item.str : ""));
          const pageText = strings.join(" ");
          if (!pageText.trim()) {
            pagesWithNoText++;
            // Try OCR for image-based page
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext("2d");
            await page.render({ canvasContext: context!, viewport, canvas }).promise;
            const dataUrl = canvas.toDataURL();
            try {
              const ocrResult = await Tesseract.recognize(dataUrl, "eng");
              ocrText += ocrResult.data.text + "\n\n";
            } catch (ocrErr) {
              console.error(`OCR failed on page ${i}:`, ocrErr);
              ocrText += `[OCR failed on page ${i}]\n\n`;
            }
          }
          extractedText += pageText + "\n\n";
        } catch (pageErr) {
          console.error(`PDF.js failed on page ${i}:`, pageErr);
          extractedText += `[PDF.js failed on page ${i}]\n\n`;
        }
      }

      console.log("5. Text extraction complete.");

      // Clean up OCR output: remove unnecessary spaces and excessive line breaks
      function cleanOcrText(text: string) {
        // Remove spaces within words (e.g., "t h i s" -> "this")
        text = text.replace(/\b(\w) (\w) (\w)\b/g, (m, a, b, c) => a + b + c);
        // Remove multiple spaces
        text = text.replace(/ +/g, " ");
        // Remove more than two consecutive line breaks
        text = text.replace(/\n{3,}/g, "\n\n");
        // Remove spaces before punctuation
        text = text.replace(/ ([.,!?;:])/g, "$1");
        return text.trim();
      }

      let finalText = extractedText.trim();
      if (pagesWithNoText > 0 && ocrText.trim()) {
        finalText += "\n\n[OCR extracted text:]\n" + cleanOcrText(ocrText.trim());
      }

      setLoading(false);
      if (finalText) {
        console.log("6. Text found, attempting to navigate...");
        navigate("/feed", { state: { content: finalText } });
      } else {
        setErrorMsg("Sorry, could not extract text from this PDF. It may be encrypted, corrupted, or not supported.");
        console.log("Extraction finished, but text was empty.");
      }
    } catch (err) {
      setLoading(false);
      console.error("❌ CAUGHT AN ERROR in the try block:", err);
      const error = err as Error;
      if (error && error.message && error.message.includes("workerSrc")) {
        setErrorMsg("PDF.js worker script could not be loaded. Please check your internet connection or workerSrc path.");
      } else {
        setErrorMsg("Sorry, could not process that PDF. It may be encrypted, corrupted, or not supported.");
      }
    }
  };

  return (
    <div className="landing">
      {/* Background blobs */}
      <div className="blob"></div>
      <div className="blob2"></div>

      {/* Hero Section */}
      <header className="hero">
        <h1>AI Study Buddy</h1>
        <p>
          Upload your notes or paste text to generate personalized quizzes and
          boost your learning.
        </p>

        <div className="input-container">
          <textarea
            placeholder="Paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button className="upload-btn" onClick={handleSubmit}>
            Start Learning
          </button>

          {/* PDF Upload Button */}
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
        {loading && (
          <div style={{ marginTop: "1rem", color: "#3578e5", fontWeight: "bold" }}>
            Processing PDF... Please wait. (OCR may take up to a minute)
          </div>
        )}
        {errorMsg && (
          <div style={{ marginTop: "1rem", color: "#dc3545", fontWeight: "bold" }}>
            {errorMsg}
          </div>
        )}
      </header>
    </div>
  );
}

export default Landing;