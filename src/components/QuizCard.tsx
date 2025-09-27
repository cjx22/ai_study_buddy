import React, { useState } from "react";
import "./QuizCard.css"; // optional, if you want custom styling

type QuizCardProps = {
  question: string;
  options: string[];
  correctAnswer: string;
};

const QuizCard: React.FC<QuizCardProps> = ({ question, options, correctAnswer }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (option: string) => {
    if (!isAnswered) {
      setSelected(option);
      setIsAnswered(true);
    }
  };

  return (
    <div className="quiz-card">
      <h3>{question}</h3>
      <ul>
        {options.map((option, idx) => (
          <li
            key={idx}
            className={`option ${
              isAnswered
                ? option === correctAnswer
                  ? "correct"
                  : option === selected
                  ? "wrong"
                  : ""
                : ""
            }`}
            onClick={() => handleAnswer(option)}
          >
            {option}
          </li>
        ))}
      </ul>
      {isAnswered && (
        <p>
          {selected === correctAnswer ? "✅ Correct!" : "❌ Try again next time."}
        </p>
      )}
    </div>
  );
};

export default QuizCard;
