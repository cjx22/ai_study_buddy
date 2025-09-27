import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Feed from "./components/Feed";

function App() {
  return (
    <Routes>
      {/* Landing page (hero input) */}
      <Route path="/" element={<Landing />} />

      {/* Feed page (interactive quizzes) */}
      <Route path="/feed" element={<Feed />} />
    </Routes>
  );
}

export default App;
