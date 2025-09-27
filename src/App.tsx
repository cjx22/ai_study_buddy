import React from "react";
import QuizCard from "./components/QuizCard";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>AI Study Buddy</h1>
      <QuizCard
        question="What is 2 + 2?"
        options={["3", "4", "5", "22"]}
        correctAnswer="4"
      />
      <QuizCard
        question="Which planet is known as the Red Planet?"
        options={["Earth", "Mars", "Jupiter"]}
        correctAnswer="Mars"
      />
    </div>
  );
}

export default App;
