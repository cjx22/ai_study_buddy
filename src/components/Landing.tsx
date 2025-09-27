import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";  // ✅ landing-specific styles

function Landing() {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (text.trim() !== "") {
      navigate("/feed", { state: { content: text } });
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
        </div>
      </header>
    </div>
  );
}

export default Landing;
