import React, { useState } from "react";
import "./QuizCard.css";

interface QuizCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswered?: (isCorrect: boolean) => void;
}

function QuizCard({ question, options, correctAnswer, onAnswered }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (opt: string) => {
    if (!revealed) {
      setSelected(opt);
      setRevealed(true);
      if (typeof onAnswered === "function") {
        onAnswered(opt === correctAnswer);
      }
    }
  };

  return (
    <div className={`quiz-card${revealed ? " revealed" : ""}`}>
      <div className="card-content">
        <h4 className="card-question">{question}</h4>
        <ul className="card-options">
          {options.map((opt, i) => (
            <li
              key={i}
              className={`option${revealed && selected === opt ? (opt === correctAnswer ? " correct" : " wrong") : ""}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
        {revealed && (
          <div className="card-answer">
            {selected === correctAnswer ? (
              <span className="answer-correct">✅ Correct!</span>
            ) : (
              <span className="answer-wrong">❌ Wrong! Correct answer: <b>{correctAnswer}</b></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizCard;
